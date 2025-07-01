import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";

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

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function App() {
  const [params, setParams] = useState([
    { name: "input1", value: "<root/>", open: true },
  ]);
  const [xslt, setXslt] = useState(
    `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n<xsl:template match="/">\n<root/>\n</xsl:template>\n</xsl:stylesheet>`,
  );
  const [editorFocused, setEditorFocused] = useState(false);
  const [result, setResult] = useState("");
  const [version, setVersion] = useState("1.0");
  const [error, setError] = useState("");

  const backendBase = (import.meta.env.VITE_BACKEND_URL || "").replace(
    /\/$/,
    "",
  );

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
        setResult("");
        return;
      }
      const data = await res.json();
      setResult(data.result);
      setError("");
    } catch (e) {
      setError(String(e));
      setResult("");
    }
  }, 500);

  useEffect(() => {
    runTransform(injectParamBlock(xslt, params), version, params);
  }, [xslt, params, version]);

  const updateParam = (index, field, value) => {
    setParams((old) => {
      const copy = [...old];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addParam = () => {
    setParams((p) => [...p, { name: "", value: "", open: false }]);
  };

  const removeParam = (index) => {
    setParams((p) => p.filter((_, i) => i !== index));
  };

  const loadFile = (e, setter, prep = (t) => t) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(prep(reader.result));
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
      <div className="main">
        <div className="params">
          <div style={{ marginBottom: "0.5rem" }}>
            <button onClick={addParam}>Add Parameter</button>
          </div>
          {params.map((p, i) => (
            <div
              key={i}
              style={{ border: "1px solid #ccc", marginBottom: "0.5rem" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "0.25rem",
                }}
              >
                <input
                  style={{ flex: 1 }}
                  placeholder="name"
                  value={p.name}
                  onChange={(e) => updateParam(i, "name", e.target.value)}
                />
                <button onClick={() => updateParam(i, "open", !p.open)}>
                  {p.open ? "-" : "+"}
                </button>
                <button onClick={() => removeParam(i)}>x</button>
              </div>
              {p.open && (
                <div>
                  <Editor
                    height="150px"
                    language="xml"
                    value={p.value}
                    onChange={(v) => updateParam(i, "value", v || "")}
                    options={{ minimap: { enabled: false } }}
                  />
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <input
                      type="file"
                      accept=".xml"
                      onChange={(e) =>
                        loadFile(e, (t) => updateParam(i, "value", t))
                      }
                    />
                    <button
                      onClick={() =>
                        download(p.value, `${p.name || "param"}.xml`)
                      }
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="editor">
          <div style={{ marginBottom: "0.5rem" }}>
            <select
              value={version}
              onChange={(e) => setVersion(e.target.value)}
            >
              <option value="1.0">XSLT 1.0</option>
              <option value="2.0">XSLT 2.0</option>
            </select>
            <input
              type="file"
              accept=".xsl,.xslt"
              onChange={(e) => loadFile(e, (t) => setXslt(stripParamBlock(t)))}
              style={{ marginLeft: "0.5rem" }}
            />
            <button
              onClick={() => download(injectParamBlock(xslt, params), "transform.xsl")}
              style={{ marginLeft: "0.5rem" }}
            >
              Download
            </button>
          </div>
          <Editor
            height="calc(100% - 40px)"
            language="xml"
            value={editorFocused ? xslt : injectParamBlock(xslt, params)}
            onChange={(v) => setXslt(stripParamBlock(v || ""))}
            onFocus={() => setEditorFocused(true)}
            onBlur={() => setEditorFocused(false)}
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
      <div className="result" style={{ position: "relative" }}>
        {error && (
          <div style={{ color: "red", padding: "0.5rem" }}>{error}</div>
        )}
        <Editor
          height="100%"
          language="xml"
          value={result}
          options={{ readOnly: true, minimap: { enabled: false } }}
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
