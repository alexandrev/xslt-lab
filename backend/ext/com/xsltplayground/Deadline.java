package com.xsltplayground;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;

import java.io.IOException;
import java.io.OutputStream;
import java.nio.charset.StandardCharsets;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicReference;

/**
 * Puts a time limit on every transformation a daemon runs.
 *
 * The Go server gives up on a daemon after 10 seconds, but giving up only
 * closes its side of the connection: the handler thread here kept going. On
 * 2026-09-29 one traced request left a Saxon 12 worker spinning at a full core
 * for half an hour, which alone pushed the HPA to its maximum of five pods,
 * and with a pool of two threads a second one would have left that daemon
 * unable to answer anything at all.
 *
 * So each request runs on its own thread. If it outlives LIMIT_MS it is
 * interrupted, and if it ignores that (Saxon does not poll for interrupts) it
 * is stopped. The caller gets an ordinary error before Go's timeout, so the
 * user sees why rather than a 503. Thread.stop still works on the JDK 17
 * runtime the image installs. A thread that survives even that leaves this JVM
 * burning a core for good, so the daemon answers the request and then exits;
 * start.sh restarts that one JVM in seconds. (Until 2026-10-01 it only
 * reported itself unhealthy, and the liveness probe replaced the whole
 * container, all three daemons and the Go server with it.)
 *
 * It also answers for a handler that died without answering. The handlers
 * catch Exception, but runaway recursion ends in StackOverflowError (Saxon 9)
 * or OutOfMemoryError (XSLTC), which are Errors: the thread died, nobody
 * replied, and Go waited out its 10 seconds and reported a 503.
 */
final class Deadline {

    /** Below the Go client's 10 s, leaving room for the stop and the reply. */
    static final long LIMIT_MS = 8_500;
    private static final long INTERRUPT_GRACE_MS = 200;
    private static final long STOP_GRACE_MS = 1_000;

    private static final AtomicBoolean POISONED = new AtomicBoolean(false);
    private static final AtomicInteger SEQ = new AtomicInteger();

    private Deadline() {}

    /** True once a transformation could not be stopped; /health should fail. */
    static boolean poisoned() {
        return POISONED.get();
    }

    static HttpHandler guard(HttpHandler inner) {
        return exchange -> {
            AtomicReference<Throwable> failure = new AtomicReference<>();
            Thread worker = new Thread(() -> {
                try {
                    inner.handle(exchange);
                } catch (IOException ignored) {
                    // The client went away; nothing left to tell it.
                }
            }, "transform-" + SEQ.incrementAndGet());
            worker.setDaemon(true);
            // A stopped thread dies with ThreadDeath; that is expected, not news.
            worker.setUncaughtExceptionHandler((t, e) -> {
                failure.set(e);
                if (!(e instanceof ThreadDeath)) {
                    System.err.println(t.getName() + " failed: " + e);
                }
            });
            worker.start();

            boolean stopped = false;
            try {
                worker.join(LIMIT_MS);
                if (worker.isAlive()) {
                    worker.interrupt();
                    worker.join(INTERRUPT_GRACE_MS);
                }
                if (worker.isAlive()) {
                    stopped = true;
                    stop(worker);
                    worker.join(STOP_GRACE_MS);
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }

            if (!stopped) {
                // Finished in time. Normally the handler has replied already.
                if (exchange.getResponseCode() == -1) {
                    reply(exchange, diagnose(failure.get()));
                }
                return;
            }

            boolean survived = worker.isAlive();
            if (survived) {
                POISONED.set(true);
                System.err.println("Deadline: " + worker.getName()
                        + " survived Thread.stop; exiting so start.sh restarts this JVM");
            } else {
                System.err.println("Deadline: stopped " + worker.getName()
                        + " after " + LIMIT_MS + " ms");
            }
            reply(exchange, "The transformation was stopped after " + (LIMIT_MS / 1000.0) + " seconds. "
                    + "Look for a template or function that recurses without end, or a loop over a very "
                    + "large input. Tracing makes a transformation many times slower, so if trace is on, "
                    + "try it with trace off.");
            if (survived) exitSoon();
        };
    }

    /** Exit once the reply above has had time to leave; start.sh restarts us. */
    private static void exitSoon() {
        Thread t = new Thread(() -> {
            try { Thread.sleep(300); } catch (InterruptedException ignored) { }
            System.exit(3);
        }, "deadline-exit");
        t.setDaemon(false);
        t.start();
    }

    private static String diagnose(Throwable t) {
        if (t instanceof StackOverflowError) {
            return "Too many nested template or function calls. The stylesheet may be recursing without end.";
        }
        if (t instanceof OutOfMemoryError) {
            return "The transformation ran out of memory. The stylesheet may be recursing without end, "
                    + "or building a result far larger than the input.";
        }
        return "The transformation failed unexpectedly" + (t != null ? ": " + t : ".");
    }

    @SuppressWarnings({"deprecation", "removal"})
    private static void stop(Thread worker) {
        try {
            worker.stop();
        } catch (UnsupportedOperationException e) {
            // JDK 20+: nothing more can be done from inside the JVM.
        }
    }

    private static void reply(HttpExchange exchange, String msg) {
        byte[] body = ("{\"error\":\"" + msg.replace("\\", "\\\\").replace("\"", "\\\"") + "\"}")
                .getBytes(StandardCharsets.UTF_8);
        try {
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            exchange.sendResponseHeaders(200, body.length);
            try (OutputStream os = exchange.getResponseBody()) { os.write(body); }
        } catch (IOException | IllegalStateException e) {
            // The worker had already started replying, or Go already hung up.
        } finally {
            exchange.close();
        }
    }
}
