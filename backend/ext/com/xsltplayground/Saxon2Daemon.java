package com.xsltplayground;

import com.google.gson.*;
import com.sun.net.httpserver.*;
import com.xsltplayground.ext.CustomFunctions;
import net.sf.saxon.lib.FeatureKeys;
import net.sf.saxon.s9api.*;

import javax.xml.transform.stream.StreamSource;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/**
 * XSLT 2.0 daemon using Saxon HE 9.x.
 * Runs on port 8083. Compiled and run against Saxon 9 JARs.
 */
public class Saxon2Daemon {

    static final Processor PROCESSOR;
    static final Processor TRACE_PROCESSOR;
    private static final Gson GSON = new Gson();

    static {
        PROCESSOR = new Processor(false);
        CustomFunctions.registerAll(PROCESSOR);

        TRACE_PROCESSOR = new Processor(false);
        TRACE_PROCESSOR.setConfigurationProperty(FeatureKeys.OPTIMIZATION_LEVEL, "0");
        CustomFunctions.registerAll(TRACE_PROCESSOR);

        String warmupXslt =
            "<xsl:stylesheet version='2.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
            "<xsl:template match='/'><out/></xsl:template></xsl:stylesheet>";
        String warmupXml = "<root/>";
        for (Processor proc : new Processor[]{PROCESSOR, TRACE_PROCESSOR}) {
            try {
                XsltCompiler c = proc.newXsltCompiler();
                XsltExecutable exec = c.compile(new StreamSource(new StringReader(warmupXslt)));
                XsltTransformer t = exec.load();
                XdmNode doc = proc.newDocumentBuilder()
                        .build(new StreamSource(new StringReader(warmupXml)));
                t.setInitialContextNode(doc);
                Serializer ser = proc.newSerializer(new StringWriter());
                t.setDestination(ser);
                t.transform();
            } catch (Exception e) {
                System.err.println("Saxon2Daemon warm-up warning: " + e.getMessage());
            }
        }
        System.out.println("Saxon2Daemon: warm-up complete.");
    }

    public static void main(String[] args) throws Exception {
        int port = 8083;
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 32);
        server.createContext("/transform", new TransformHandler());
        server.createContext("/health", exchange -> {
            byte[] resp = "ok".getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "text/plain");
            exchange.sendResponseHeaders(200, resp.length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(resp); }
        });
        int threads = Math.max(2, Runtime.getRuntime().availableProcessors());
        server.setExecutor(Executors.newFixedThreadPool(threads));
        server.start();
        System.out.println("Saxon2Daemon ready on :" + port + " (threads=" + threads + ")");
    }

    static class TransformHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            if (!exchange.getRequestMethod().equalsIgnoreCase("POST")) {
                exchange.sendResponseHeaders(405, -1);
                exchange.close();
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8);
            JsonObject response = new JsonObject();
            int status = 200;

            try {
                JsonObject req = GSON.fromJson(body, JsonObject.class);

                String xslt   = req.has("xslt")   ? req.get("xslt").getAsString()   : "";
                String source = req.has("source")  ? req.get("source").getAsString() : "";
                boolean trace = req.has("trace") && req.get("trace").getAsBoolean();

                Map<String, String> params     = jsonObjectToMap(req, "parameters");
                Map<String, String> fileParams = jsonObjectToMap(req, "fileParameters");

                Processor proc = trace ? TRACE_PROCESSOR : PROCESSOR;

                ByteArrayOutputStream traceBuf = new ByteArrayOutputStream();
                PrintStream traceSink = new PrintStream(traceBuf, true, StandardCharsets.UTF_8);

                XsltCompiler compiler = proc.newXsltCompiler();
                compiler.setErrorReporter(
                    new Runner.DeduplicatingErrorReporter(compiler.getErrorReporter()));

                boolean instrumentationEnabled = false;
                if (trace) {
                    instrumentationEnabled = Runner.enableCompileWithTracing(compiler);
                }

                XsltExecutable exec;
                try {
                    exec = compiler.compile(new StreamSource(new StringReader(xslt)));
                } catch (SaxonApiException e) {
                    if (trace && instrumentationEnabled) {
                        compiler = proc.newXsltCompiler();
                        compiler.setErrorReporter(
                            new Runner.DeduplicatingErrorReporter(compiler.getErrorReporter()));
                        exec = compiler.compile(new StreamSource(new StringReader(xslt)));
                    } else {
                        throw e;
                    }
                }

                XsltTransformer transformer = exec.load();

                if (trace) {
                    Runner.attachTraceListener(proc, transformer, traceSink);
                }

                if (source != null && !source.isEmpty()) {
                    XdmNode doc = proc.newDocumentBuilder()
                            .build(new StreamSource(new StringReader(source)));
                    transformer.setInitialContextNode(doc);
                }

                for (Map.Entry<String, String> e : params.entrySet()) {
                    transformer.setParameter(new QName(e.getKey()), new XdmAtomicValue(e.getValue()));
                }

                for (Map.Entry<String, String> e : fileParams.entrySet()) {
                    String val = e.getValue().trim();
                    if (val.startsWith("<")) {
                        XdmNode node = proc.newDocumentBuilder()
                                .build(new StreamSource(new StringReader(val)));
                        transformer.setParameter(new QName(e.getKey()), node);
                    } else {
                        transformer.setParameter(new QName(e.getKey()), new XdmAtomicValue(val));
                    }
                }

                StringWriter resultWriter = new StringWriter();
                Serializer ser = proc.newSerializer(resultWriter);
                transformer.setDestination(ser);
                transformer.transform();

                traceSink.flush();
                response.addProperty("result", resultWriter.toString());
                response.addProperty("traceText", trace ? traceBuf.toString(StandardCharsets.UTF_8) : "");

            } catch (SaxonApiException e) {
                response.addProperty("error", e.getMessage() != null ? e.getMessage() : e.toString());
                status = 400;
            } catch (Exception e) {
                response.addProperty("error", e.toString());
                status = 500;
            }

            byte[] respBytes = GSON.toJson(response).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, respBytes.length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(respBytes); }
        }

        private Map<String, String> jsonObjectToMap(JsonObject req, String key) {
            Map<String, String> result = new LinkedHashMap<>();
            if (req.has(key) && req.get(key).isJsonObject()) {
                for (Map.Entry<String, JsonElement> e : req.getAsJsonObject(key).entrySet()) {
                    result.put(e.getKey(), e.getValue().getAsString());
                }
            }
            return result;
        }
    }
}
