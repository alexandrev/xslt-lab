package com.xsltplayground;

import com.google.gson.*;
import com.sun.net.httpserver.*;

import javax.xml.transform.*;
import javax.xml.transform.stream.*;
import java.io.*;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.concurrent.*;

/**
 * XSLT 1.0 daemon using the JDK's built-in XSLT processor (XSLTC / Xalan-J).
 * Runs on port 8082. No Saxon dependency.
 */
public class XalanDaemon {

    private static final Gson GSON = new Gson();
    private static final int PORT = 8082;

    static {
        // Force JDK built-in XSLTC (not Saxon, which might be on the classpath)
        System.setProperty("javax.xml.transform.TransformerFactory",
                "com.sun.org.apache.xalan.internal.xsltc.trax.TransformerFactoryImpl");

        // Warm up
        try {
            TransformerFactory.newInstance().newTemplates(new StreamSource(new StringReader(
                    "<xsl:stylesheet version='1.0' xmlns:xsl='http://www.w3.org/1999/XSL/Transform'>" +
                    "<xsl:template match='/'><out/></xsl:template></xsl:stylesheet>")));
        } catch (Exception e) {
            System.err.println("XalanDaemon warm-up warning: " + e.getMessage());
        }
        System.out.println("XalanDaemon: warm-up complete.");
    }

    public static void main(String[] args) throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", PORT), 32);
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
        System.out.println("XalanDaemon ready on :" + PORT + " (threads=" + threads + ")");
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

                // Collect warnings
                StringBuilder warnings = new StringBuilder();
                ErrorListener errorListener = new ErrorListener() {
                    @Override public void warning(TransformerException e) {
                        warnings.append("Warning: ").append(e.getMessage()).append("\n");
                    }
                    @Override public void error(TransformerException e) throws TransformerException { throw e; }
                    @Override public void fatalError(TransformerException e) throws TransformerException { throw e; }
                };

                TransformerFactory factory = TransformerFactory.newInstance();
                factory.setErrorListener(errorListener);
                Templates templates = factory.newTemplates(new StreamSource(new StringReader(xslt)));
                Transformer transformer = templates.newTransformer();
                transformer.setErrorListener(errorListener);

                for (Map.Entry<String, String> e : params.entrySet()) {
                    transformer.setParameter(e.getKey(), e.getValue());
                }
                // File params: XSLT 1.0 doesn't support node-typed params natively — pass as string
                for (Map.Entry<String, String> e : fileParams.entrySet()) {
                    transformer.setParameter(e.getKey(), e.getValue());
                }

                // XSLT 1.0 always requires a source document (no xsl:initial-template)
                String src = (source != null && !source.isEmpty()) ? source : "<root/>";
                StringWriter resultWriter = new StringWriter();
                transformer.transform(new StreamSource(new StringReader(src)), new StreamResult(resultWriter));

                response.addProperty("result", resultWriter.toString());
                response.addProperty("traceText", warnings.toString());

            } catch (TransformerException e) {
                response.addProperty("error", formatError(e));
                status = 400;
            } catch (Exception e) {
                response.addProperty("error", e.getMessage() != null ? e.getMessage() : e.toString());
                status = 500;
            }

            byte[] respBytes = GSON.toJson(response).getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(status, respBytes.length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(respBytes); }
        }

        private static String formatError(TransformerException e) {
            SourceLocator loc = e.getLocator();
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            if (loc != null && loc.getLineNumber() > 0) {
                return "Error at line " + loc.getLineNumber() +
                       ", column " + loc.getColumnNumber() + ": " + msg;
            }
            return msg;
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
