package com.xsltplayground.ext;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.nio.charset.Charset;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Random;
import java.util.UUID;
import javax.xml.transform.OutputKeys;
import javax.xml.transform.Transformer;
import javax.xml.transform.TransformerFactory;
import javax.xml.transform.dom.DOMSource;
import javax.xml.transform.stream.StreamResult;
import org.w3c.dom.Node;

public class CustomFunctions {
    public static String uuid() {
        return UUID.randomUUID().toString();
    }

    public static long timestamp() {
        return System.currentTimeMillis();
    }

    public static String addToDate(String date, int years, int months, int days) {
        LocalDate d = LocalDate.parse(date);
        d = d.plusYears(years).plusMonths(months).plusDays(days);
        return d.toString();
    }

    public static String trim(String s) {
        return s == null ? "" : s.trim();
    }

    public static String addToDateTime(String dt, int y, int m, int d, int h, int min, int s) {
        LocalDateTime t = LocalDateTime.parse(dt);
        t = t.plusYears(y).plusMonths(m).plusDays(d).plusHours(h).plusMinutes(min).plusSeconds(s);
        return t.toString();
    }

    public static String addToTime(String time, int h, int m, int s) {
        LocalTime t = LocalTime.parse(time);
        t = t.plusHours(h).plusMinutes(m).plusSeconds(s);
        return t.toString();
    }

    public static int base64Length(String b64) {
        byte[] data = Base64.getDecoder().decode(b64);
        return data.length;
    }

    public static String base64ToHex(String b64) {
        byte[] data = Base64.getDecoder().decode(b64);
        StringBuilder sb = new StringBuilder();
        for (byte by : data) {
            sb.append(String.format("%02x", by));
        }
        return sb.toString();
    }

    public static String base64ToString(String b64, String encoding) throws Exception {
        if (encoding == null || encoding.isEmpty()) {
            encoding = "UTF-8";
        }
        byte[] data = Base64.getDecoder().decode(b64);
        return new String(data, Charset.forName(encoding));
    }

    public static int compareDate(String d1, String d2) {
        LocalDate a = LocalDate.parse(d1);
        LocalDate b = LocalDate.parse(d2);
        return a.compareTo(b);
    }

    public static int compareDateTime(String dt1, String dt2) {
        LocalDateTime a = LocalDateTime.parse(dt1);
        LocalDateTime b = LocalDateTime.parse(dt2);
        return a.compareTo(b);
    }

    public static int compareTime(String t1, String t2) {
        LocalTime a = LocalTime.parse(t1);
        LocalTime b = LocalTime.parse(t2);
        return a.compareTo(b);
    }

    public static String concatBase64(String... parts) {
        int total = 0;
        byte[][] data = new byte[parts.length][];
        for (int i = 0; i < parts.length; i++) {
            data[i] = Base64.getDecoder().decode(parts[i]);
            total += data[i].length;
        }
        byte[] out = new byte[total];
        int pos = 0;
        for (byte[] arr : data) {
            System.arraycopy(arr, 0, out, pos, arr.length);
            pos += arr.length;
        }
        return Base64.getEncoder().encodeToString(out);
    }

    public static String concatSequence(String... values) {
        StringBuilder sb = new StringBuilder();
        for (String s : values) {
            if (s != null)
                sb.append(s);
        }
        return sb.toString();
    }

    public static String concatSequenceFormat(String[] values, String sep, Boolean excludeEmpty) {
        if (sep == null) sep = "";
        boolean skipEmpty = excludeEmpty != null && excludeEmpty.booleanValue();
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < values.length; i++) {
            String v = values[i];
            if (skipEmpty && (v == null || v.isEmpty())) {
                continue;
            }
            if (sb.length() > 0) sb.append(sep);
            if (v != null) sb.append(v);
        }
        return sb.toString();
    }

    public static String createDate(int y, int m, int d) {
        LocalDate ld = LocalDate.of(y, m, d);
        return ld.toString();
    }

    public static String createDateTime(int y, int m, int d, int h, int min, int s, Integer ms) {
        LocalDateTime t = LocalDateTime.of(y, m, d, h, min, s, ms == null ? 0 : ms * 1_000_000);
        return t.toString();
    }

    public static String createDateTimeTimezone(int y, int m, int d, int h, int min, int s, int ms, int offH, int offM) {
        ZoneOffset off = ZoneOffset.ofHoursMinutes(offH, offM);
        OffsetDateTime odt = OffsetDateTime.of(y, m, d, h, min, s, ms * 1_000_000, off);
        return odt.toString();
    }

    public static String createTime(int h, int m, int s, Integer ms) {
        LocalTime t = LocalTime.of(h, m, s, ms == null ? 0 : ms * 1_000_000);
        return t.toString();
    }

    public static String currentDateTimeTimezone(int offH, int offM) {
        ZoneOffset off = ZoneOffset.ofHoursMinutes(offH, offM);
        OffsetDateTime odt = OffsetDateTime.now(off);
        return odt.toString();
    }

    public static String getCenturyFromDate(String date) {
        int year = LocalDate.parse(date).getYear();
        return Integer.toString(year / 100);
    }

    public static String getCenturyFromDateTime(String dt) {
        int year = LocalDateTime.parse(dt).getYear();
        return Integer.toString(year / 100);
    }

    public static String headBase64(String b64, int len) {
        byte[] data = Base64.getDecoder().decode(b64);
        if (len < 0 || len > data.length) len = data.length;
        byte[] sub = new byte[len];
        System.arraycopy(data, 0, sub, 0, len);
        return Base64.getEncoder().encodeToString(sub);
    }

    public static int hexLength(String hex) {
        return hex.length() / 2;
    }

    public static String hexToBase64(String hex) {
        byte[] data = new byte[hex.length() / 2];
        for (int i = 0; i < data.length; i++) {
            int idx = i * 2;
            data[i] = (byte) Integer.parseInt(hex.substring(idx, idx + 2), 16);
        }
        return Base64.getEncoder().encodeToString(data);
    }

    public static String hexToString(String hex, String encoding) throws Exception {
        if (encoding == null || encoding.isEmpty()) {
            encoding = "UTF-8";
        }
        byte[] data = new byte[hex.length() / 2];
        for (int i = 0; i < data.length; i++) {
            int idx = i * 2;
            data[i] = (byte) Integer.parseInt(hex.substring(idx, idx + 2), 16);
        }
        return new String(data, Charset.forName(encoding));
    }

    public static String ifAbsent(String value, String def) {
        if (value == null || value.isEmpty()) {
            return def;
        }
        return value;
    }

    public static int indexOf(String s, String t) {
        return s.indexOf(t) + 1;
    }

    public static int lastIndexOf(String s, String t) {
        return s.lastIndexOf(t) + 1;
    }

    public static String left(String s, int len) {
        if (len <= 0) return "";
        if (len >= s.length()) return s;
        return s.substring(0, len);
    }

    public static String pad(String s, int length, String padChar) {
        if (padChar == null || padChar.isEmpty()) padChar = " ";
        if (s.length() >= length) return s;
        StringBuilder sb = new StringBuilder(s);
        while (sb.length() < length) {
            sb.append(padChar.charAt(0));
        }
        return sb.toString();
    }

    public static String padAndLimit(String s, int length, String padChar) throws Exception {
        if (padChar == null || padChar.isEmpty()) padChar = " ";
        if (s.length() > length) throw new Exception("too long");
        StringBuilder sb = new StringBuilder(s);
        while (sb.length() < length) {
            sb.append(padChar.charAt(0));
        }
        return sb.toString();
    }

    public static String padBase64(String b64, String filler, int length) {
        byte[] a = Base64.getDecoder().decode(b64);
        byte[] f = Base64.getDecoder().decode(filler);
        if (a.length >= length) return b64;
        byte[] out = new byte[length];
        System.arraycopy(a, 0, out, 0, a.length);
        int pos = a.length;
        while (pos < length) {
            int copy = Math.min(f.length, length - pos);
            System.arraycopy(f, 0, out, pos, copy);
            pos += copy;
        }
        return Base64.getEncoder().encodeToString(out);
    }

    public static String padFront(String s, int length, String padChar) {
        if (padChar == null || padChar.isEmpty()) padChar = " ";
        if (s.length() >= length) return s;
        StringBuilder sb = new StringBuilder();
        while (sb.length() < length - s.length()) {
            sb.append(padChar.charAt(0));
        }
        sb.append(s);
        return sb.toString();
    }

    public static String parseDate(String format, String text) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern(format);
        LocalDate d = LocalDate.parse(text, f);
        return d.toString();
    }

    public static String parseDateTime(String format, String text) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern(format);
        LocalDateTime t = LocalDateTime.parse(text, f);
        return t.atOffset(ZoneOffset.systemDefault().getRules().getOffset(t)).toString();
    }

    public static String parseTime(String format, String text) {
        DateTimeFormatter f = DateTimeFormatter.ofPattern(format);
        LocalTime t = LocalTime.parse(text, f);
        return t.toString();
    }

    public static int random(int min, int max) {
        return new Random().nextInt((max - min) + 1) + min;
    }

    public static String renderXml(Node node, Boolean omit, Boolean indent) throws Exception {
        TransformerFactory tf = TransformerFactory.newInstance();
        Transformer t = tf.newTransformer();
        if (omit != null && omit.booleanValue()) {
            t.setOutputProperty(OutputKeys.OMIT_XML_DECLARATION, "yes");
        }
        if (indent != null && indent.booleanValue()) {
            t.setOutputProperty(OutputKeys.INDENT, "yes");
        }
        java.io.StringWriter sw = new java.io.StringWriter();
        t.transform(new DOMSource(node), new StreamResult(sw));
        return sw.toString();
    }

    public static String right(String s, int len) {
        if (len <= 0) return "";
        if (len >= s.length()) return s;
        return s.substring(s.length() - len);
    }

    public static double roundFraction(double num, int digits) {
        BigDecimal bd = BigDecimal.valueOf(num);
        bd = bd.setScale(digits, RoundingMode.HALF_UP);
        return bd.doubleValue();
    }

    public static String stringRoundFraction(double num, int digits) {
        BigDecimal bd = BigDecimal.valueOf(num);
        bd = bd.setScale(digits, RoundingMode.HALF_UP);
        return bd.toPlainString();
    }

    public static String stringToBase64(String s, String encoding) throws Exception {
        if (encoding == null || encoding.isEmpty()) encoding = "UTF-8";
        byte[] data = s.getBytes(Charset.forName(encoding));
        return Base64.getEncoder().encodeToString(data);
    }

    public static String stringToHex(String s, String encoding) throws Exception {
        if (encoding == null || encoding.isEmpty()) encoding = "UTF-8";
        byte[] data = s.getBytes(Charset.forName(encoding));
        StringBuilder sb = new StringBuilder();
        for (byte b : data) sb.append(String.format("%02X", b));
        return sb.toString();
    }

    public static String substringAfterLast(String s, String after) {
        int idx = s.lastIndexOf(after);
        if (idx == -1) return "";
        return s.substring(idx + after.length());
    }

    public static String substringBase64(String b64, int start, Integer length) {
        byte[] data = Base64.getDecoder().decode(b64);
        int s = Math.max(0, start - 1);
        int len = length == null ? data.length - s : Math.min(length, data.length - s);
        byte[] out = new byte[len];
        System.arraycopy(data, s, out, 0, len);
        return Base64.getEncoder().encodeToString(out);
    }

    public static String substringBeforeLast(String s, String before) {
        int idx = s.lastIndexOf(before);
        if (idx == -1) return "";
        return s.substring(0, idx);
    }

    public static String translateTimezone(String dt, String zone) {
        OffsetDateTime odt = OffsetDateTime.parse(dt);
        ZoneOffset off = ZoneOffset.of(zone);
        return odt.withOffsetSameInstant(off).toString();
    }

    public static String trimBase64(String b64, int begin, Integer end) {
        byte[] data = Base64.getDecoder().decode(b64);
        int start = Math.min(begin, data.length);
        int endLen = end == null ? 0 : end;
        int len = data.length - start - endLen;
        if (len < 0) len = 0;
        byte[] out = new byte[len];
        System.arraycopy(data, start, out, 0, len);
        return Base64.getEncoder().encodeToString(out);
    }

    public static boolean validateDateTime(String format, String text) {
        try {
            DateTimeFormatter f = DateTimeFormatter.ofPattern(format);
            LocalDateTime.parse(text, f);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public static boolean xor(boolean a, boolean b) {
        return a ^ b;
    }

    // ---------------------------------------------------------------------
    // Saxon HE integration
    // ---------------------------------------------------------------------
    // Saxon-HE doesn't support reflexive java: calls. To keep XSLT unchanged
    // (e.g., xmlns:java="java:com.xsltplayground.ext.CustomFunctions" and
    // java:uuid()), register integrated extension functions programmatically.
    // Call CustomFunctions.registerAll(processor) once during initialization.

    public static void registerAll(net.sf.saxon.s9api.Processor processor) {
        final String namespace = "java:" + CustomFunctions.class.getName();

        java.lang.reflect.Method[] methods = CustomFunctions.class.getDeclaredMethods();
        for (java.lang.reflect.Method m : methods) {
            int mods = m.getModifiers();
            if (!java.lang.reflect.Modifier.isStatic(mods) || !java.lang.reflect.Modifier.isPublic(mods)) {
                continue;
            }
            if (m.getName().equals("registerAll")) {
                continue;
            }

            String camel = m.getName();
            String kebab = camelToKebab(camel);

            if (m.isVarArgs()) {
                int fixed = m.getParameterCount() - 1;
                int maxVarargs = 8;
                for (int extra = 0; extra <= maxVarargs; extra++) {
                    int arity = fixed + (extra == 0 ? 1 : extra);
                    processor.registerExtensionFunction(new SaxonDynamicFunction(namespace, camel, m, arity));
                    if (!kebab.equals(camel)) {
                        processor.registerExtensionFunction(new SaxonDynamicFunction(namespace, kebab, m, arity));
                    }
                }
            } else {
                int arity = m.getParameterCount();
                processor.registerExtensionFunction(new SaxonDynamicFunction(namespace, camel, m, arity));
                if (!kebab.equals(camel)) {
                    processor.registerExtensionFunction(new SaxonDynamicFunction(namespace, kebab, m, arity));
                }
            }
        }

        // Back-compat alias: support XSLT calls named "parse-dateTime"
        // in addition to the canonical kebab-case "parse-date-time".
        try {
            java.lang.reflect.Method pdt = CustomFunctions.class.getDeclaredMethod("parseDateTime", String.class, String.class);
            processor.registerExtensionFunction(new SaxonDynamicFunction(namespace, "parse-dateTime", pdt, 2));
        } catch (NoSuchMethodException ignore) {
        }
    }

    private static String camelToKebab(String s) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isUpperCase(c)) {
                if (i > 0) sb.append('-');
                sb.append(Character.toLowerCase(c));
            } else {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    private static final class SaxonDynamicFunction implements net.sf.saxon.s9api.ExtensionFunction {
        private final String namespace;
        private final String localName;
        private final java.lang.reflect.Method method;
        private final int arity;

        SaxonDynamicFunction(String namespace, String localName, java.lang.reflect.Method method, int arity) {
            this.namespace = namespace;
            this.localName = localName;
            this.method = method;
            this.arity = arity;
        }

        @Override
        public net.sf.saxon.s9api.QName getName() {
            return new net.sf.saxon.s9api.QName(namespace, localName);
        }

        @Override
        public net.sf.saxon.s9api.SequenceType[] getArgumentTypes() {
            net.sf.saxon.s9api.SequenceType any = net.sf.saxon.s9api.SequenceType
                    .makeSequenceType(net.sf.saxon.s9api.ItemType.ANY_ITEM,
                            net.sf.saxon.s9api.OccurrenceIndicator.ZERO_OR_MORE);
            net.sf.saxon.s9api.SequenceType[] arr = new net.sf.saxon.s9api.SequenceType[arity];
            for (int i = 0; i < arity; i++) arr[i] = any;
            return arr;
        }

        @Override
        public net.sf.saxon.s9api.SequenceType getResultType() {
            // Be permissive on result typing as well
            return net.sf.saxon.s9api.SequenceType
                    .makeSequenceType(net.sf.saxon.s9api.ItemType.ANY_ITEM,
                            net.sf.saxon.s9api.OccurrenceIndicator.ZERO_OR_MORE);
        }

        @Override
        public net.sf.saxon.s9api.XdmValue call(net.sf.saxon.s9api.XdmValue[] arguments) throws net.sf.saxon.s9api.SaxonApiException {
            try {
                Object[] args = buildJavaArgs(arguments);
                Object result = method.invoke(null, args);
                return toXdmValue(result);
            } catch (java.lang.reflect.InvocationTargetException ite) {
                Throwable cause = ite.getTargetException() != null ? ite.getTargetException() : ite;
                throw new net.sf.saxon.s9api.SaxonApiException("Error in extension function '" + method.getName() + "': " + cause.getMessage(), cause);
            } catch (Exception e) {
                throw new net.sf.saxon.s9api.SaxonApiException("Failed to invoke extension function '" + method.getName() + "'", e);
            }
        }

        private Object[] buildJavaArgs(net.sf.saxon.s9api.XdmValue[] arguments) throws Exception {
            Class<?>[] params = method.getParameterTypes();
            boolean isVarArgs = method.isVarArgs();

            if (!isVarArgs) {
                Object[] out = new Object[params.length];
                for (int i = 0; i < params.length; i++) {
                    out[i] = fromXdm(arguments[i], params[i]);
                }
                return out;
            } else {
                int fixed = params.length - 1;
                Object[] out = new Object[params.length];
                for (int i = 0; i < fixed; i++) {
                    out[i] = fromXdm(arguments[i], params[i]);
                }
                // Collect remaining args into the varargs array
                Class<?> comp = params[params.length - 1].getComponentType();
                int varCount = Math.max(0, arguments.length - fixed);
                Object varArray = java.lang.reflect.Array.newInstance(comp, varCount);
                for (int i = 0; i < varCount; i++) {
                    Object v = fromXdm(arguments[fixed + i], comp);
                    java.lang.reflect.Array.set(varArray, i, v);
                }
                out[out.length - 1] = varArray;
                return out;
            }
        }

        // Type mapping helpers removed; using ANY_SEQUENCE for resilience across versions.

        private static net.sf.saxon.s9api.XdmValue toXdmValue(Object result) {
            if (result == null) return net.sf.saxon.s9api.XdmEmptySequence.getInstance();
            if (result instanceof net.sf.saxon.s9api.XdmValue) return (net.sf.saxon.s9api.XdmValue) result;
            if (result instanceof String) return new net.sf.saxon.s9api.XdmAtomicValue((String) result);
            if (result instanceof Integer) return new net.sf.saxon.s9api.XdmAtomicValue(((Integer) result).longValue());
            if (result instanceof Long) return new net.sf.saxon.s9api.XdmAtomicValue(((Long) result).longValue());
            if (result instanceof Double) return new net.sf.saxon.s9api.XdmAtomicValue(((Double) result).doubleValue());
            if (result instanceof Boolean) return new net.sf.saxon.s9api.XdmAtomicValue(((Boolean) result).booleanValue());
            if (result instanceof org.w3c.dom.Node) {
                // Serialize DOM node to string for portability
                try {
                    javax.xml.transform.TransformerFactory tf = javax.xml.transform.TransformerFactory.newInstance();
                    javax.xml.transform.Transformer t = tf.newTransformer();
                    java.io.StringWriter sw = new java.io.StringWriter();
                    t.transform(new javax.xml.transform.dom.DOMSource((org.w3c.dom.Node) result), new javax.xml.transform.stream.StreamResult(sw));
                    return new net.sf.saxon.s9api.XdmAtomicValue(sw.toString());
                } catch (Exception e) {
                    return new net.sf.saxon.s9api.XdmAtomicValue("");
                }
            }
            // Generic fallback to string
            return new net.sf.saxon.s9api.XdmAtomicValue(String.valueOf(result));
        }

        private static Object fromXdm(net.sf.saxon.s9api.XdmValue value, Class<?> target) throws Exception {
            if (target == String.class) {
                if (value == null || value.size() == 0) return "";
                for (net.sf.saxon.s9api.XdmItem it : value) { return it.getStringValue(); }
                return "";
            }
            if (target == int.class || target == Integer.class) {
                if (value == null || value.size() == 0) return (target == Integer.class ? null : 0);
                String s = ""; for (net.sf.saxon.s9api.XdmItem it : value) { s = it.getStringValue(); break; }
                return Integer.parseInt(s);
            }
            if (target == long.class || target == Long.class) {
                if (value == null || value.size() == 0) return (target == Long.class ? null : 0L);
                String s = ""; for (net.sf.saxon.s9api.XdmItem it : value) { s = it.getStringValue(); break; }
                return Long.parseLong(s);
            }
            if (target == double.class || target == Double.class) {
                if (value == null || value.size() == 0) return (target == Double.class ? null : 0d);
                String s = ""; for (net.sf.saxon.s9api.XdmItem it : value) { s = it.getStringValue(); break; }
                return Double.parseDouble(s);
            }
            if (target == boolean.class || target == Boolean.class) {
                if (value == null || value.size() == 0) return (target == Boolean.class ? null : false);
                String s = ""; for (net.sf.saxon.s9api.XdmItem it : value) { s = it.getStringValue(); break; }
                return Boolean.parseBoolean(s);
            }
            if (target == org.w3c.dom.Node.class) {
                if (value == null || value.size() == 0) return null;
                if (value instanceof net.sf.saxon.s9api.XdmNode) {
                    javax.xml.transform.Source src = ((net.sf.saxon.s9api.XdmNode) value).asSource();
                    javax.xml.transform.TransformerFactory tf = javax.xml.transform.TransformerFactory.newInstance();
                    javax.xml.transform.Transformer tr = tf.newTransformer();
                    javax.xml.transform.dom.DOMResult res = new javax.xml.transform.dom.DOMResult();
                    tr.transform(src, res);
                    return res.getNode();
                }
                // Fallback: try to parse string as XML
                String xml = ""; for (net.sf.saxon.s9api.XdmItem it : value) { xml = it.getStringValue(); break; }
                javax.xml.parsers.DocumentBuilderFactory dbf = javax.xml.parsers.DocumentBuilderFactory.newInstance();
                dbf.setNamespaceAware(true);
                return dbf.newDocumentBuilder().parse(new org.xml.sax.InputSource(new java.io.StringReader(xml)));
            }
            if (target.isArray() && target.getComponentType() == String.class) {
                // Expect a sequence of strings in a single argument
                if (value == null || value.size() == 0) return new String[0];
                java.util.List<String> items = new java.util.ArrayList<>();
                for (net.sf.saxon.s9api.XdmItem it : value) {
                    items.add(it.getStringValue());
                }
                return items.toArray(new String[0]);
            }
            // Default to string conversion
            if (value == null || value.size() == 0) return null;
            for (net.sf.saxon.s9api.XdmItem it : value) { return it.getStringValue(); }
            return null;
        }
    }
}
