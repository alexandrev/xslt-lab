# Build stage
FROM golang:1.23-alpine AS builder

RUN apk add --no-cache git openjdk17 curl unzip

# ── Go binary ────────────────────────────────────────────────────────────────
WORKDIR /app/src
COPY src/ .
RUN go mod tidy && go build -o server .

# ── Java daemons ─────────────────────────────────────────────────────────────
WORKDIR /app/ext
COPY ext/ .

# Download JARs for Saxon 12 (XSLT 3.0)
RUN mkdir -p /tmp/saxon12 && \
    curl -L -o /tmp/saxon12/saxon-he.jar \
        https://repo1.maven.org/maven2/net/sf/saxon/Saxon-HE/12.5/Saxon-HE-12.5.jar && \
    curl -L -o /tmp/saxon12/gson.jar \
        https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar

# Download Saxon 9.6 from SourceForge (last true XSLT 2.0 processor) for XSLT 2.0
RUN mkdir -p /tmp/saxon96 && \
    curl -L -o /tmp/saxon96/saxon96.zip \
        "https://sourceforge.net/projects/saxon/files/Saxon-HE/9.6/SaxonHE9-6-0-7J.zip/download" && \
    unzip -j /tmp/saxon96/saxon96.zip saxon9he.jar -d /tmp/saxon96 && \
    rm /tmp/saxon96/saxon96.zip && \
    curl -L -o /tmp/saxon96/gson.jar \
        https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar

# Compile SaxonDaemon + Runner + CustomFunctions against Saxon 12
RUN mkdir -p /tmp/classes12 && \
    javac -cp "/tmp/saxon12/saxon-he.jar:/tmp/saxon12/gson.jar" \
        -d /tmp/classes12 \
        com/xsltplayground/ext/CustomFunctions.java \
        com/xsltplayground/Runner.java \
        com/xsltplayground/SaxonDaemon.java && \
    jar cf /tmp/custom-functions-12.jar -C /tmp/classes12 .

# Compile Saxon2Daemon + CustomFunctions against Saxon 9.6
# (Runner.java excluded — it uses ErrorReporter/XmlProcessingError from Saxon 10+)
RUN mkdir -p /tmp/classes9 && \
    javac -cp "/tmp/saxon96/saxon9he.jar:/tmp/saxon96/gson.jar" \
        -d /tmp/classes9 \
        com/xsltplayground/ext/CustomFunctions.java \
        com/xsltplayground/Saxon2Daemon.java && \
    jar cf /tmp/custom-functions-9.jar -C /tmp/classes9 .

# Compile XalanDaemon — JDK built-in XSLT 1.0 processor, only gson needed
RUN mkdir -p /tmp/classesxalan && \
    javac -cp "/tmp/saxon12/gson.jar" \
        -d /tmp/classesxalan \
        com/xsltplayground/XalanDaemon.java && \
    jar cf /tmp/custom-functions-xalan.jar -C /tmp/classesxalan .

WORKDIR /app/src

# Runtime stage
FROM alpine:latest

RUN apk add --no-cache openjdk17-jre curl wget

WORKDIR /app

COPY --from=builder /app/src/server .
COPY app.config .
COPY start.sh .
RUN chmod +x start.sh

# Saxon 12 (XSLT 3.0) — port 8081
RUN mkdir -p /opt/saxon12 && \
    curl -L -o /opt/saxon12/saxon-he.jar \
        https://repo1.maven.org/maven2/net/sf/saxon/Saxon-HE/12.5/Saxon-HE-12.5.jar && \
    curl -L -o /opt/saxon12/xmlresolver.jar \
        https://repo1.maven.org/maven2/org/xmlresolver/xmlresolver/4.5.0/xmlresolver-4.5.0.jar && \
    curl -L -o /opt/saxon12/gson.jar \
        https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar
COPY --from=builder /tmp/custom-functions-12.jar /opt/saxon12/

# Saxon 9.6 (XSLT 2.0) — port 8083
RUN mkdir -p /opt/saxon9
COPY --from=builder /tmp/saxon96/saxon9he.jar /opt/saxon9/
COPY --from=builder /tmp/saxon96/gson.jar /opt/saxon9/
COPY --from=builder /tmp/custom-functions-9.jar /opt/saxon9/

# XSLTC / JDK built-in (XSLT 1.0) — port 8082
RUN mkdir -p /opt/xalan && \
    curl -L -o /opt/xalan/gson.jar \
        https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar
COPY --from=builder /tmp/custom-functions-xalan.jar /opt/xalan/

EXPOSE 8000
CMD ["./start.sh"]
