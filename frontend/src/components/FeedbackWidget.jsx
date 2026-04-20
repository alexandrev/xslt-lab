import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const STORAGE_KEY = "feedbackPos2"; // v2: new default position top-right
const MIN_MARGIN = 10;
const DEFAULT_MARGIN = 24;
const WIDGET_WIDTH = 220;
const TOOLBAR_HEIGHT = 68; // approx height of the toolbar above the editor

function getWebhookUrl() {
  return (window.env && window.env.VITE_FEEDBACK_WEBHOOK_URL) || "";
}

export default function FeedbackWidget() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("feedbackCollapsed") || "false");
    } catch {
      return false;
    }
  });
  const widgetRef = useRef(null);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [position, setPosition] = useState(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed?.x === "number" && typeof parsed?.y === "number") {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [opensUp, setOpensUp] = useState(false);

  // Form state
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("idea");
  const [status, setStatus] = useState("idle"); // idle | sending | success | error

  const resolvedPosition = useMemo(() => {
    if (position) return position;
    const vw = viewportWidth || (typeof window !== "undefined" ? window.innerWidth : 800);
    return {
      x: Math.max(MIN_MARGIN, vw - WIDGET_WIDTH - DEFAULT_MARGIN),
      y: TOOLBAR_HEIGHT,
    };
  }, [position, viewportWidth]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setViewportWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("feedbackCollapsed", JSON.stringify(collapsed));
    } catch {}
  }, [collapsed]);

  const clampWithinViewport = useCallback((pos) => {
    if (!pos || typeof window === "undefined" || !widgetRef.current) return pos;
    const rect = widgetRef.current.getBoundingClientRect();
    const maxX = Math.max(MIN_MARGIN, window.innerWidth - rect.width - MIN_MARGIN);
    const maxY = Math.max(MIN_MARGIN, window.innerHeight - rect.height - MIN_MARGIN);
    return {
      x: Math.min(Math.max(MIN_MARGIN, pos.x), maxX),
      y: Math.min(Math.max(MIN_MARGIN, pos.y), maxY),
    };
  }, []);

  useLayoutEffect(() => {
    if (!position) return;
    const next = clampWithinViewport(position);
    if (!next) return;
    if (next.x !== position.x || next.y !== position.y) setPosition(next);
  }, [position, clampWithinViewport, viewportHeight, viewportWidth, collapsed]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event) => {
      event.preventDefault();
      dragMovedRef.current = true;
      const widget = widgetRef.current;
      const widgetRect = widget?.getBoundingClientRect();
      const maxX = Math.max(MIN_MARGIN, window.innerWidth - (widgetRect?.width ?? 0) - MIN_MARGIN);
      const maxY = Math.max(MIN_MARGIN, window.innerHeight - (widgetRect?.height ?? 0) - MIN_MARGIN);
      setPosition({
        x: Math.min(Math.max(MIN_MARGIN, event.clientX - offset.x), maxX),
        y: Math.min(Math.max(MIN_MARGIN, event.clientY - offset.y), maxY),
      });
    };
    const stop = () => setDragging(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [dragging, offset]);

  useEffect(() => {
    if (dragging || !position) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position));
    } catch {}
  }, [dragging, position]);

  useLayoutEffect(() => {
    if (!widgetRef.current || !viewportHeight) return;
    const rect = widgetRef.current.getBoundingClientRect();
    setOpensUp(rect.top + rect.height / 2 > viewportHeight / 2);
  }, [position, collapsed, viewportHeight]);

  const dragMovedRef = useRef(false);

  const startDrag = (event) => {
    event.preventDefault();
    dragMovedRef.current = false;
    const rect = event.currentTarget.getBoundingClientRect();
    setOffset({ x: event.clientX - rect.left, y: event.clientY - rect.top });
    setDragging(true);
  };

  const handleHeaderClick = () => {
    if (!dragMovedRef.current) setCollapsed((prev) => !prev);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    const webhookUrl = getWebhookUrl();
    if (!webhookUrl) return;
    setStatus("sending");
    try {
      const payload = {
        type,
        message: message.trim(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };
      if (email.trim()) payload.mail = email.trim();
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setStatus("success");
      setMessage("");
      setEmail("");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div
      ref={widgetRef}
      className={`feedback-widget ${collapsed ? "collapsed" : ""} ${opensUp ? "opens-up" : ""}`}
      style={{ left: resolvedPosition.x, top: resolvedPosition.y }}
    >
      <div
        className="feedback-header"
        onMouseDown={startDrag}
        onClick={handleHeaderClick}
        style={{ cursor: "grab" }}
      >
        <span>Feedback</span>
        <span aria-hidden="true">{collapsed ? "▲" : "▼"}</span>
      </div>
      {!collapsed && (
        <div className="feedback-body">
          {status === "success" ? (
            <div className="feedback-success">
              <p>Thanks! Your feedback has been sent 🙏</p>
              <button
                type="button"
                className="feedback-submit"
                onClick={() => setStatus("idle")}
              >
                Send another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <select
                className="feedback-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
              >
                <option value="idea">💡 Idea</option>
                <option value="bug">🐞 Bug</option>
                <option value="other">💬 Other</option>
              </select>
              <textarea
                className="feedback-textarea"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                maxLength={1000}
              />
              <input
                type="email"
                className="feedback-email"
                placeholder="Email (optional)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {status === "error" && (
                <p className="feedback-error">Failed to send, try again.</p>
              )}
              <button
                type="submit"
                className="feedback-submit"
                disabled={status === "sending" || !message.trim() || !getWebhookUrl()}
              >
                {status === "sending" ? "Sending…" : "Send feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
