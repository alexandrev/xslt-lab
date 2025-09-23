package com.xsltplayground;

import com.xsltplayground.ext.CustomFunctions;
import net.sf.saxon.s9api.*;

import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.nio.file.Files;
import java.util.LinkedHashMap;
import java.util.Map;

public class Runner {
    public static void main(String[] args) {
        try {
            Map<String, String> rawParams = new LinkedHashMap<>();
            Map<String, String> fileParams = new LinkedHashMap<>();
            String sourcePath = null;
            String xslPath = null;
            String outPath = null;
            boolean trace = false;
            boolean cliTrace = false; // -T flag (parsed but not used directly)
            String traceOutPath = null;

            for (String a : args) {
                if (a.startsWith("-s:")) {
                    sourcePath = a.substring(3);
                } else if (a.startsWith("-xsl:")) {
                    xslPath = a.substring(5);
                } else if (a.startsWith("-o:")) {
                    outPath = a.substring(3);
                } else if (a.startsWith("+")) {
                    // +name=/path/to/file (file-based param, typically XML)
                    int eq = a.indexOf('=');
                    if (eq > 1) {
                        String name = a.substring(1, eq);
                        String path = a.substring(eq + 1);
                        fileParams.put(name, path);
                    }
                } else if (a.equals("-trace")) {
                    trace = true;
                } else if (a.equals("-T")) {
                    cliTrace = true;
                } else if (a.startsWith("-traceout:")) {
                    traceOutPath = a.substring("-traceout:".length());
                } else if (a.contains("=")) {
                    int eq = a.indexOf('=');
                    String name = a.substring(0, eq);
                    String val = a.substring(eq + 1);
                    rawParams.put(name, val);
                }
            }

            if (xslPath == null || outPath == null) {
                System.err.println("Missing -xsl: or -o: arguments");
                System.exit(2);
            }

            Processor proc = new Processor(false);
            CustomFunctions.registerAll(proc);

            XsltCompiler compiler = proc.newXsltCompiler();
            XsltExecutable exec;
            if (trace) {
                // Transform the stylesheet to inject xsl:message after each xsl:variable.
                // Messages are written in a block form so backend can capture multiline XML:
                // TRACE_VAR_START|name \n [serialized value or string value] \n TRACE_VAR_END
                Processor iproc = new Processor(false);
                XsltCompiler icomp = iproc.newXsltCompiler();
                String instrumenter =
                        "<xsl:stylesheet version=\"2.0\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\">" +
                        "  <xsl:output method=\"xml\"/>" +
                        "  <xsl:strip-space elements=\"*\"/>" +
                        "  <xsl:template match=\"@*|node()\">" +
                        "    <xsl:copy>" +
                        "      <xsl:apply-templates select=\"@*|node()\"/>" +
                        "    </xsl:copy>" +
                        "  </xsl:template>" +
                        // Instrument top-level variables
                        "  <xsl:template match=\"/xsl:stylesheet/xsl:variable | /xsl:transform/xsl:variable\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\">" +
                        "    <xsl:copy>" +
                        "      <xsl:apply-templates select=\"@*|node()\"/>" +
                        "    </xsl:copy>" +
                        "    <xsl:message>" +
                        "      <xsl:text>TRACE_VAR_START|</xsl:text>" +
                        "      <xsl:value-of select=\"@name\"/>" +
                        "      <xsl:text>&#10;</xsl:text>" +
                        "      <xsl:element name=\"xsl:copy-of\" namespace=\"http://www.w3.org/1999/XSL/Transform\">" +
                        "        <xsl:attribute name=\"select\">$<xsl:value-of select=\"@name\"/></xsl:attribute>" +
                        "      </xsl:element>" +
                        "      <xsl:text>&#10;TRACE_VAR_END</xsl:text>" +
                        "    </xsl:message>" +
                        "  </xsl:template>" +
                        // Instrument non-top-level variables
                        "  <xsl:template match=\"xsl:variable\" xmlns:xsl=\"http://www.w3.org/1999/XSL/Transform\">" +
                        "    <xsl:copy>" +
                        "      <xsl:apply-templates select=\"@*|node()\"/>" +
                        "    </xsl:copy>" +
                        "    <xsl:message>" +
                        "      <xsl:text>TRACE_VAR_START|</xsl:text>" +
                        "      <xsl:value-of select=\"@name\"/>" +
                        "      <xsl:text>&#10;</xsl:text>" +
                        "      <xsl:element name=\"xsl:copy-of\" namespace=\"http://www.w3.org/1999/XSL/Transform\">" +
                        "        <xsl:attribute name=\"select\">$<xsl:value-of select=\"@name\"/></xsl:attribute>" +
                        "      </xsl:element>" +
                        "      <xsl:text>&#10;TRACE_VAR_END</xsl:text>" +
                        "    </xsl:message>" +
                        "  </xsl:template>" +
                        "</xsl:stylesheet>";

                XsltExecutable instExec = icomp.compile(new StreamSource(new java.io.StringReader(instrumenter)));
                XsltTransformer instTr = instExec.load();
                XdmNode styleDoc = iproc.newDocumentBuilder().build(new StreamSource(new File(xslPath)));
                instTr.setInitialContextNode(styleDoc);
                java.io.StringWriter sw = new java.io.StringWriter();
                Serializer out = iproc.newSerializer(sw);
                instTr.setDestination(out);
                instTr.transform();
                String instrumented = sw.toString();
                exec = compiler.compile(new StreamSource(new java.io.StringReader(instrumented)));
            } else {
                exec = compiler.compile(new StreamSource(new File(xslPath)));
            }
            XsltTransformer transformer = exec.load();

            // If a trace output path is provided, tee System.err to that file so that
            // xsl:message (and other diagnostics) also land in the trace file.
            java.io.PrintStream originalErr = System.err;
            java.io.FileOutputStream traceFos = null;
            java.io.PrintStream tracePs = null;
            java.io.PrintStream teeErr = null;
            if (traceOutPath != null && !traceOutPath.isEmpty()) {
                try {
                    traceFos = new java.io.FileOutputStream(new File(traceOutPath), true);
                    tracePs = new java.io.PrintStream(traceFos, true, "UTF-8");
                    final java.io.PrintStream err1 = originalErr;
                    final java.io.PrintStream err2 = tracePs;
                    java.io.OutputStream tee = new java.io.OutputStream() {
                        @Override public void write(int b) throws java.io.IOException { err1.write(b); err2.write(b); }
                        @Override public void write(byte[] b) throws java.io.IOException { err1.write(b); err2.write(b); }
                        @Override public void write(byte[] b, int off, int len) throws java.io.IOException { err1.write(b, off, len); err2.write(b, off, len); }
                        @Override public void flush() throws java.io.IOException { err1.flush(); err2.flush(); }
                        @Override public void close() throws java.io.IOException { err2.close(); err1.flush(); }
                    };
                    teeErr = new java.io.PrintStream(tee, true, "UTF-8");
                    System.setErr(teeErr);
                } catch (Exception e) {
                    // If we fail to set up the trace file, continue without it
                    e.printStackTrace(originalErr);
                }
            }

            if (sourcePath != null && !sourcePath.isEmpty()) {
                Source src = new StreamSource(new File(sourcePath));
                XdmNode doc = proc.newDocumentBuilder().build(src);
                transformer.setInitialContextNode(doc);
            }

            // Parameters as strings
            for (Map.Entry<String, String> e : rawParams.entrySet()) {
                transformer.setParameter(new QName(e.getKey()), new XdmAtomicValue(e.getValue()));
            }
            // File parameters (parse as XML if it looks like XML; else pass as string)
            for (Map.Entry<String, String> e : fileParams.entrySet()) {
                String name = e.getKey();
                String path = e.getValue();
                String content = new String(Files.readAllBytes(new File(path).toPath()))
                        .trim();
                if (content.startsWith("<")) {
                    XdmNode node = proc.newDocumentBuilder().build(new StreamSource(new File(path)));
                    transformer.setParameter(new QName(name), node);
                } else {
                    transformer.setParameter(new QName(name), new XdmAtomicValue(content));
                }
            }

            Serializer ser = proc.newSerializer(new File(outPath));
            transformer.setDestination(ser);
            try {
                transformer.transform();
            } finally {
                // Restore System.err and close the trace stream if used
                if (teeErr != null) {
                    System.setErr(originalErr);
                    try { teeErr.flush(); } catch (Exception ignored) {}
                }
                if (tracePs != null) {
                    try { tracePs.flush(); } catch (Exception ignored) {}
                    try { tracePs.close(); } catch (Exception ignored) {}
                }
                if (traceFos != null) {
                    try { traceFos.close(); } catch (Exception ignored) {}
                }
            }
        } catch (Exception e) {
            e.printStackTrace(System.err);
            System.exit(1);
        }
    }
}
