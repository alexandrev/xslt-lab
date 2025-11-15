package com.xsltplayground;

import com.xsltplayground.ext.CustomFunctions;
import net.sf.saxon.Controller;
import net.sf.saxon.lib.ErrorReporter;
import net.sf.saxon.om.GroundedValue;
import net.sf.saxon.om.Item;
import net.sf.saxon.om.NodeInfo;
import net.sf.saxon.om.Sequence;
import net.sf.saxon.om.SequenceIterator;
import net.sf.saxon.om.StandardNames;
import net.sf.saxon.om.StructuredQName;
import net.sf.saxon.s9api.*;
import net.sf.saxon.lib.FeatureKeys;
import net.sf.saxon.s9api.QName;
import net.sf.saxon.s9api.XmlProcessingError;
import net.sf.saxon.value.EmptySequence;
import net.sf.saxon.value.SequenceExtent;

import javax.xml.transform.Source;
import javax.xml.transform.stream.StreamSource;
import java.io.File;
import java.io.PrintStream;
import java.io.StringWriter;
import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.IdentityHashMap;
import java.util.concurrent.ConcurrentHashMap;

public class Runner {
    private static final boolean TRACE_DEBUG =
            Boolean.parseBoolean(System.getProperty("xslt.trace.debug", "false")) ||
                    "true".equalsIgnoreCase(System.getenv("XSLT_TRACE_DEBUG"));

    private static final Set<Integer> loggedMapIds = ConcurrentHashMap.newKeySet();

    private static void diag(String message) {
        if (TRACE_DEBUG && message != null) {
            System.err.println("TRACE_DIAG: " + message);
        }
    }

    private static Set<Object> newIdentitySet() {
        return Collections.newSetFromMap(new IdentityHashMap<>());
    }

    private static String preview(String value) {
        if (value == null) {
            return "null";
        }
        String singleLine = value.replace('\n', ' ').replace('\r', ' ');
        if (singleLine.length() > 180) {
            return singleLine.substring(0, 177) + "...";
        }
        return singleLine;
    }

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
            if (trace) {
                proc.setConfigurationProperty(FeatureKeys.OPTIMIZATION_LEVEL, "0");
            }
            CustomFunctions.registerAll(proc);

            XsltCompiler compiler = proc.newXsltCompiler();
            boolean instrumentationEnabled = false;
            if (trace) {
                ErrorReporter baseReporter = compiler.getErrorReporter();
                compiler.setErrorReporter(new DeduplicatingErrorReporter(baseReporter));
                instrumentationEnabled = enableCompileWithTracing(compiler);
                if (TRACE_DEBUG) {
                    System.err.println("TRACE_DEBUG instrumentation requested, enableCompileWithTracing=" + instrumentationEnabled);
                }
            }

            XsltExecutable exec;
            try {
                exec = compiler.compile(new StreamSource(new File(xslPath)));
            } catch (SaxonApiException e) {
                if (trace && instrumentationEnabled) {
                    System.err.println("Warning: trace instrumentation failed; recompiling without tracing. " + e.getMessage());
                    instrumentationEnabled = false;
                    compiler = proc.newXsltCompiler();
                    exec = compiler.compile(new StreamSource(new File(xslPath)));
                    if (TRACE_DEBUG) {
                        System.err.println("TRACE_DEBUG recompilation without instrumentation");
                    }
                } else {
                    throw e;
                }
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

            boolean traceActive = trace && instrumentationEnabled;
            if (TRACE_DEBUG) {
                System.err.println("TRACE_DEBUG traceActive=" + traceActive);
            }
            if (traceActive) {
                attachTraceListener(proc, transformer, System.err);
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

    private static boolean enableCompileWithTracing(XsltCompiler compiler) {
        try {
            compiler.setCompileWithTracing(true);
            return true;
        } catch (Throwable primary) {
            try {
                Method m = compiler.getClass().getMethod("setCompileWithTracing", boolean.class);
                m.setAccessible(true);
                m.invoke(compiler, true);
                return true;
            } catch (Exception ignored) {
                return false;
            }
        }
    }

    private static final class DeduplicatingErrorReporter implements ErrorReporter {
        private final ErrorReporter downstream;
        private final Set<String> seen = ConcurrentHashMap.newKeySet();

        DeduplicatingErrorReporter(ErrorReporter downstream) {
            this.downstream = downstream;
        }

        @Override
        public void report(XmlProcessingError error) {
            if (error == null) {
                return;
            }
            if (error.isWarning()) {
                if (shouldSuppress(error)) {
                    return;
                }
                String key = buildKey(error);
                if (!seen.add(key)) {
                    return;
                }
            }
            if (downstream != null) {
                downstream.report(error);
            } else if (error.getMessage() != null) {
                System.err.println(error.getMessage());
            }
        }

        private boolean shouldSuppress(XmlProcessingError error) {
            QName code = error.getErrorCode();
            String local = code != null ? code.getLocalName() : null;
            return "SXWN9026".equals(local);
        }

        private String buildKey(XmlProcessingError error) {
            StringBuilder sb = new StringBuilder();
            QName code = error.getErrorCode();
            if (code != null) {
                sb.append(code.toString());
            }
            sb.append('|');
            if (error.getLocation() != null) {
                sb.append(error.getLocation().toString());
            }
            sb.append('|');
            String message = error.getMessage();
            if (message != null) {
                sb.append(message);
            }
            return sb.toString();
        }
    }

    private static void attachTraceListener(Processor processor, XsltTransformer transformer, PrintStream sink) {
        try {
            Controller controller = transformer.getUnderlyingController();
            if (controller == null) {
                return;
            }
            ClassLoader loader = controller.getClass().getClassLoader();
            Class<?> traceListenerClass = Class.forName("net.sf.saxon.lib.TraceListener", false, loader);
            InvocationHandler handler = new VariableTraceListenerProxy(processor, transformer, sink);
            Object listener = Proxy.newProxyInstance(loader, new Class<?>[]{traceListenerClass}, handler);

            if (!invokeTraceHook(controller, "addTraceListener", traceListenerClass, listener)) {
                invokeTraceHook(controller, "setTraceListener", traceListenerClass, listener);
            }
        } catch (Throwable ignored) {
            // If tracing cannot be attached we simply carry on without trace output.
        }
    }

    private static boolean invokeTraceHook(Controller controller, String methodName, Class<?> listenerClass, Object listener) {
        try {
            Method m = controller.getClass().getMethod(methodName, listenerClass);
            m.setAccessible(true);
            m.invoke(controller, listener);
            return true;
        } catch (Exception ignored) {
            return false;
        }
    }

    private static final class VariableTraceListenerProxy implements InvocationHandler {
        private final Processor processor;
        private final PrintStream out;
        private final XsltTransformer transformer;
        private final Deque<Frame> stack = new ArrayDeque<>();
        private int debugCounter = 0;

        VariableTraceListenerProxy(Processor processor, XsltTransformer transformer, PrintStream out) {
            this.processor = processor;
            this.transformer = transformer;
            this.out = out;
        }

        @Override
        public Object invoke(Object proxy, Method method, Object[] args) {
            String name = method.getName();
            if ("close".equals(name)) {
                stack.clear();
                return null;
            }
            if ("enter".equals(name)) {
                Object info = args != null && args.length > 0 ? args[0] : null;
                Object properties = args != null && args.length > 1 ? args[1] : null;
                Object context = args != null && args.length > 2 ? args[2] : null;
                debugEvent("enter", info);
                handleEnter(info, properties, context);
                return null;
            }
            if ("leave".equals(name)) {
                Object info = args != null && args.length > 0 ? args[0] : null;
                Object properties = args != null && args.length > 1 ? args[1] : null;
                Object context = args != null && args.length > 2 ? args[2] : null;
                debugEvent("leave", info);
                handleLeave(info, properties, context);
                return null;
            }
            if ("open".equals(name) || "startCurrentItem".equals(name) || "endCurrentItem".equals(name)) {
                return null;
            }
            return null;
        }

        private void handleEnter(Object instructionInfo, Object properties, Object context) {
            if (!isVariable(instructionInfo)) {
                return;
            }
            Frame frame = new Frame();
            frame.instruction = instructionInfo;
            frame.name = getVariableName(instructionInfo);
            frame.context = context;
            frame.properties = properties;
            stack.push(frame);
            printDebug("enter", frame.name);
        }

        private void handleLeave(Object instructionInfo, Object properties, Object context) {
            if (!isVariable(instructionInfo)) {
                return;
            }
            Frame frame = stack.isEmpty() ? null : stack.pop();
            if (frame == null) {
                frame = new Frame();
                frame.instruction = instructionInfo;
            }
            if (frame.name == null) {
                frame.name = getVariableName(instructionInfo);
            }
            Object effectiveProperties = properties != null ? properties : frame.properties;
            if (context == null) {
                context = frame.context;
            }
            if (context == null && effectiveProperties instanceof Map) {
                context = extractContextFromProperties((Map<?, ?>) effectiveProperties);
            }
            if (context != null) {
                Runner.diag("handleLeave context class=" + context.getClass().getName());
            } else {
                Runner.diag("handleLeave context is null");
            }
            if (effectiveProperties instanceof Map) {
                logContextMap((Map<?, ?>) effectiveProperties);
            }
            StructuredQName name = frame.name;
            if (name == null) {
                return;
            }

            TraceCapture capture = extractTraceValue(instructionInfo, context, effectiveProperties, name);
            String displayValue = capture.sequence != null ? formatSequence(capture.sequence) : null;
            if ((displayValue == null || displayValue.isEmpty()) && capture.fallback != null) {
                displayValue = capture.fallback;
            }
            if (displayValue == null) {
                displayValue = "";
            }

            Runner.diag("emit variable " + name.getDisplayName() + " value length=" + displayValue.length());

            out.println("TRACE_VAR_START|" + name.getDisplayName());
            if (!displayValue.isEmpty()) {
                out.println(displayValue);
            }
            out.println("TRACE_VAR_END");
            printDebug("leave", name);
        }

        private TraceCapture extractTraceValue(Object instructionInfo, Object context, Object properties, StructuredQName name) {
            TraceCapture capture = new TraceCapture();
            String displayName = name != null ? name.getDisplayName() : "(unknown)";
            Object candidate = firstCandidate(instructionInfo);
            if (candidate != null) {
                TraceCapture candidateCapture = captureFromResult(candidate, context);
                if (candidateCapture.sequence != null) {
                    Runner.diag("firstCandidate sequence for " + displayName + " via " + candidate.getClass().getName());
                    capture.sequence = materialize(candidateCapture.sequence);
                    return capture;
                }
                if (candidateCapture.fallback != null) {
                    Runner.diag("firstCandidate fallback for " + displayName + " = " + preview(candidateCapture.fallback));
                    capture.fallback = candidateCapture.fallback;
                }
            }

            Integer slot = extractSlot(instructionInfo);
            if (slot != null) {
                Sequence seq = evaluateSlot(context, slot.intValue());
                if (seq != null) {
                    Runner.diag("evaluateSlot(" + slot + ") sequence for " + displayName);
                    capture.sequence = materialize(seq);
                    return capture;
                } else {
                    Runner.diag("evaluateSlot(" + slot + ") returned null for " + displayName);
                }
            }

            if (name != null) {
                TraceCapture paramCapture = captureParameterValue(name);
                if (paramCapture.sequence != null) {
                    Runner.diag("transformer parameter hit for " + name.getDisplayName());
                    capture.sequence = materialize(paramCapture.sequence);
                    return capture;
                }
                if (capture.fallback == null && paramCapture.fallback != null) {
                    Runner.diag("transformer parameter fallback for " + name.getDisplayName() + " = " + preview(paramCapture.fallback));
                    capture.fallback = paramCapture.fallback;
                }
                TraceCapture byName = evaluateByName(context, properties, name);
                if (byName.sequence != null) {
                    Runner.diag("evaluateByName sequence for " + displayName);
                    capture.sequence = materialize(byName.sequence);
                    return capture;
                }
                if (capture.fallback == null && byName.fallback != null) {
                    Runner.diag("evaluateByName fallback for " + displayName + " = " + preview(byName.fallback));
                    capture.fallback = byName.fallback;
                }
                TraceCapture controllerCapture = evaluateFromController(name, context);
                if (controllerCapture.sequence != null) {
                    Runner.diag("controller lookup sequence for " + displayName);
                    capture.sequence = materialize(controllerCapture.sequence);
                    return capture;
                }
                if (capture.fallback == null && controllerCapture.fallback != null) {
                    Runner.diag("controller lookup fallback for " + displayName + " = " + preview(controllerCapture.fallback));
                    capture.fallback = controllerCapture.fallback;
                }
            }

            Object binding = extractBinding(instructionInfo);
            if (binding != null) {
                TraceCapture fromBinding = evaluateBinding(context, binding, newIdentitySet());
                if (fromBinding.sequence != null) {
                    Runner.diag("evaluateBinding sequence for " + displayName + " using " + binding.getClass().getName());
                    capture.sequence = materialize(fromBinding.sequence);
                    return capture;
                }
                if (fromBinding.fallback != null) {
                    Runner.diag("evaluateBinding fallback for " + displayName + " = " + preview(fromBinding.fallback));
                }
                mergeCapture(capture, fromBinding);
            }

            TraceCapture direct = evaluateDirect(instructionInfo, context);
            if (direct.sequence != null) {
                Runner.diag("evaluateDirect sequence for " + displayName);
                capture.sequence = materialize(direct.sequence);
                return capture;
            }
            if (capture.fallback == null && direct.fallback != null) {
                Runner.diag("evaluateDirect fallback for " + displayName + " = " + preview(direct.fallback));
                capture.fallback = direct.fallback;
            }

            if (capture.sequence == null && capture.fallback == null && candidate != null) {
                capture.fallback = candidate.toString();
                Runner.diag("final fallback uses candidate.toString for " + displayName + " = " + preview(capture.fallback));
            }
            Runner.diag("capture result for " + displayName + " -> sequence="
                    + (capture.sequence != null) + " fallback="
                    + (capture.fallback != null ? preview(capture.fallback) : "null"));
            return capture;
        }

        private TraceCapture evaluateDirect(Object instructionInfo, Object context) {
            TraceCapture capture = new TraceCapture();
            if (instructionInfo == null) {
                return capture;
            }

            Sequence evaluatorSeq = evaluateEvaluatorObject(getProperty(instructionInfo, "evaluator"), context);
            if (evaluatorSeq != null) {
                capture.sequence = evaluatorSeq;
                return capture;
            }

            Sequence getterSeq = evaluateEvaluatorObject(invoke(instructionInfo, "getEvaluator"), context);
            if (getterSeq != null) {
                capture.sequence = getterSeq;
                return capture;
            }

            Object[] params = context != null ? new Object[]{context} : new Object[0];
            String[] methodNames = new String[]{
                    "iterate",
                    "evaluateVariable",
                    "evaluateLocalVariable",
                    "evaluate",
                    "getSelectValue",
                    "getSelectExpression"
            };
            for (String name : methodNames) {
                Object result = invoke(instructionInfo, name, params);
                if (result == null && context != null) {
                    result = invoke(instructionInfo, name);
                }
                Sequence seq = toSequence(result);
                if (seq != null) {
                    capture.sequence = seq;
                    return capture;
                }
                if (result instanceof SequenceIterator) {
                    Sequence materialized = materializeIterator((SequenceIterator) result);
                    if (materialized != null) {
                        capture.sequence = materialized;
                        return capture;
                    }
                }
                if (result instanceof Item) {
                    capture.fallback = formatItem((Item) result);
                    return capture;
                }
                Sequence evalSeq = evaluateEvaluatorObject(result, context);
                if (evalSeq != null) {
                    capture.sequence = evalSeq;
                    return capture;
                }
            }

            Object single = invoke(instructionInfo, "evaluateItem", params);
            if (single == null && context != null) {
                single = invoke(instructionInfo, "evaluateItem");
            }
            if (single instanceof Item) {
                Item item = (Item) single;
                Sequence seq = toSequence(item);
                if (seq != null) {
                    capture.sequence = seq;
                    return capture;
                }
                capture.fallback = formatItem(item);
                return capture;
            }

            return capture;
        }

        private Sequence evaluateEvaluatorObject(Object evaluator, Object context) {
            if (evaluator == null) {
                return null;
            }
            Object[] params = context != null ? new Object[]{context} : new Object[0];
            Object evaluated = invoke(evaluator, "evaluate", params);
            Sequence seq = toSequence(evaluated);
            if (seq != null) {
                return seq;
            }
            evaluated = invoke(evaluator, "materialize", params);
            seq = toSequence(evaluated);
            if (seq != null) {
                return seq;
            }
            Object iterator = invoke(evaluator, "iterate", params);
            if (iterator instanceof SequenceIterator) {
                return materializeIterator((SequenceIterator) iterator);
            }
            if (iterator != null) {
                seq = toSequence(iterator);
                if (seq != null) {
                    return seq;
                }
            }
            return null;
        }

        private Sequence evaluateSlot(Object context, int slot) {
            Object current = context;
            Object value = invoke(current, "evaluateLocalVariable", slot);
            if (value == null) {
                value = invoke(current, "getLocalVariable", slot);
            }
            if (value == null) {
                value = invoke(current, "getStackFrameValue", slot);
            }
            if (value == null) {
                Object controller = invoke(current, "getController");
                if (controller != null) {
                    value = invoke(controller, "evaluateLocalVariable", slot);
                    if (value == null) {
                        value = invoke(controller, "getLocalVariable", slot);
                    }
                }
            }
            return toSequence(value);
        }

        private TraceCapture evaluateByName(Object context, Object properties, StructuredQName name) {
            TraceCapture aggregate = new TraceCapture();
            if (context == null || name == null) {
                // Continue scanning property targets even if context is null
                if (!(properties instanceof Map)) {
                    return aggregate;
                }
            }
            Object[] variants = nameVariants(name);
            Object[] targets = contextTargets(context, properties);
            String[] methodNames = new String[]{
                    "evaluateVariable",
                    "evaluateGlobalVariable",
                    "getVariable",
                    "getGlobalVariable",
                    "getGlobalVariableValue",
                    "getXPathVariable",
                    "obtainVariable",
                    "resolveVariable",
                    "getParameter",
                    "get"
            };
            for (Object target : targets) {
                if (target == null) {
                    continue;
                }
                Runner.diag("evaluateByName inspecting target " + target.getClass().getName() + " for " + name.getDisplayName());
                for (String method : methodNames) {
                    for (Object variant : variants) {
                        Object result = invoke(target, method, variant);
                        TraceCapture candidate = captureFromResult(result, context);
                        if (candidate.sequence != null) {
                            return candidate;
                        }
                        mergeCapture(aggregate, candidate);
                    }
                }
                TraceCapture fromCollections = captureFromParameterCollections(target, name, context);
                if (fromCollections.sequence != null) {
                    Runner.diag("evaluateByName collections hit sequence for " + name.getDisplayName());
                    return fromCollections;
                }
                if (fromCollections.fallback != null) {
                    Runner.diag("evaluateByName collections fallback for " + name.getDisplayName() + " = " + preview(fromCollections.fallback));
                }
                mergeCapture(aggregate, fromCollections);
            }
            return aggregate;
        }

        private Object extractBinding(Object instructionInfo) {
            if (instructionInfo == null) {
                return null;
            }
            String[] methodNames = new String[]{
                    "getBinding",
                    "getVariableBinding",
                    "getBindingInformation",
                    "getBindingNode",
                    "getBindingObject"
            };
            for (String method : methodNames) {
                Object binding = invoke(instructionInfo, method);
                if (binding != null) {
                    return binding;
                }
            }
            Object prop = getProperty(instructionInfo, "binding");
            if (prop != null) {
                return prop;
            }
            return null;
        }

        private TraceCapture evaluateBinding(Object context, Object binding, Set<Object> seen) {
            TraceCapture aggregate = new TraceCapture();
            if (binding == null) {
                return aggregate;
            }
            if (seen != null && !seen.add(binding)) {
                Runner.diag("evaluateBinding already visited " + binding.getClass().getName());
                return aggregate;
            }
            Runner.diag("evaluateBinding inspecting " + binding.getClass().getName());
            Object controller = context != null ? invoke(context, "getController") : null;
            if (controller == null) {
                controller = invoke(binding, "getController");
            }
            if (controller == null && transformer != null) {
                controller = transformer.getUnderlyingController();
            }
            if (controller != null) {
                Runner.diag("evaluateBinding using controller " + controller.getClass().getName());
            } else {
                Runner.diag("evaluateBinding no controller available for binding " + binding.getClass().getName());
            }
            Object packageData = invoke(binding, "getPackageData");
            Object bindery = null;
            if (controller != null) {
                if (packageData == null) {
                    Object executable = invoke(controller, "getExecutable");
                    packageData = executable != null ? invoke(executable, "getTopLevelPackage") : null;
                }
                if (packageData != null) {
                    bindery = invoke(controller, "getBindery", packageData);
                }
                if (bindery == null) {
                    bindery = invoke(controller, "getBindery");
                }
            }
            if (bindery != null) {
                TraceCapture fromBindery = captureFromResult(invoke(bindery, "getGlobalVariableValue", binding), context, seen);
                if (fromBindery.sequence != null) {
                    Runner.diag("evaluateBinding bindery provided sequence for " + binding.getClass().getName());
                    return fromBindery;
                }
                if (fromBindery.fallback != null) {
                    Runner.diag("evaluateBinding bindery fallback " + preview(fromBindery.fallback));
                }
                mergeCapture(aggregate, fromBindery);
            }
            if (controller != null) {
                TraceCapture fromController = captureFromResult(invoke(controller, "evaluateGlobalVariable", binding), context, seen);
                if (fromController.sequence != null) {
                    Runner.diag("evaluateBinding controller provided sequence for " + binding.getClass().getName());
                    return fromController;
                }
                if (fromController.fallback != null) {
                    Runner.diag("evaluateBinding controller fallback " + preview(fromController.fallback));
                }
                mergeCapture(aggregate, fromController);
            }
            TraceCapture bindingValue = captureFromResult(invoke(binding, "getValue"), context, seen);
            if (bindingValue.sequence != null) {
                Runner.diag("evaluateBinding direct getValue sequence for " + binding.getClass().getName());
                return bindingValue;
            }
            if (bindingValue.fallback != null) {
                Runner.diag("evaluateBinding getValue fallback " + preview(bindingValue.fallback));
            }
            mergeCapture(aggregate, bindingValue);

            String[] methodNames = new String[]{
                    "evaluate",
                    "evaluateVariable",
                    "evaluateLocalVariable",
                    "getSelectValue",
                    "call",
                    "value"
            };
            for (String method : methodNames) {
                if (context != null) {
                    TraceCapture candidate = captureFromResult(invoke(binding, method, context), context, seen);
                    if (candidate.sequence != null) {
                        return candidate;
                    }
                    mergeCapture(aggregate, candidate);
                }
                TraceCapture candidate = captureFromResult(invoke(binding, method), context, seen);
                if (candidate.sequence != null) {
                    return candidate;
                }
                mergeCapture(aggregate, candidate);
            }
            return aggregate;
        }

        private Object[] contextTargets(Object context, Object properties) {
            LinkedHashSet<Object> targets = new LinkedHashSet<>();
            if (context != null) {
                targets.add(context);
                Object controller = invoke(context, "getController");
                if (controller != null) {
                    targets.add(controller);
                    Object executable = invoke(controller, "getExecutable");
                    Object packageData = executable != null ? invoke(executable, "getTopLevelPackage") : null;
                    Object bindery = null;
                    if (packageData != null) {
                        bindery = invoke(controller, "getBindery", packageData);
                    }
                    if (bindery == null) {
                        bindery = invoke(controller, "getBindery");
                    }
                    if (bindery != null) {
                        targets.add(bindery);
                    }
                }
                Object major = invoke(context, "getMajorContext");
                if (major != null) {
                    targets.add(major);
                }
                Object stackFrame = invoke(context, "getStackFrame");
                if (stackFrame != null) {
                    targets.add(stackFrame);
                }
                Object localParams = invoke(context, "getLocalParameters");
                if (localParams != null) {
                    targets.add(localParams);
                }
            }
            if (properties instanceof Map) {
                Map<?, ?> map = (Map<?, ?>) properties;
                for (Object value : map.values()) {
                    if (value != null) {
                        targets.add(value);
                    }
                }
            }
            if (transformer != null) {
                Object controller = transformer.getUnderlyingController();
                if (controller != null) {
                    targets.add(controller);
                }
            }
            return targets.toArray();
        }

        private Object[] nameVariants(StructuredQName name) {
            if (name == null) {
                return new Object[0];
            }
            LinkedHashSet<Object> variants = new LinkedHashSet<>();
            variants.add(name);
            String uri = name.getURI();
            String local = name.getLocalPart();
            String prefix = name.getPrefix();
            if (uri == null) {
                uri = "";
            }
            if (local == null) {
                local = "";
            }
            try {
                variants.add(new net.sf.saxon.s9api.QName(prefix == null ? "" : prefix, uri, local));
            } catch (Exception ignored) {
                // ignore
            }
            try {
                variants.add(new javax.xml.namespace.QName(uri, local));
            } catch (Exception ignored) {
                // ignore
            }
            if (!uri.isEmpty()) {
                variants.add("{" + uri + "}" + local);
                variants.add("Q{" + uri + "}" + local);
            }
            String display = name.getDisplayName();
            if (display != null && !display.isEmpty()) {
                variants.add(display);
            }
            if (prefix != null && !prefix.isEmpty() && !local.isEmpty()) {
                variants.add(prefix + ":" + local);
            }
            if (!local.isEmpty()) {
                variants.add(local);
            }
            return variants.toArray();
        }

        private TraceCapture captureFromParameterCollections(Object target, StructuredQName name, Object context) {
            TraceCapture aggregate = new TraceCapture();
            if (target == null || name == null) {
                return aggregate;
            }
            Object[] variants = nameVariants(name);
            Object[] collections = new Object[]{
                    target instanceof Map ? target : null,
                    invoke(target, "getParameters"),
                    invoke(target, "getLocalParameters"),
                    invoke(target, "getGlobalParameters")
            };
            for (Object collection : collections) {
                if (collection == null) {
                    continue;
                }
                if (collection instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) collection;
                    logMapSample(map);
                    Object introspectedValue = lookupMapValue(map, name, variants);
                    boolean introspectedConsumed = false;
                    for (Object variant : variants) {
                        Runner.diag("captureFromParameterCollections map lookup variant=" + variant + " class=" + map.getClass().getName());
                        Object value = map.get(variant);
                        if (value != null) {
                            Runner.diag("captureFromParameterCollections map hit class=" + value.getClass().getName());
                        } else {
                            Runner.diag("captureFromParameterCollections map hit null for variant=" + variant);
                        }
                        TraceCapture candidate = captureFromResult(value, context);
                        if (candidate.sequence != null) {
                            return candidate;
                        }
                        mergeCapture(aggregate, candidate);
                        if (value == null && variant instanceof CharSequence) {
                            Object alt = map.get(variant.toString());
                            if (alt != null) {
                                Runner.diag("captureFromParameterCollections map alt hit class=" + alt.getClass().getName());
                            } else {
                                Runner.diag("captureFromParameterCollections map alt hit null");
                            }
                            candidate = captureFromResult(alt, context);
                            if (candidate.sequence != null) {
                                return candidate;
                            }
                            mergeCapture(aggregate, candidate);
                        }
                        if (value == null && !introspectedConsumed && introspectedValue != null) {
                            Runner.diag("captureFromParameterCollections introspection hit class=" + introspectedValue.getClass().getName());
                            TraceCapture introspectedCapture = captureFromResult(introspectedValue, context);
                            if (introspectedCapture.sequence != null) {
                                return introspectedCapture;
                            }
                            mergeCapture(aggregate, introspectedCapture);
                            introspectedConsumed = true;
                        }
                    }
                } else {
                    for (Object variant : variants) {
                        Object value = invoke(collection, "get", variant);
                        Runner.diag("captureFromParameterCollections accessor lookup variant=" + variant + " target=" + collection.getClass().getName());
                        if (value != null) {
                            Runner.diag("captureFromParameterCollections accessor hit class=" + value.getClass().getName());
                        } else {
                            Runner.diag("captureFromParameterCollections accessor hit null");
                        }
                        TraceCapture candidate = captureFromResult(value, context);
                        if (candidate.sequence != null) {
                            return candidate;
                        }
                        mergeCapture(aggregate, candidate);
                    }
                }
            }
            return aggregate;
        }

        private TraceCapture captureFromResult(Object result, Object context) {
            return captureFromResult(result, context, newIdentitySet());
        }

        private TraceCapture captureFromResult(Object result, Object context, Set<Object> seen) {
            TraceCapture capture = new TraceCapture();
            if (result == null) {
                return capture;
            }
            if (result instanceof TraceCapture) {
                TraceCapture existing = (TraceCapture) result;
                capture.sequence = existing.sequence;
                capture.fallback = existing.fallback;
                Runner.diag("captureFromResult reused TraceCapture sequence=" + (capture.sequence != null));
                return capture;
            }
            Sequence seq = evaluateObjectValue(result, context);
            if (seq != null) {
                Runner.diag("captureFromResult materialized sequence from " + result.getClass().getName());
                capture.sequence = seq;
                return capture;
            }
            if (isInstanceOf(result, "net.sf.saxon.s9api.XdmValue")) {
                Object underlying = invoke(result, "getUnderlyingValue");
                Sequence underlyingSeq = evaluateObjectValue(underlying, context, 0, seen != null ? seen : newIdentitySet());
                if (underlyingSeq != null) {
                    Runner.diag("captureFromResult unwrapped XdmValue to sequence for " + result.getClass().getName());
                    capture.sequence = underlyingSeq;
                    return capture;
                }
                capture.fallback = result.toString();
                Runner.diag("captureFromResult fallback from XdmValue " + preview(capture.fallback));
                return capture;
            }
            if (isBinding(result)) {
                Runner.diag("captureFromResult evaluating Binding instance " + result.getClass().getName());
                TraceCapture bindingCapture = evaluateBinding(context, result, seen != null ? seen : newIdentitySet());
                mergeCapture(capture, bindingCapture);
                return capture;
            }
            if (result instanceof Item) {
                capture.fallback = formatItem((Item) result);
                Runner.diag("captureFromResult formatted Item fallback " + preview(capture.fallback));
                return capture;
            }
            if (result instanceof Iterable) {
                Sequence seqFromIterable = sequenceFromIterable((Iterable<?>) result);
                if (seqFromIterable != null) {
                    Runner.diag("captureFromResult built sequence from Iterable " + result.getClass().getName());
                    capture.sequence = seqFromIterable;
                    return capture;
                }
                StringBuilder sb = new StringBuilder();
                boolean first = true;
                for (Object o : (Iterable<?>) result) {
                    TraceCapture nested = captureFromResult(o, context);
                    String val = nested.sequence != null ? formatSequence(nested.sequence) : nested.fallback;
                    if (val == null || val.isEmpty()) {
                        continue;
                    }
                    if (!first) {
                        sb.append('\n');
                    }
                    first = false;
                    sb.append(val);
                }
                capture.fallback = sb.toString();
                Runner.diag("captureFromResult fallback aggregated Iterable " + preview(capture.fallback));
                return capture;
            }
            if (result != null && result.getClass().isArray()) {
                Sequence seqFromArray = sequenceFromArray(result);
                if (seqFromArray != null) {
                    Runner.diag("captureFromResult built sequence from array " + result.getClass().getName());
                    capture.sequence = seqFromArray;
                    return capture;
                }
            }
            capture.fallback = result.toString();
            Runner.diag("captureFromResult generic fallback " + preview(capture.fallback));
            return capture;
        }

        private final Set<String> loggedParameterNames = ConcurrentHashMap.newKeySet();

        private void logContextMap(Map<?, ?> map) {
            if (!TRACE_DEBUG || map == null) {
                return;
            }
            int id = System.identityHashCode(map);
            if (!loggedMapIds.add(id)) {
                return;
            }
            StringBuilder sb = new StringBuilder();
            int count = 0;
            int size = map.size();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (count++ >= 6) {
                    break;
                }
                Object key = entry.getKey();
                Object value = entry.getValue();
                sb.append(describeKey(key)).append('=');
                if (value == null) {
                    sb.append("null");
                } else {
                    sb.append(value.getClass().getName());
                    if (value instanceof CharSequence) {
                        sb.append("(\"").append(preview(value.toString())).append("\")");
                    }
                    if (value instanceof Map) {
                        sb.append("[map]");
                    }
                }
                sb.append("; ");
            }
            Runner.diag("context map size=" + size + " entries=" + sb);
        }

        private Object extractContextFromProperties(Map<?, ?> map) {
            return extractContextFromProperties(map, newIdentitySet());
        }

        private Object extractContextFromProperties(Map<?, ?> map, Set<Object> seen) {
            if (map == null) {
                return null;
            }
            if (seen != null && !seen.add(map)) {
                return null;
            }
            Object[] candidateKeys = new Object[]{
                    "context",
                    "xpathContext",
                    "XPathContext",
                    "majorContext",
                    "contextObject"
            };
            for (Object key : candidateKeys) {
                Object value = map.get(key);
                if (isXPathContext(value)) {
                    return value;
                }
            }
            for (Object value : map.values()) {
                if (isXPathContext(value)) {
                    return value;
                }
                if (value instanceof Map) {
                    Object nested = extractContextFromProperties((Map<?, ?>) value, seen);
                    if (isXPathContext(nested)) {
                        return nested;
                    }
                }
            }
            return null;
        }

        private boolean isXPathContext(Object value) {
            return isInstanceOf(value, "net.sf.saxon.expr.XPathContext");
        }

        private TraceCapture captureParameterValue(StructuredQName name) {
            TraceCapture capture = new TraceCapture();
            if (transformer == null || name == null) {
                return capture;
            }
            try {
                net.sf.saxon.s9api.QName qName = new net.sf.saxon.s9api.QName(
                        name.getPrefix() == null ? "" : name.getPrefix(),
                        name.getURI() == null ? "" : name.getURI(),
                        name.getLocalPart());
                XdmValue paramValue = transformer.getParameter(qName);
                if (paramValue != null) {
                    Runner.diag("captureParameterValue transformer hit " + qName.getClarkName());
                    return captureFromResult(paramValue, null);
                }
            } catch (Exception e) {
                Runner.diag("captureParameterValue error: " + e.getMessage());
            }
            return capture;
        }

        private TraceCapture evaluateFromController(StructuredQName name, Object context) {
            TraceCapture aggregate = new TraceCapture();
            if (transformer == null || name == null) {
                return aggregate;
            }
            Object controller = transformer.getUnderlyingController();
            if (controller == null) {
                return aggregate;
            }
            Runner.diag("evaluateFromController using controller=" + controller.getClass().getName());
            Object executable = invoke(controller, "getExecutable");
            Object packageData = executable != null ? invoke(executable, "getTopLevelPackage") : null;
            Object bindery = null;
            if (packageData != null) {
                bindery = invoke(controller, "getBindery", packageData);
            }
            if (bindery == null) {
                bindery = invoke(controller, "getBindery");
            }

            Object effectiveContext = context;
            if (effectiveContext == null) {
                effectiveContext = invoke(controller, "newXPathContext");
            }

            if (packageData != null) {
                Object globalList = invoke(packageData, "getGlobalVariableList");
                if (globalList instanceof Iterable) {
                    for (Object varObj : (Iterable<?>) globalList) {
                        if (varObj == null) {
                            continue;
                        }
                        StructuredQName varName = toStructuredQName(invoke(varObj, "getVariableQName"));
                        if (varName == null) {
                            varName = toStructuredQName(invoke(varObj, "getObjectName"));
                        }
                        if (varName == null || !varName.equals(name)) {
                            continue;
                        }
                        Runner.diag("evaluateFromController matched global variable class=" + varObj.getClass().getName());
                        if (bindery != null) {
                            TraceCapture byValue = captureFromResult(invoke(bindery, "getGlobalVariableValue", varObj), effectiveContext);
                            if (byValue.sequence != null) {
                                Runner.diag("bindery getGlobalVariableValue match for " + name.getDisplayName());
                                return byValue;
                            }
                            mergeCapture(aggregate, byValue);

                            Object slotObj = invoke(varObj, "getBinderySlotNumber");
                            if (slotObj instanceof Number) {
                                int slot = ((Number) slotObj).intValue();
                                TraceCapture bySlot = captureFromResult(invoke(bindery, "getGlobalVariable", slot), effectiveContext);
                                if (bySlot.sequence != null) {
                                    Runner.diag("bindery getGlobalVariable slot=" + slot + " match for " + name.getDisplayName());
                                    return bySlot;
                                }
                                mergeCapture(aggregate, bySlot);
                            }
                        }
                        TraceCapture evaluated = captureFromResult(invoke(varObj, "evaluateVariable", effectiveContext), effectiveContext);
                        if (evaluated.sequence != null) {
                            Runner.diag("evaluateFromController evaluateVariable hit for " + name.getDisplayName());
                            return evaluated;
                        }
                        mergeCapture(aggregate, evaluated);
                    }
                }
            }

            if (executable != null) {
                Object paramMap = invoke(executable, "getGlobalParameters");
                if (paramMap instanceof Map) {
                    Map<?, ?> map = (Map<?, ?>) paramMap;
                    Object candidate = map.get(name);
                    if (candidate == null) {
                        candidate = map.get(name.getStructuredQName());
                    }
                    if (candidate == null) {
                        candidate = map.get(name.getDisplayName());
                    }
                    if (candidate != null) {
                        Runner.diag("evaluateFromController global parameter class=" + candidate.getClass().getName());
                        TraceCapture fromParam = evaluateBinding(effectiveContext, candidate, newIdentitySet());
                        if (fromParam.sequence != null) {
                            return fromParam;
                        }
                        mergeCapture(aggregate, fromParam);
                    }
                }
            }

            return aggregate;
        }

        private void logMapSample(Map<?, ?> map) {
            if (!TRACE_DEBUG || map == null) {
                return;
            }
            int id = System.identityHashCode(map);
            if (!loggedMapIds.add(id)) {
                return;
            }
            StringBuilder sb = new StringBuilder();
            int count = 0;
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (count++ >= 5) {
                    break;
                }
                Object key = entry.getKey();
                Object value = entry.getValue();
                sb.append(describeKey(key));
                sb.append(" -> ");
                sb.append(value != null ? value.getClass().getName() : "null");
                if (value instanceof Map) {
                    sb.append("[map]");
                }
                sb.append("; ");
            }
            Runner.diag("captureFromParameterCollections map sample size=" + map.size() + " keys=" + sb);
        }

        private String describeKey(Object key) {
            if (key == null) {
                return "null";
            }
            StructuredQName q = toStructuredQName(key);
            if (q != null) {
                return "QName(" + q.getDisplayName() + ")";
            }
            return key.getClass().getName() + '(' + key.toString() + ')';
        }

        private Object lookupMapValue(Map<?, ?> map, StructuredQName name, Object[] variants) {
            if (map == null || name == null) {
                return null;
            }
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                Object key = entry.getKey();
                if (matchesKey(key, name, variants)) {
                    Runner.diag("lookupMapValue matched key " + describeKey(key));
                    return entry.getValue();
                }
            }
            return null;
        }

        private boolean matchesKey(Object key, StructuredQName target, Object[] variants) {
            if (key == null) {
                return false;
            }
            StructuredQName keyQName = toStructuredQName(key);
            if (keyQName != null) {
                if (keyQName.equals(target)) {
                    return true;
                }
                String keyDisplay = keyQName.getDisplayName();
                if (matchesVariantString(keyDisplay, variants, target)) {
                    return true;
                }
            }
            if (matchesVariantString(key.toString(), variants, target)) {
                return true;
            }
            Object extracted = extractNameProperty(key);
            if (extracted instanceof StructuredQName) {
                StructuredQName eq = (StructuredQName) extracted;
                return eq.equals(target) || matchesVariantString(eq.getDisplayName(), variants, target);
            }
            if (extracted instanceof javax.xml.namespace.QName) {
                StructuredQName converted = toStructuredQName(extracted);
                if (converted != null) {
                    return converted.equals(target) || matchesVariantString(converted.getDisplayName(), variants, target);
                }
            }
            if (extracted instanceof CharSequence) {
                return matchesVariantString(extracted.toString(), variants, target);
            }
            return false;
        }

        private boolean matchesVariantString(String candidate, Object[] variants, StructuredQName target) {
            if (candidate == null) {
                return false;
            }
            String trimmed = candidate.trim();
            if (trimmed.isEmpty()) {
                return false;
            }
            if (target != null) {
                String display = target.getDisplayName();
                if (display != null && trimmed.equals(display)) {
                    return true;
                }
                String uri = target.getURI() == null ? "" : target.getURI();
                String local = target.getLocalPart() == null ? "" : target.getLocalPart();
                String expanded = "{" + uri + "}" + local;
                String saxonExpanded = "Q{" + uri + "}" + local;
                if (trimmed.equals(expanded) || trimmed.equals(saxonExpanded)) {
                    return true;
                }
                if (target.getPrefix() != null && !target.getPrefix().isEmpty()) {
                    String prefixed = target.getPrefix() + ':' + local;
                    if (trimmed.equals(prefixed)) {
                        return true;
                    }
                }
                if (trimmed.equals(local)) {
                    return true;
                }
            }
            if (variants != null) {
                for (Object variant : variants) {
                    if (variant == null) {
                        continue;
                    }
                    if (trimmed.equals(variant.toString())) {
                        return true;
                    }
                }
            }
            return false;
        }

        private Object extractNameProperty(Object key) {
            if (key == null) {
                return null;
            }
            String[] props = new String[]{
                    "variableQName",
                    "objectName",
                    "name",
                    "qName",
                    "displayName"
            };
            for (String prop : props) {
                Object value = getProperty(key, prop);
                if (value != null) {
                    return value;
                }
            }
            String[] methods = new String[]{
                    "getVariableQName",
                    "getObjectName",
                    "getVariableName",
                    "getQName",
                    "getDisplayName",
                    "getStructuredQName"
            };
            for (String method : methods) {
                Object value = invoke(key, method);
                if (value != null) {
                    return value;
                }
            }
            return null;
        }

        private StructuredQName toStructuredQName(Object value) {
            if (value == null) {
                return null;
            }
            if (value instanceof StructuredQName) {
                return (StructuredQName) value;
            }
            if (value instanceof javax.xml.namespace.QName) {
                javax.xml.namespace.QName q = (javax.xml.namespace.QName) value;
                return new StructuredQName(q.getPrefix() == null ? "" : q.getPrefix(),
                        q.getNamespaceURI() == null ? "" : q.getNamespaceURI(),
                        q.getLocalPart());
            }
            if (value instanceof net.sf.saxon.s9api.QName) {
                net.sf.saxon.s9api.QName q = (net.sf.saxon.s9api.QName) value;
                return new StructuredQName(q.getPrefix(), q.getNamespaceURI(), q.getLocalName());
            }
            Object extracted = extractNameProperty(value);
            if (extracted != null && extracted != value) {
                return toStructuredQName(extracted);
            }
            return null;
        }

        private void mergeCapture(TraceCapture base, TraceCapture candidate) {
            if (base == null || candidate == null) {
                return;
            }
            if (base.sequence == null && candidate.sequence != null) {
                base.sequence = candidate.sequence;
            }
            if (base.fallback == null && candidate.fallback != null) {
                base.fallback = candidate.fallback;
            }
        }

        private Sequence evaluateObjectValue(Object value, Object context) {
            Set<Object> seen = Collections.newSetFromMap(new IdentityHashMap<>());
            return evaluateObjectValue(value, context, 0, seen);
        }

        private Sequence evaluateObjectValue(Object value, Object context, int depth, Set<Object> seen) {
            if (value == null || depth > 6) {
                return null;
            }
            if (seen != null && !seen.add(value)) {
                return null;
            }
            Runner.diag("evaluateObjectValue depth=" + depth + " type=" + value.getClass().getName());
            Sequence seq = toSequence(value);
            if (seq != null) {
                Runner.diag("evaluateObjectValue toSequence success " + value.getClass().getName());
                return materialize(seq);
            }
            if (value instanceof SequenceIterator) {
                Runner.diag("evaluateObjectValue materialize SequenceIterator " + value.getClass().getName());
                return materializeIterator((SequenceIterator) value);
            }
            if (value instanceof Item) {
                Runner.diag("evaluateObjectValue wrap single Item " + value.getClass().getName());
                return materializeItem((Item) value);
            }
            if (isExpression(value)) {
                Sequence exprSeq = evaluateExpressionValue(value, context, depth + 1, seen);
                if (exprSeq != null) {
                    Runner.diag("evaluateObjectValue expression produced sequence " + value.getClass().getName());
                    return exprSeq;
                }
            }
            if (isInstanceOf(value, "net.sf.saxon.s9api.XdmValue")) {
                Object underlying = invoke(value, "getUnderlyingValue");
                Sequence underlyingSeq = evaluateObjectValue(underlying, context, depth + 1, seen);
                if (underlyingSeq != null) {
                    return underlyingSeq;
                }
            }
            String[] methodNames = new String[]{
                    "materialize",
                    "evaluate",
                    "iterate",
                    "getValue",
                    "value",
                    "call",
                    "apply",
                    "asSequence",
                    "asAtomic",
                    "reduce",
                    "expand",
                    "snapshot",
                    "makeSequence"
            };
            for (String name : methodNames) {
                Sequence viaContext = invokeAndMaterialize(value, name, context, depth, seen);
                if (viaContext != null) {
                    return viaContext;
                }
                Sequence viaEmpty = invokeAndMaterialize(value, name, null, depth, seen);
                if (viaEmpty != null) {
                    return viaEmpty;
                }
            }
            if (value instanceof Iterable) {
                Sequence seqFromIterable = sequenceFromIterable((Iterable<?>) value);
                if (seqFromIterable != null) {
                    return seqFromIterable;
                }
            }
            if (value != null && value.getClass().isArray()) {
                Sequence seqFromArray = sequenceFromArray(value);
                if (seqFromArray != null) {
                    return seqFromArray;
                }
            }
            return null;
        }

        private Sequence invokeAndMaterialize(Object target, String methodName, Object context, int depth, Set<Object> seen) {
            if (target == null) {
                return null;
            }
            Object result;
            if (context != null) {
                result = invoke(target, methodName, context);
                if (result != null) {
                    Runner.diag("invokeAndMaterialize " + target.getClass().getName() + "." + methodName + " -> " + result.getClass().getName());
                }
                Sequence seq = evaluateObjectValue(result, context, depth + 1, seen);
                if (seq != null) {
                    return seq;
                }
            }
            result = invoke(target, methodName);
            if (result != null) {
                Runner.diag("invokeAndMaterialize " + target.getClass().getName() + "." + methodName + "() -> " + result.getClass().getName());
            }
            return evaluateObjectValue(result, context, depth + 1, seen);
        }

        private Sequence materializeItem(Item item) {
            if (item == null) {
                return null;
            }
            try {
                List<Item> items = new ArrayList<>();
                items.add(item);
                return SequenceExtent.makeSequenceExtent(items);
            } catch (Exception ignored) {
                return null;
            }
        }

        private Sequence sequenceFromIterable(Iterable<?> iterable) {
            if (iterable == null) {
                return null;
            }
            List<Item> items = new ArrayList<>();
            for (Object element : iterable) {
                if (element instanceof Item) {
                    items.add((Item) element);
                }
            }
            if (!items.isEmpty()) {
                try {
                    return SequenceExtent.makeSequenceExtent(items);
                } catch (Exception ignored) {
                    return null;
                }
            }
            return null;
        }

        private Sequence sequenceFromArray(Object array) {
            if (array == null || !array.getClass().isArray()) {
                return null;
            }
            int len = java.lang.reflect.Array.getLength(array);
            List<Item> items = new ArrayList<>(len);
            for (int i = 0; i < len; i++) {
                Object element = java.lang.reflect.Array.get(array, i);
                if (element instanceof Item) {
                    items.add((Item) element);
                }
            }
            if (!items.isEmpty()) {
                try {
                    return SequenceExtent.makeSequenceExtent(items);
                } catch (Exception ignored) {
                }
            }
            return null;
        }

        private boolean isExpression(Object value) {
            return isInstanceOf(value, "net.sf.saxon.expr.Expression");
        }

        private boolean isBinding(Object value) {
            return isInstanceOf(value, "net.sf.saxon.expr.parser.Binding") ||
                    isInstanceOf(value, "net.sf.saxon.expr.instruct.BindingReference");
        }

        private Sequence evaluateExpressionValue(Object expression, Object context, int depth, Set<Object> seen) {
            if (expression == null) {
                return null;
            }
            Object[] params = context != null ? new Object[]{context} : new Object[0];
            Object iterateResult = invoke(expression, "iterate", params);
            Sequence seq = evaluateObjectValue(iterateResult, context, depth + 1, seen);
            if (seq != null) {
                Runner.diag("evaluateExpressionValue iterate produced sequence for " + expression.getClass().getName());
                return seq;
            }
            if (context != null) {
                iterateResult = invoke(expression, "iterate");
                seq = evaluateObjectValue(iterateResult, context, depth + 1, seen);
                if (seq != null) {
                    Runner.diag("evaluateExpressionValue iterate() produced sequence for " + expression.getClass().getName());
                    return seq;
                }
            }
            String[] methodNames = new String[]{
                    "evaluateItem",
                    "evaluateVariable",
                    "evaluateLocalVariable",
                    "evaluate",
                    "call",
                    "process",
                    "deliver"
            };
            for (String name : methodNames) {
                Object result = context != null ? invoke(expression, name, context) : null;
                seq = evaluateObjectValue(result, context, depth + 1, seen);
                if (seq != null) {
                    Runner.diag("evaluateExpressionValue " + name + "(context) produced sequence for " + expression.getClass().getName());
                    return seq;
                }
                if (context != null) {
                    result = invoke(expression, name);
                    seq = evaluateObjectValue(result, context, depth + 1, seen);
                    if (seq != null) {
                        Runner.diag("evaluateExpressionValue " + name + "() produced sequence for " + expression.getClass().getName());
                        return seq;
                    }
                }
            }
            return null;
        }

        private boolean isInstanceOf(Object value, String className) {
            if (value == null || className == null) {
                return false;
            }
            try {
                Class<?> cls = Class.forName(className);
                return cls.isInstance(value);
            } catch (Exception ignored) {
                return false;
            }
        }

        private Object invoke(Object target, String methodName, Object... params) {
            if (target == null) {
                return null;
            }
            try {
                Class<?>[] types = new Class<?>[params.length];
                for (int i = 0; i < params.length; i++) {
                    Object p = params[i];
                    types[i] = p != null && p.getClass() == Integer.class ? int.class : (p == null ? Object.class : p.getClass());
                }
                Method m = findMethod(target.getClass(), methodName, types);
                if (m == null && params.length == 1 && params[0] instanceof Integer) {
                    m = findMethod(target.getClass(), methodName, new Class<?>[]{int.class});
                }
                if (m == null) {
                    return null;
                }
                m.setAccessible(true);
                return m.invoke(target, params);
            } catch (Exception e) {
                return null;
            }
        }

        private Method findMethod(Class<?> type, String name, Class<?>[] parameterTypes) {
            try {
                return type.getMethod(name, parameterTypes);
            } catch (Exception ignored) {
                // fall through to compatibility search
            }
            Method[] methods = type.getMethods();
            for (Method m : methods) {
                if (!m.getName().equals(name) || m.getParameterCount() != parameterTypes.length) {
                    continue;
                }
                Class<?>[] targetParams = m.getParameterTypes();
                boolean compatible = true;
                for (int i = 0; i < targetParams.length; i++) {
                    Class<?> requested = parameterTypes[i];
                    if (!isAssignable(targetParams[i], requested)) {
                        compatible = false;
                        break;
                    }
                }
                if (compatible) {
                    return m;
                }
            }
            return null;
        }

        private boolean isAssignable(Class<?> targetType, Class<?> requestedType) {
            if (targetType == null) {
                return false;
            }
            if (requestedType == null || requestedType == Object.class) {
                return true;
            }
            if (targetType.isPrimitive()) {
                targetType = primitiveToWrapper(targetType);
            }
            if (requestedType.isPrimitive()) {
                requestedType = primitiveToWrapper(requestedType);
            }
            if (targetType == null) {
                return false;
            }
            if (requestedType == null) {
                return true;
            }
            return targetType.isAssignableFrom(requestedType);
        }

        private Class<?> primitiveToWrapper(Class<?> primitive) {
            if (primitive == null) {
                return null;
            }
            if (!primitive.isPrimitive()) {
                return primitive;
            }
            if (primitive == boolean.class) return Boolean.class;
            if (primitive == byte.class) return Byte.class;
            if (primitive == short.class) return Short.class;
            if (primitive == char.class) return Character.class;
            if (primitive == int.class) return Integer.class;
            if (primitive == long.class) return Long.class;
            if (primitive == float.class) return Float.class;
            if (primitive == double.class) return Double.class;
            return primitive;
        }

        private Object firstCandidate(Object instructionInfo) {
            String[] keys = new String[]{"value", "result", "variableValue", "actualValue", "selectValue", "sequence", "selectExpression", "containedValue"};
            for (String key : keys) {
                Object val = getProperty(instructionInfo, key);
                if (val != null) {
                    return val;
                }
            }
            return null;
        }

        private Integer extractSlot(Object instructionInfo) {
            String[] keys = new String[]{"slot", "slot-number", "slotNumber", "slotIndex"};
            for (String key : keys) {
                Object val = getProperty(instructionInfo, key);
                if (val instanceof Number) {
                    return ((Number) val).intValue();
                }
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getSlotNumber");
                Object result = m.invoke(instructionInfo);
                if (result instanceof Number) {
                    return ((Number) result).intValue();
                }
            } catch (Exception ignored) {
                // ignore
            }
            return null;
        }

        private Object getProperty(Object instructionInfo, String key) {
            if (instructionInfo == null) {
                return null;
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getProperty", String.class);
                return m.invoke(instructionInfo, key);
            } catch (Exception ignored) {
                return null;
            }
        }

        private boolean isVariable(Object instructionInfo) {
            if (instructionInfo == null) {
                return false;
            }
            Integer construct = getConstructType(instructionInfo);
            if (construct != null) {
                if (construct == StandardNames.XSL_VARIABLE ||
                        construct == StandardNames.XSL_PARAM ||
                        construct == StandardNames.XSL_WITH_PARAM) {
                    return true;
                }
            }
            StructuredQName name = getVariableName(instructionInfo);
            if (name != null) {
                return true;
            }
            String className = instructionInfo.getClass().getName();
            if (className != null) {
                if (className.contains(".LetExpression") ||
                        className.contains(".GlobalVariable") ||
                        className.contains(".GlobalParameter") ||
                        className.contains(".LocalVariable") ||
                        className.contains(".Assignation")) {
                    return true;
                }
            }
            return false;
        }

        private Integer getConstructType(Object instructionInfo) {
            if (instructionInfo == null) {
                return null;
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getConstructType");
                Object val = m.invoke(instructionInfo);
                if (val instanceof Number) {
                    return ((Number) val).intValue();
                }
            } catch (Exception ignored) {
                // ignore
            }
            return null;
        }

        private StructuredQName getVariableName(Object instructionInfo) {
            if (instructionInfo == null) {
                return null;
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getObjectName");
                Object result = m.invoke(instructionInfo);
                if (result instanceof StructuredQName) {
                    return (StructuredQName) result;
                }
            } catch (Exception ignored) {
                // ignore
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getVariableQName");
                Object result = m.invoke(instructionInfo);
                if (result instanceof StructuredQName) {
                    return (StructuredQName) result;
                }
            } catch (Exception ignored) {
                // ignore
            }
            try {
                Method m = instructionInfo.getClass().getMethod("getVariableName");
                Object result = m.invoke(instructionInfo);
                if (result instanceof StructuredQName) {
                    return (StructuredQName) result;
                }
                if (result instanceof String) {
                    return new StructuredQName("", "", (String) result);
                }
            } catch (Exception ignored) {
                // ignore
            }
            Object prop = getProperty(instructionInfo, "name");
            if (prop instanceof StructuredQName) {
                return (StructuredQName) prop;
            }
            if (prop instanceof String) {
                return new StructuredQName("", "", (String) prop);
            }
            return null;
        }

        private Sequence toSequence(Object value) {
            if (value == null) {
                return null;
            }
            if (value instanceof Sequence) {
                return (Sequence) value;
            }
            if (value instanceof GroundedValue) {
                return (GroundedValue) value;
            }
            return null;
        }

        private Sequence materialize(Sequence sequence) {
            if (sequence instanceof GroundedValue) {
                return sequence;
            }
            try {
                Method m = sequence.getClass().getMethod("materialize");
                Object result = m.invoke(sequence);
                if (result instanceof Sequence) {
                    return (Sequence) result;
                }
                if (result instanceof GroundedValue) {
                    return (GroundedValue) result;
                }
            } catch (Exception ignored) {
                // ignore
            }
            return sequence;
        }

        private Sequence materializeIterator(SequenceIterator iterator) {
            if (iterator == null) {
                return null;
            }
            List<Item> items = new ArrayList<>();
            try {
                while (true) {
                    Item item = iterator.next();
                    if (item == null) {
                        break;
                    }
                    items.add(item);
                }
            } catch (Exception ignored) {
                return null;
            } finally {
                try {
                    iterator.close();
                } catch (Exception ignored) {
                    // ignore
                }
            }
            try {
                return SequenceExtent.makeSequenceExtent(items);
            } catch (Exception ignored) {
                return null;
            }
        }

        private GroundedValue toGroundedValue(Sequence sequence) {
            if (sequence instanceof GroundedValue) {
                return (GroundedValue) sequence;
            }
            try {
                Class<?> tool = Class.forName("net.sf.saxon.om.SequenceTool");
                Method m = tool.getMethod("toGroundedValue", Sequence.class);
                Object result = m.invoke(null, sequence);
                if (result instanceof GroundedValue) {
                    return (GroundedValue) result;
                }
            } catch (Exception ignored) {
                // ignore
            }
            return null;
        }

        private String formatSequence(Sequence sequence) {
            if (sequence == null) {
                return "";
            }
            try {
                Sequence materialized = materialize(sequence);
                GroundedValue grounded = toGroundedValue(materialized);
                if (grounded == null) {
                    return materialized.toString();
                }
                if (grounded == EmptySequence.getInstance()) {
                    return "";
                }
                XdmValue xdmValue = XdmValue.wrap(grounded);
                if (!xdmValue.iterator().hasNext()) {
                    return "";
                }
                StringBuilder sb = new StringBuilder();
                boolean first = true;
                for (XdmItem item : xdmValue) {
                    if (!first) {
                        sb.append('\n');
                    }
                    first = false;
                    if (item instanceof XdmNode) {
                        StringWriter buffer = new StringWriter();
                        Serializer serializer = processor.newSerializer(buffer);
                        serializer.serializeNode((XdmNode) item);
                        serializer.close();
                        sb.append(buffer.toString());
                    } else {
                        sb.append(safeItemString(item));
                    }
                }
                return sb.toString();
            } catch (SaxonApiException e) {
                return "(error: " + e.getMessage() + ")";
            }
        }

        private String safeItemString(XdmItem item) {
            if (item == null) {
                return "";
            }
            if (item instanceof XdmNode) {
                return item.toString();
            }
            try {
                return item.getStringValue();
            } catch (IllegalStateException | UnsupportedOperationException e) {
                return item.toString();
            }
        }

        private void printDebug(String phase, StructuredQName name) {
            if (!TRACE_DEBUG || name == null) {
                return;
            }
            out.println("TRACE_DEBUG phase=" + phase + " variable=" + name.getDisplayName());
        }

        private void debugEvent(String phase, Object instructionInfo) {
            if (!TRACE_DEBUG) {
                return;
            }
            if (debugCounter++ > 50) {
                return;
            }
            StructuredQName name = getVariableName(instructionInfo);
            Integer construct = getConstructType(instructionInfo);
            out.println("TRACE_DEBUG raw_event phase=" + phase + " construct=" + construct + " name=" + (name != null ? name.getDisplayName() : "null") + " class=" + (instructionInfo != null ? instructionInfo.getClass().getName() : "null"));
        }

        private String formatItem(Item item) {
            if (item == null) {
                return "";
            }
            if (item instanceof NodeInfo) {
                try {
                    StringWriter buffer = new StringWriter();
                    Serializer serializer = processor.newSerializer(buffer);
                    serializer.serializeXdmValue(XdmValue.wrap((NodeInfo) item));
                    serializer.close();
                    return buffer.toString();
                } catch (SaxonApiException e) {
                    return item.getStringValue();
                }
            }
            return item.getStringValue();
        }

        private static final class Frame {
            StructuredQName name;
            Object instruction;
            Object context;
            Object properties;
        }

        private static final class TraceCapture {
            Sequence sequence;
            String fallback;
        }
    }
}
