# Etapa de build
FROM golang:1.23-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache git openjdk17 curl

# Establecer directorio de trabajo
WORKDIR /app/src

# Copiar los archivos
COPY src/ .

# Compilar el binario estático
RUN go mod tidy && \
    go build -o server .

# Build extension functions jar + SaxonDaemon
WORKDIR /app/ext
COPY ext/ .
RUN mkdir -p /tmp/saxon && \
    curl -L -o /tmp/saxon/saxon-he.jar https://repo1.maven.org/maven2/net/sf/saxon/Saxon-HE/12.5/Saxon-HE-12.5.jar && \
    curl -L -o /tmp/saxon/gson.jar https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar && \
    javac -cp "/tmp/saxon/saxon-he.jar:/tmp/saxon/gson.jar" \
        com/xsltplayground/ext/CustomFunctions.java \
        com/xsltplayground/Runner.java \
        com/xsltplayground/SaxonDaemon.java && \
    jar cf custom-functions.jar com

WORKDIR /app/src

# Etapa final (runtime)
FROM alpine:latest

# Instalar Java y wget (para el health-check en start.sh)
RUN apk add --no-cache openjdk17-jre curl wget

# Crear directorio de trabajo
WORKDIR /app

# Copiar binario, configuración y script de arranque
COPY --from=builder /app/src/server .
COPY app.config .
COPY start.sh .
RUN chmod +x start.sh

# Crear carpeta para Saxon y descargar JARs
RUN mkdir -p /opt/saxon && \
    curl -L -o /opt/saxon/saxon-he.jar https://repo1.maven.org/maven2/net/sf/saxon/Saxon-HE/12.5/Saxon-HE-12.5.jar && \
    curl -L -o /opt/saxon/xmlresolver.jar https://repo1.maven.org/maven2/org/xmlresolver/xmlresolver/4.5.0/xmlresolver-4.5.0.jar && \
    curl -L -o /opt/saxon/gson.jar https://repo1.maven.org/maven2/com/google/code/gson/gson/2.11.0/gson-2.11.0.jar

# Extension functions + daemon jar
COPY --from=builder /app/ext/custom-functions.jar /opt/saxon/

# Exponer el puerto del API y arrancar con el script
EXPOSE 8000
CMD ["./start.sh"]
