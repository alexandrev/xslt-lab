import React, { useState } from "react";

export default function Feedback() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("Bug");
  const [desc, setDesc] = useState("");

  const env = window.env || import.meta.env;
  const email = env.VITE_FEEDBACK_EMAIL || "feedback@example.com";

  const send = () => {
    const subject = encodeURIComponent("XSLT Playground Feedback");
    const body = encodeURIComponent(
      `Name & Address: ${name}\nType: ${type}\n\n${desc}`,
    );
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  return (
    <div className="feedback-widget">
      <button className="feedback-button" onClick={() => setOpen(!open)}>
        📬
      </button>
      {open && (
        <div className="feedback-form">
          <input
            placeholder="Name & address"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <select value={type} onChange={(e) => setType(e.target.value)}>
            <option value="Bug">Bug</option>
            <option value="Feature">Feature</option>
          </select>
          <textarea
            placeholder="Description"
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          <button onClick={send}>Send</button>
        </div>
      )}
    </div>
  );
}
