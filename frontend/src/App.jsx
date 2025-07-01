import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import logo from "./logo.svg";

const PARAM_START = "<!--PARAMS_START-->";
const PARAM_END = "<!--PARAMS_END-->";

function stripParamBlock(text) {
  const start = text.indexOf(PARAM_START);
  const end = text.indexOf(PARAM_END);
  if (start !== -1 && end !== -1 && end > start) {
    let before = text.slice(0, start);
    let after = text.slice(end + PARAM_END.length);
    if (before.endsWith("\n")) before = before.slice(0, -1);
    if (after.startsWith("\n")) after = after.slice(1);
    return before + after;
  }
  return text;
}

function injectParamBlock(text, params) {
  const clean = stripParamBlock(text);
  const match = clean.match(/<xsl:stylesheet[^>]*>/);
  if (!match) return clean;
  const idx = match.index + match[0].length;
  const paramLines = params
    .filter((p) => p.name)
    .map((p) => `<xsl:param name="${p.name}"/>`)
    .join("\n");
  const block = `\n${PARAM_START}\n${paramLines}\n${PARAM_END}`;
  return clean.slice(0, idx) + block + clean.slice(idx);
}

function extractParamNames(text) {
  const clean = stripParamBlock(text);
  const names = new Set();
  const regex = /<xsl:param[^>]*name="([^"]+)"[^>]*>/g;
  let m;
  while ((m = regex.exec(clean))) {
    names.add(m[1]);
  }
  return Array.from(names);
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const goPro = import.meta.env.VITE_GO_PRO === "true";

function defaultTab() {
  return {
    id: Date.now() + Math.random(),
    params: [{ name: "input1", value: "<root/>", open: true }],
    xslt: `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n<xsl:template match="/">\n<root/>\n</xsl:template>\n</xsl:stylesheet>`,
    version: "1.0",
  };
}

export default function App() {
  const [tabs, setTabs] = useState(() => {
    if (goPro) {
      try {
        const stored = sessionStorage.getItem("tabs");
        if (stored) return JSON.parse(stored);
      } catch {}
    }
    return [defaultTab()];
  });
  const [active, setActive] = useState(() => tabs[0].id);
  const [editorFocused, setEditorFocused] = useState(false);
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [duration, setDuration] = useState(null);
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);

  const backendBase = (import.meta.env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  useEffect(() => {
    if (goPro) {
      sessionStorage.setItem("tabs", JSON.stringify(tabs));
    }
  }, [tabs]);

  useEffect(() => {
    if (!goPro) return;
    try {
      const cfg = import.meta.env.VITE_FIREBASE_CONFIG;
      if (cfg) {
        const app = initializeApp(JSON.parse(cfg));
        const a = getAuth(app);
        setAuth(a);
        a.onAuthStateChanged((u) => setUser(u));
      }
    } catch {}
  }, []);

  const activeTab = tabs.find((t) => t.id === active) || tabs[0];

  const runTransform = debounce(async (xsltText, ver, p) => {
    const paramObj = {};
    p.forEach((pr) => {
      if (pr.name) paramObj[pr.name] = pr.value;
    });
    try {
      const res = await fetch(`${backendBase}/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xslt: xsltText,
          version: ver,
          parameters: paramObj,
        }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || res.statusText);
        setDuration(null);
        setResult("");
        return;
      }
      const data = await res.json();
      setResult(data.result);
      setDuration(data.duration_ms);
      setError("");
    } catch (e) {
      setError(String(e));
      setResult("");
      setDuration(null);
    }
  }, 500);

  useEffect(() => {
    runTransform(
      injectParamBlock(activeTab.xslt, activeTab.params),
      activeTab.version,
      activeTab.params,
    );
  }, [activeTab]);

  useEffect(() => {
    const names = extractParamNames(activeTab.xslt);
    setTabs((tabs) =>
      tabs.map((t) => {
        if (t.id !== active) return t;
        let params = [...t.params];
        let changed = false;
        names.forEach((n) => {
          if (!params.some((p) => p.name === n)) {
            params.push({ name: n, value: "", open: false });
            changed = true;
          }
        });
        const filtered = params.filter((p) => names.includes(p.name) || p.value);
        if (filtered.length !== params.length) {
          params = filtered;
          changed = true;
        }
        return changed ? { ...t, params } : t;
      }),
    );
  }, [activeTab.xslt]);

  const updateParam = (index, field, value) => {
    setTabs((tabs) =>
      tabs.map((t) => {
        if (t.id !== active) return t;
        const params = [...t.params];
        if (field === "open" && value) {
          params.forEach((p, i) => {
            if (i !== index) p.open = false;
          });
        }
        params[index] = { ...params[index], [field]: value };
        return { ...t, params };
      }),
    );
  };

  const addParam = () => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === active ? { ...t, params: [...t.params, { name: "", value: "", open: false }] } : t,
      ),
    );
  };

  const removeParam = (index) => {
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === active ? { ...t, params: t.params.filter((_, i) => i !== index) } : t,
      ),
    );
  };

  const loadFile = (e, setter, prep = (t) => t) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(prep(reader.result));
    reader.readAsText(file);
  };

  const handleDrop = (e, setter) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsText(file);
  };

  const handleDropNewParam = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const name = file.name.replace(/\.[^.]+$/, "");
      setTabs((tabs) =>
        tabs.map((t) =>
          t.id === active
            ? {
                ...t,
                params: [
                  ...t.params,
                  { name, value: reader.result, open: false },
                ],
              }
            : t,
        ),
      );
    };
    reader.readAsText(file);
  };

  const download = (data, filename) => {
    const blob = new Blob([data], { type: "text/xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <div className="header">
        <div style={{ display: "flex", alignItems: "center" }}>
          <img src={logo} alt="logo" className="logo" />
          <strong>xsltplayground.com</strong>
        </div>
        {goPro && auth && (
          <div>
            {user ? (
              <button onClick={() => signOut(auth)}>Sign out</button>
            ) : (
              <button onClick={() => signInWithPopup(auth, new GoogleAuthProvider())}>Sign in</button>
            )}
          </div>
        )}
      </div>
      {goPro && (
        <div className="tabs">
          {tabs.map((t, idx) => (
            <button
              key={t.id}
              className={t.id === active ? "active" : ""}
              onClick={() => setActive(t.id)}
            >
              {`Transform ${idx + 1}`}
            </button>
          ))}
          <button
            className="icon-button"
            onClick={() => {
              const nt = defaultTab();
              setTabs((tabs) => [...tabs, nt]);
              setActive(nt.id);
            }}
          >
            ➕
          </button>
        </div>
      )}
      <div className="main">
        <div
          className="params"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDropNewParam}
        >
          <div style={{ marginBottom: "0.5rem" }}>
            <button className="icon-button" onClick={addParam}>➕</button>
          </div>
          {activeTab.params.map((p, i) => (
            <div key={i} style={{ border: "1px solid #ccc", marginBottom: "0.5rem" }}>
              <div style={{ display: "flex", alignItems: "center", padding: "0.25rem" }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="name"
                  value={p.name}
                  onChange={(e) => updateParam(i, "name", e.target.value)}
                />
                <button className="icon-button" onClick={() => updateParam(i, "open", !p.open)}>{p.open ? "▼" : "▶"}</button>
                <button className="icon-button" onClick={() => removeParam(i)}>❌</button>
              </div>
              {p.open && (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.stopPropagation();
                    handleDrop(e, (t) => updateParam(i, "value", t));
                  }}
                >
                  <Editor
                    height="150px"
                    language="xml"
                    value={p.value}
                    onChange={(v) => updateParam(i, "value", v || "")}
                    options={{ minimap: { enabled: false }, automaticLayout: true }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <label className="icon-button file-label">
                      📤
                      <input
                        type="file"
                        accept=".xml"
                        className="file-input"
                        onChange={(e) => loadFile(e, (t) => updateParam(i, "value", t))}
                      />
                    </label>
                    <button className="icon-button" onClick={() => download(p.value, `${p.name || "param"}.xml`)}>📥</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="editor">
          <div style={{ marginBottom: "0.5rem" }} className="toggle">
            <button
              className={activeTab.version === "1.0" ? "active" : ""}
              onClick={() =>
                setTabs((tabs) =>
                  tabs.map((t) => (t.id === active ? { ...t, version: "1.0" } : t)),
                )
              }
            >
              XSLT 1.0
            </button>
            <button
              className={activeTab.version === "2.0" ? "active" : ""}
              onClick={() =>
                setTabs((tabs) =>
                  tabs.map((t) => (t.id === active ? { ...t, version: "2.0" } : t)),
                )
              }
            >
              XSLT 2.0
            </button>
            <label className="icon-button file-label" style={{ marginLeft: "0.5rem" }}>
              📤
              <input
                type="file"
                accept=".xsl,.xslt"
                className="file-input"
                onChange={(e) =>
                  loadFile(e, (t) =>
                    setTabs((tabs) =>
                      tabs.map((tab) =>
                        tab.id === active ? { ...tab, xslt: stripParamBlock(t) } : tab,
                      ),
                    )
                  )
                }
              />
            </label>
            <button
              className="icon-button"
              onClick={() =>
                download(
                  injectParamBlock(activeTab.xslt, activeTab.params),
                  "transform.xsl",
                )
              }
              style={{ marginLeft: "0.5rem" }}
            >
              📥
            </button>
          </div>
          <Editor
            height="100%"
            language="xml"
            wrapperProps={{
              style: { flex: 1, height: "100%", minHeight: 0 },
              onDragOver: (e) => e.preventDefault(),
              onDrop: (e) =>
                handleDrop(e, (t) =>
                  setTabs((tabs) =>
                    tabs.map((tab) =>
                      tab.id === active ? { ...tab, xslt: stripParamBlock(t) } : tab,
                    ),
                  ),
                ),
            }}
            value={editorFocused ? activeTab.xslt : injectParamBlock(activeTab.xslt, activeTab.params)}
            onChange={(v) =>
              setTabs((tabs) =>
                tabs.map((tab) =>
                  tab.id === active ? { ...tab, xslt: stripParamBlock(v || "") } : tab,
                ),
              )
            }
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            options={{ minimap: { enabled: false }, automaticLayout: true }}
          />
        </div>
      </div>
      <div className="result" style={{ position: "relative" }}>
        {error ? (
          <div className="error-box">{error}</div>
        ) : (
          duration !== null && (
            <div className="success-box">Success in {duration} ms</div>
          )
        )}
        <Editor
          height="100%"
          language="xml"
          value={result}
          options={{ readOnly: true, minimap: { enabled: false }, automaticLayout: true }}
        />
      </div>
      <div className="banner">Anuncio</div>
    </div>
  );
}

/* Optional Firebase Auth example
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
// const firebaseConfig = { ... };
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// function login() { signInWithPopup(auth, provider); }
*/
