package com.xsltplayground;

import com.google.gson.*;
import com.sun.net.httpserver.*;
import com.xsltplayground.ext.CustomFunctions;
import net.sf.saxon.s9api.*;

import javax.xml.transform.ErrorListener;
import javax.xml.transform.Result;
import javax.xml.transform.TransformerException;
import javax.xml.transform.stream.StreamResult;
import javax.xml.transform.stream.StreamSource;
import net.sf.saxon.lib.OutputURIResolver;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/**
 * XSLT 2.0 daemon using Saxon HE 9.6 — the last Saxon release focused on
 * XSLT 2.0. Compiled and run with Saxon 9.6 JARs only (no Runner dependency
 * since ErrorReporter / XmlProcessingError don't exist in Saxon 9.6).
 * Runs on port 8083.
 */
public class Saxon2Daemon {

    static final Processor PROCESSOR;
    private static final Gson GSON = new Gson();

    static {
        PROCESSOR = new Processor(false);
        CustomFunctions.registerAll(PROCESSOR);

        // Warm up
        String warmupXslt =
            "<xsl:stylesheet version='2.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
            "<xsl:template match='/'><out/></xsl:template></xsl:stylesheet>";
        try {
            XsltCompiler c = PROCESSOR.newXsltCompiler();
            XsltExecutable exec = c.compile(new StreamSource(new StringReader(warmupXslt)));
            XsltTransformer t = exec.load();
            XdmNode doc = PROCESSOR.newDocumentBuilder()
                    .build(new StreamSource(new StringReader("<root/>")));
            t.setInitialContextNode(doc);
            Serializer ser = PROCESSOR.newSerializer(new StringWriter());
            t.setDestination(ser);
            t.transform();
        } catch (Exception e) {
            System.err.println("Saxon2Daemon warm-up warning: " + e.getMessage());
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

                Map<String, String> params     = jsonObjectToMap(req, "parameters");
                Map<String, String> fileParams = jsonObjectToMap(req, "fileParameters");

                // Saxon 9.6 uses JAXP ErrorListener (no ErrorReporter API)
                StringBuilder warnings = new StringBuilder();
                ErrorListener errorListener = new ErrorListener() {
                    @Override public void warning(TransformerException e) {
                        warnings.append("Warning: ").append(e.getMessage()).append("\n");
                    }
                    @Override public void error(TransformerException e) throws TransformerException { throw e; }
                    @Override public void fatalError(TransformerException e) throws TransformerException { throw e; }
                };

                XsltCompiler compiler = PROCESSOR.newXsltCompiler();
                compiler.setErrorListener(errorListener);

                XsltExecutable exec = compiler.compile(new StreamSource(new StringReader(xslt)));
                XsltTransformer transformer = exec.load();

                if (source != null && !source.isEmpty()) {
                    XdmNode doc = PROCESSOR.newDocumentBuilder()
                            .build(new StreamSource(new StringReader(source)));
                    transformer.setInitialContextNode(doc);
                }

                for (Map.Entry<String, String> e : params.entrySet()) {
                    transformer.setParameter(new QName(e.getKey()), new XdmAtomicValue(e.getValue()));
                }

                for (Map.Entry<String, String> e : fileParams.entrySet()) {
                    String val = e.getValue().trim();
                    if (val.startsWith("<")) {
                        XdmNode node = PROCESSOR.newDocumentBuilder()
                                .build(new StreamSource(new StringReader(val)));
                        transformer.setParameter(new QName(e.getKey()), node);
                    } else {
                        transformer.setParameter(new QName(e.getKey()), new XdmAtomicValue(val));
                    }
                }

                // Capture secondary documents produced by xsl:result-document (Saxon 9.6 API)
                Map<String, StringWriter> secondaryWriters = new LinkedHashMap<>();
                transformer.getUnderlyingController().setOutputURIResolver(new OutputURIResolver() {
                    @Override
                    public OutputURIResolver newInstance() { return this; }
                    @Override
                    public Result resolve(String href, String base) throws TransformerException {
                        String key = href != null ? href : "secondary-" + secondaryWriters.size();
                        StringWriter sw = new StringWriter();
                        secondaryWriters.put(key, sw);
                        StreamResult sr = new StreamResult(sw);
                        sr.setSystemId(key);
                        return sr;
                    }
                    @Override
                    public void close(Result result) throws TransformerException {}
                });

                StringWriter resultWriter = new StringWriter();
                Serializer ser = PROCESSOR.newSerializer(resultWriter);
                transformer.setDestination(ser);
                transformer.transform();

                response.addProperty("result", resultWriter.toString());
                response.addProperty("traceText", warnings.toString());

                if (!secondaryWriters.isEmpty()) {
                    JsonObject secondary = new JsonObject();
                    for (Map.Entry<String, StringWriter> e : secondaryWriters.entrySet()) {
                        secondary.addProperty(e.getKey(), e.getValue().toString());
                    }
                    response.add("secondaryResults", secondary);
                }

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
