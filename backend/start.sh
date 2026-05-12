#!/bin/sh
set -e

# ── Saxon 12 — XSLT 3.0 (port 8081) ─────────────────────────────────────────
java \
  -Xms64m -Xmx256m \
  -XX:+UseSerialGC \
  -cp '/opt/saxon12/*' \
  com.xsltplayground.SaxonDaemon &

# ── XSLTC / JDK — XSLT 1.0 (port 8082) ──────────────────────────────────────
java \
  -Xms32m -Xmx128m \
  -XX:+UseSerialGC \
  -cp '/opt/xalan/*' \
  com.xsltplayground.XalanDaemon &

# ── Saxon 9 — XSLT 2.0 (port 8083) ──────────────────────────────────────────
java \
  -Xms32m -Xmx128m \
  -XX:+UseSerialGC \
  -cp '/opt/saxon9/*' \
  com.xsltplayground.Saxon2Daemon &

# ── Wait for all three daemons ────────────────────────────────────────────────
wait_for() {
  PORT=$1
  NAME=$2
  echo "Waiting for $NAME on :$PORT..."
  TRIES=0
  until wget -qO- "http://127.0.0.1:$PORT/health" > /dev/null 2>&1; do
    TRIES=$((TRIES + 1))
    if [ $TRIES -ge 60 ]; then
      echo "$NAME did not start in time" >&2
      exit 1
    fi
    sleep 0.5
  done
  echo "$NAME ready after ${TRIES} probes."
}

wait_for 8081 SaxonDaemon
wait_for 8082 XalanDaemon
wait_for 8083 Saxon2Daemon

# ── Go server in foreground ───────────────────────────────────────────────────
exec ./server
