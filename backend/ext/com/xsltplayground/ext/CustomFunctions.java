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
}
