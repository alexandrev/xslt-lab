import { useState } from "react";

function getWebhookUrl() {
  return (typeof window !== "undefined" && window.env?.VITE_FEEDBACK_WEBHOOK_URL) || "";
}

async function sendFeedback(payload) {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) return false;
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    }),
  });
  if (!response.ok) throw new Error(`feedback webhook returned ${response.status}`);
  return true;
}

export default function FeedbackWidget({
  kind = "satisfaction",
  reportUrl = "",
  context = {},
  onComplete = () => {},
}) {
  const [expanded, setExpanded] = useState(kind === "bug");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");

  const complete = () => {
    try {
      if (kind === "satisfaction") {
        localStorage.setItem("xsp_satisfaction_feedback_done", "1");
      }
    } catch {}
    onComplete();
  };

  const handleRating = async (rating) => {
    window.gtag?.("event", "contextual_feedback", { kind, rating });
    if (rating === "not_quite") {
      setExpanded(true);
      return;
    }
    setStatus("sending");
    try {
      await sendFeedback({ type: "satisfaction", message: "Helpful", rating, ...context });
      setStatus("success");
      complete();
    } catch {
      // Analytics still records the answer; do not trap the user if the optional
      // webhook is unavailable.
      complete();
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!message.trim()) return;
    setStatus("sending");
    try {
      const payload = {
        type: kind === "bug" ? "bug" : "satisfaction",
        message: message.trim(),
        ...context,
      };
      if (email.trim()) payload.mail = email.trim();
      await sendFeedback(payload);
      window.gtag?.("event", "contextual_feedback", { kind, rating: "details" });
      setStatus("success");
      complete();
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className={`contextual-feedback ${kind}`} role="status">
        Thanks — your feedback was sent.
      </div>
    );
  }

  return (
    <div className={`contextual-feedback ${kind}`} role="complementary">
      <div className="contextual-feedback-heading">
        <span>
          {kind === "bug"
            ? "This looks like a server problem. Want to report it?"
            : "Did this transformation help?"}
        </span>
        <button
          type="button"
          className="contextual-feedback-dismiss"
          onClick={complete}
          aria-label="Dismiss feedback"
        >
          ×
        </button>
      </div>
      {kind === "satisfaction" && !expanded && (
        <div className="contextual-feedback-actions">
          <button type="button" onClick={() => handleRating("helpful")}>Yes</button>
          <button type="button" onClick={() => handleRating("not_quite")}>Not quite</button>
        </div>
      )}
      {expanded && (
        <form onSubmit={handleSubmit}>
          <textarea
            className="feedback-textarea"
            placeholder={kind === "bug" ? "What did you expect to happen?" : "What could be better?"}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={2}
            maxLength={1000}
          />
          <input
            type="email"
            className="feedback-email"
            placeholder="Email (optional)"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          {status === "error" && <p className="feedback-error">Failed to send, try again.</p>}
          <div className="contextual-feedback-actions">
            <button type="submit" disabled={status === "sending" || !message.trim() || !getWebhookUrl()}>
              {status === "sending" ? "Sending…" : "Send feedback"}
            </button>
            {kind === "bug" && reportUrl && (
              <a href={reportUrl} target="_blank" rel="noopener noreferrer">Open GitHub issue</a>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
