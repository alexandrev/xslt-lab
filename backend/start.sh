#!/bin/sh
set -e

# Start Saxon daemon in background
java \
  -Xms64m -Xmx256m \
  -XX:+UseSerialGC \
  -cp /opt/saxon/* \
  com.xsltplayground.SaxonDaemon &

DAEMON_PID=$!

# Wait until the daemon responds on /health (max 30s)
echo "Waiting for SaxonDaemon..."
TRIES=0
until wget -qO- http://127.0.0.1:8081/health > /dev/null 2>&1; do
  TRIES=$((TRIES + 1))
  if [ $TRIES -ge 60 ]; then
    echo "SaxonDaemon did not start in time" >&2
    exit 1
  fi
  sleep 0.5
done
echo "SaxonDaemon ready after ${TRIES} probes."

# Start Go server in foreground
exec ./server
