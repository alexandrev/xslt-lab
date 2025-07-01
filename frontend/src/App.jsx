import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

export default function App() {
  const [params, setParams] = useState([{ name: 'input1', value: '<root/>', open: true }]);
  const [xslt, setXslt] = useState('<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n<xsl:template match="/">\n<root/>\n</xsl:template>\n</xsl:stylesheet>');
  const [result, setResult] = useState('');
  const [version, setVersion] = useState('1.0');
  const [error, setError] = useState('');

  const runTransform = debounce(async (xsltText, ver, p) => {
    const paramObj = {};
    p.forEach((pr) => {
      if (pr.name) paramObj[pr.name] = pr.value;
    });
    try {
      const res = await fetch('/transform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ xslt: xsltText, version: ver, parameters: paramObj }),
      });
      if (!res.ok) {
        const txt = await res.text();
        setError(txt || res.statusText);
        setResult('');
        return;
      }
      const data = await res.json();
      setResult(data.result);
      setError('');
    } catch (e) {
      setError(String(e));
      setResult('');
    }
  }, 500);

  useEffect(() => {
    runTransform(xslt, version, params);
  }, [xslt, params, version]);

  const updateParam = (index, field, value) => {
    setParams((old) => {
      const copy = [...old];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const addParam = () => {
    setParams((p) => [...p, { name: '', value: '', open: false }]);
  };

  const removeParam = (index) => {
    setParams((p) => p.filter((_, i) => i !== index));
  };

  const loadFile = (e, setter) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setter(reader.result);
    reader.readAsText(file);
  };

  const download = (data, filename) => {
    const blob = new Blob([data], { type: 'text/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <div className="main">
        <div className="params">
          <div style={{ marginBottom: '0.5rem' }}>
            <button onClick={addParam}>Add Parameter</button>
          </div>
          {params.map((p, i) => (
            <div key={i} style={{ border: '1px solid #ccc', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', padding: '0.25rem' }}>
                <input
                  style={{ flex: 1 }}
                  placeholder="name"
                  value={p.name}
                  onChange={(e) => updateParam(i, 'name', e.target.value)}
                />
                <button onClick={() => updateParam(i, 'open', !p.open)}>{p.open ? '-' : '+'}</button>
                <button onClick={() => removeParam(i)}>x</button>
              </div>
              {p.open && (
                <div style={{ height: '150px' }}>
                  <Editor
                    height="150px"
                    language="xml"
                    value={p.value}
                    onChange={(v) => updateParam(i, 'value', v || '')}
                    options={{ minimap: { enabled: false } }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <input type="file" accept=".xml" onChange={(e) => loadFile(e, (text) => updateParam(i, 'value', text))} />
                    <button onClick={() => download(p.value, `${p.name||'param'}.xml`)}>Download</button>
                  </div>
                </div>
              )
            </div>
          ))}
        </div>
        <div className="editor">
          <div style={{ marginBottom: '0.5rem' }}>
            <select value={version} onChange={(e) => setVersion(e.target.value)}>
              <option value="1.0">XSLT 1.0</option>
              <option value="2.0">XSLT 2.0</option>
            </select>
            <input type="file" accept=".xsl,.xslt" onChange={(e) => loadFile(e, setXslt)} style={{ marginLeft: '0.5rem' }} />
            <button onClick={() => download(xslt, 'transform.xsl')} style={{ marginLeft: '0.5rem' }}>Download</button>
          </div>
          <Editor
            height="calc(100% - 40px)"
            language="xml"
            value={xslt}
            onChange={(v) => setXslt(v || '')}
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
      <div className="result" style={{ position: 'relative' }}>
        {error && <div style={{ color: 'red', padding: '0.5rem' }}>{error}</div>}
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

// Firebase Auth (optional)
/*
// import { initializeApp } from "firebase/app";
// import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
// const firebaseConfig = { /* your config */ };
// const app = initializeApp(firebaseConfig);
// const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
// function login() { signInWithPopup(auth, provider); }
*/
