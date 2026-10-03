#!/bin/sh
set -e

# Each daemon runs under a small supervisor: if its JVM exits — Deadline does
# that on purpose when a runaway thread survives Thread.stop, and a crash ends
# up there too — it is started again a couple of seconds later. Only that
# version is briefly unavailable; the other two and the Go server carry on.
supervise() {
  NAME=$1
  shift
  (
    while true; do
      "$@" || true
      echo "$NAME exited; restarting in 2s" >&2
      sleep 2
    done
  ) &
}

# ── Saxon 12 — XSLT 3.0 (port 8081) ─────────────────────────────────────────
supervise SaxonDaemon java \
  -Xms64m -Xmx256m \
  -XX:+UseSerialGC \
  -cp '/opt/saxon12/*' \
  com.xsltplayground.SaxonDaemon

# ── XSLTC / JDK — XSLT 1.0 (port 8082) ──────────────────────────────────────
supervise XalanDaemon java \
  -Xms32m -Xmx128m \
  -XX:+UseSerialGC \
  -cp '/opt/xalan/*' \
  com.xsltplayground.XalanDaemon

# ── Saxon 9.6 — XSLT 2.0 (port 8083) ────────────────────────────────────────
supervise Saxon2Daemon java \
  -Xms32m -Xmx128m \
  -XX:+UseSerialGC \
  -cp '/opt/saxon9/*' \
  com.xsltplayground.Saxon2Daemon

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
