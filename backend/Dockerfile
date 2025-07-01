# Etapa de build
FROM golang:1.23-alpine AS builder

# Instalar dependencias necesarias
RUN apk add --no-cache git

# Establecer directorio de trabajo
WORKDIR /app/src

# Copiar los archivos
COPY src/ .

RUN rm -rf go.mod go.sum

# Compilar el binario estático
RUN go mod init xslt-playground && \
    go get github.com/gin-gonic/gin && \
    go mod tidy && \
    go build -o server .

# Etapa final (runtime)
FROM alpine:latest

# Instalar Java (para Saxon)
RUN apk add --no-cache openjdk17-jre curl

# Crear directorio de trabajo
WORKDIR /app

# Copiar binario y configuración
COPY --from=builder /app/src/server .
COPY app.config .

# Crear carpeta para Saxon y descargarlo
RUN mkdir -p /opt/saxon && \
    curl -L -o /opt/saxon/saxon-he.jar https://repo1.maven.org/maven2/net/sf/saxon/Saxon-HE/11.6/Saxon-HE-11.6.jar && \
    curl -L -o /opt/saxon/xmlresolver.jar https://repo1.maven.org/maven2/org/xmlresolver/xmlresolver/4.5.0/xmlresolver-4.5.0.jar


# Exponer el puerto por defecto y ejecutar el binario
EXPOSE 8000
CMD ["./server"]
