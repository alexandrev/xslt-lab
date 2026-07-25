import { useState, useEffect, useCallback, useRef, useMemo, lazy, Suspense } from "react";
import logo from "./logo.svg";
import TabsNav from "./components/TabsNav";
import DataPipelineHeader from "./components/DataPipelineHeader";
import Icon from "./components/Icon";
import {
  parseErrorLines,
  stripParamBlock,
  injectParamBlock,
  addParams,
  extractParamNames,
  setStylesheetVersion,
  detectVersionUpgradeHint,
  findErrorReference,
} from "./lib/workspaceUtils";
import { templateToWorkspace, findTemplate } from "./lib/templates";
import { diffLines } from "./lib/diffUtils";
import { encodeCompact, decodeCompact, toSharePayload, fromSharePayload } from "./lib/shareLink";

/* global __APP_VERSION__, __GIT_COMMIT__ */

const WELCOME_EXAMPLE = {
  name: "Quick start — edit me!",
  version: "1.0",
  xslt: `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="xml" indent="yes"/>

  <!-- Filter books by language and build a summary -->
  <xsl:template match="/">
    <catalog total="{count(//book)}">
      <xsl:apply-templates select="//book[@lang='en']"/>
    </catalog>
  </xsl:template>

  <xsl:template match="book">
    <item>
      <xsl:value-of select="title"/>
      <xsl:text> — </xsl:text>
      <xsl:value-of select="author"/>
      <xsl:text> (</xsl:text>
      <xsl:value-of select="year"/>
      <xsl:text>)</xsl:text>
    </item>
  </xsl:template>
</xsl:stylesheet>`,
  params: [
    {
      name: "input",
      value: `<books>
  <book lang="en">
    <title>XSLT 2.0 and XPath 2.0</title>
    <author>Michael Kay</author>
    <year>2008</year>
  </book>
  <book lang="es">
    <title>Aprende XML con XSLT</title>
    <author>Jorge Pérez</author>
    <year>2010</year>
  </book>
  <book lang="en">
    <title>XML in a Nutshell</title>
    <author>Harold &amp; Means</author>
    <year>2004</year>
  </book>
</books>`,
      open: true,
    },
  ],
};

// Saxon output for WELCOME_EXAMPLE. Seeded into the result pane on first visit so
// the largest element on the page paints immediately instead of waiting for the
// debounce + /transform round-trip (this element is the LCP candidate). The real
// transform still runs and overwrites this a moment later.
const WELCOME_EXAMPLE_RESULT = `<?xml version="1.0" encoding="UTF-8"?><catalog total="3">
    <item>XSLT 2.0 and XPath 2.0 — Michael Kay (2008)</item>
    <item>XML in a Nutshell — Harold &amp; Means (2004)</item>
</catalog>
`;

// Hand-picked CodeMirror setup instead of @uiw/react-codemirror. Its default
// basicSetup statically pulls @codemirror/autocomplete, /lint and /search into
// the critical chunk (we already load lint+autocomplete on demand, so they were
// shipping twice). Importing only the primitives below keeps ~31KB gzip of
// editor code off the first paint. See useEditorExtras for the deferred half.
import { EditorState, Compartment, Annotation } from "@codemirror/state";
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  drawSelection,
  keymap,
} from "@codemirror/view";
import { history, historyKeymap, defaultKeymap, indentWithTab } from "@codemirror/commands";
import {
  syntaxHighlighting,
  defaultHighlightStyle,
  indentOnInput,
  bracketMatching,
  syntaxTree,
} from "@codemirror/language";
import { xml, completeFromSchema } from "@codemirror/lang-xml";
import { oneDark } from "@codemirror/theme-one-dark";

// Marks doc changes we pushed programmatically from the `value` prop, so the
// updateListener doesn't echo them back through onChange (feedback loop).
const ExternalChange = Annotation.define();

// Fixed sizing/appearance applied to every instance.
const cmSizeTheme = EditorView.theme({
  "&": { height: "100%", fontSize: "13px" },
  ".cm-scroller": { height: "100% !important" },
});

function xmlLinter(view) {
  const text = view.state.doc.toString().trim();
  if (!text) return [];
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, "application/xml");
  const err = doc.querySelector("parsererror");
  if (!err) return [];
  const msg = err.textContent || "XML parse error";
  const lineMatch = msg.match(/[Ll]ine[:\s]+(\d+)/);
  const colMatch = msg.match(/[Cc]ol(?:umn)?[:\s]+(\d+)/);
  const line = lineMatch ? parseInt(lineMatch[1], 10) - 1 : 0;
  const col = colMatch ? parseInt(colMatch[1], 10) - 1 : 0;
  const lineObj = view.state.doc.line(Math.min(line + 1, view.state.doc.lines));
  const from = Math.min(lineObj.from + col, lineObj.to);
  const to = lineObj.to;
  const clean = msg.replace(/Below is a rendering.*$/s, "").trim();
  return [{ from, to: Math.max(from + 1, to), severity: "error", message: clean }];
}

// Linting, autocompletion and hover docs are useless until the user starts typing,
// but they pull in @codemirror/lint, @codemirror/autocomplete and the ~50KB
// completions table. Loading them after the editor mounts keeps them off the
// critical path; the editor reconfigures itself once they land.
let editorExtras = null;
let editorExtrasPromise = null;
const editorExtrasListeners = new Set();

function loadEditorExtras() {
  if (editorExtras) return Promise.resolve(editorExtras);
  if (editorExtrasPromise) return editorExtrasPromise;
  editorExtrasPromise = Promise.all([
    import("@codemirror/lint"),
    import("@codemirror/autocomplete"),
    import("@codemirror/view"),
    import("./lib/xsltCompletions"),
  ])
    .then(([lintMod, acMod, viewMod, completionsMod]) => {
      editorExtras = {
        lintExtension: lintMod.linter(xmlLinter, { delay: 500 }),
        lintGutter: lintMod.lintGutter,
        autocompletion: acMod.autocompletion,
        hoverTooltip: viewMod.hoverTooltip,
        getCompletions: completionsMod.getCompletions,
        getXmlElements: completionsMod.getXmlElements,
        getHoverTooltip: completionsMod.getHoverTooltip,
      };
      editorExtrasListeners.forEach((notify) => notify());
      return editorExtras;
    })
    .catch((err) => {
      // Editing still works without them; don't take the editor down with it.
      editorExtrasPromise = null;
      console.error("Failed to load editor extras", err);
      return null;
    });
  return editorExtrasPromise;
}

function useEditorExtras(enabled) {
  const [extras, setExtras] = useState(editorExtras);
  useEffect(() => {
    if (!enabled || extras) return undefined;
    const notify = () => setExtras(editorExtras);
    editorExtrasListeners.add(notify);
    const cancel = runWhenIdle(() => loadEditorExtras());
    return () => {
      editorExtrasListeners.delete(notify);
      cancel();
    };
  }, [enabled, extras]);
  return extras;
}

const FeedbackWidget = lazy(() => import("./components/FeedbackWidget"));
const TemplateGallery = lazy(() => import("./components/TemplateGallery"));

function runWhenIdle(callback, timeout = 2000) {
  if (typeof window === "undefined") {
    return () => {};
  }
  if ("requestIdleCallback" in window) {
    const id = window.requestIdleCallback(callback, { timeout });
    return () => window.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(callback, timeout);
  return () => window.clearTimeout(id);
}

// Theme extension for a given app theme. oneDark carries its own highlight
// style; light mode uses the default one.
function cmThemeExt(theme) {
  return theme === "vs-dark"
    ? oneDark
    : syntaxHighlighting(defaultHighlightStyle);
}

// Static, always-critical extensions derived from options. Kept in a compartment
// so a rare options change reconfigures in place rather than recreating the view.
function cmBaseExt(options, editable) {
  const ext = [
    xml({ autoCloseTags: editable }),
    history(),
    keymap.of([...defaultKeymap, ...historyKeymap, indentWithTab]),
  ];
  if (options.lineNumbers !== "off") ext.push(lineNumbers());
  if (editable) {
    ext.push(
      drawSelection(),
      highlightActiveLine(),
      indentOnInput(),
      bracketMatching(),
    );
  }
  if (options.wordWrap) ext.push(EditorView.lineWrapping);
  ext.push(EditorState.readOnly.of(!editable), EditorView.editable.of(editable));
  return ext;
}

// The on-demand half: lint + autocomplete + hover docs. Empty until
// useEditorExtras resolves; only meaningful for editable editors.
function cmExtrasExt(extras, editable, xsltVersion) {
  if (!editable || !extras) return [];
  const { autocompletion, hoverTooltip, lintGutter } = extras;
  const ext = [extras.lintExtension, lintGutter()];
  if (xsltVersion) {
    const completions = extras.getCompletions(xsltVersion);
    const hoverDesc = extras.getHoverTooltip(xsltVersion);
    const xmlElements = extras.getXmlElements(xsltVersion);
    // xsl:* elements and XPath functions. Skip when the cursor sits on an
    // attribute name, letting the schema source handle it.
    const xsltSource = (ctx) => {
      const node = syntaxTree(ctx.state).resolveInner(ctx.pos, -1);
      if (node.name === "AttributeName") return null;
      const word = ctx.matchBefore(/[\w:()-]+/);
      if (!word && !ctx.explicit) return null;
      return {
        from: word ? word.from : ctx.pos,
        options: completions,
        validFor: /^[\w:()-]*$/,
      };
    };
    const attrSource = completeFromSchema(xmlElements, []);
    ext.push(
      autocompletion({ override: [xsltSource, attrSource] }),
      hoverTooltip((view, pos) => hoverDesc.resolve(view, pos), { hoverTime: 300 }),
    );
  }
  return ext;
}

function Editor({
  height,
  value,
  onChange,
  theme,
  options = {},
  wrapperProps,
  onFocus,
  onBlur,
  eager,
  // eslint-disable-next-line no-unused-vars
  language,
  onMount,
  xsltVersion,
}) {
  const editable = !options.readOnly;
  const extras = useEditorExtras(editable);

  // Building an EditorView is the single most expensive thing this component
  // does, and the page mounts several at once — enough main-thread work during
  // load to wreck INP for anyone who interacts early. Only the editor marked
  // `eager` (the stylesheet, which the user goes straight to) is built up
  // front; the rest are built when the browser goes idle, or immediately if
  // the user reaches them first.
  const [viewReady, setViewReady] = useState(Boolean(eager));
  useEffect(() => {
    if (viewReady) return undefined;
    const cancel = runWhenIdle(() => setViewReady(true), 300);
    return () => cancel?.();
  }, [viewReady]);

  const containerRef = useRef(null);
  const viewRef = useRef(null);
  const compartments = useRef(null);
  if (!compartments.current) {
    compartments.current = {
      theme: new Compartment(),
      base: new Compartment(),
      extras: new Compartment(),
    };
  }

  // Keep the latest callbacks reachable from CodeMirror listeners without
  // reconfiguring the view every time a parent re-renders with new closures.
  const cbRef = useRef({});
  cbRef.current = { onChange, onFocus, onBlur };

  // Create the view once.
  useEffect(() => {
    if (!viewReady) return undefined;
    const c = compartments.current;
    const state = EditorState.create({
      doc: value ?? "",
      extensions: [
        cmSizeTheme,
        syntaxHighlighting(defaultHighlightStyle),
        c.theme.of(cmThemeExt(theme)),
        c.base.of(cmBaseExt(options, editable)),
        c.extras.of(cmExtrasExt(extras, editable, xsltVersion)),
        EditorView.updateListener.of((vu) => {
          if (
            vu.docChanged &&
            !vu.transactions.some((tr) => tr.annotation(ExternalChange))
          ) {
            cbRef.current.onChange?.(vu.state.doc.toString());
          }
        }),
        EditorView.domEventHandlers({
          focus: () => cbRef.current.onFocus?.(),
          blur: () => cbRef.current.onBlur?.(),
        }),
      ],
    });
    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    onMount?.(view);
    return () => {
      view.destroy();
      viewRef.current = null;
    };
    // Mount-only; live prop changes are handled by the reconfigure effects below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewReady]);

  // Sync the controlled value without stomping the cursor on our own edits.
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const next = value ?? "";
    if (next !== view.state.doc.toString()) {
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: next },
        annotations: [ExternalChange.of(true)],
      });
    }
  }, [value]);

  // Reconfigure compartments when the inputs that shape them change.
  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.current.theme.reconfigure(cmThemeExt(theme)),
    });
  }, [theme]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.current.base.reconfigure(cmBaseExt(options, editable)),
    });
    // options is a fresh literal each render; depend on the fields we read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editable, options.lineNumbers, options.wordWrap]);

  useEffect(() => {
    viewRef.current?.dispatch({
      effects: compartments.current.extras.reconfigure(
        cmExtrasExt(extras, editable, xsltVersion),
      ),
    });
  }, [extras, editable, xsltVersion]);

  const style = height ? { height, overflow: "hidden" } : undefined;
  if (!viewReady) {
    // Show the text meanwhile so nothing moves when the real editor takes over,
    // and upgrade on the first sign the user is heading for this editor.
    const upgrade = () => setViewReady(true);
    return (
      <div
        style={style}
        {...wrapperProps}
        className="editor-placeholder"
        onPointerDown={upgrade}
        onFocus={upgrade}
        tabIndex={-1}
      >
        <pre>{value ?? ""}</pre>
      </div>
    );
  }
  return <div style={style} {...wrapperProps} ref={containerRef} />;
}

function debounce(fn, delay) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

const env = window.env || import.meta.env;
const goPro = env.VITE_GO_PRO === "true";
const adsenseClient = env.VITE_ADSENSE_CLIENT;
const adsenseSlot = env.VITE_ADSENSE_SLOT;
const ethicalAdsPublisher = env.VITE_ETHICALADS_PUBLISHER || "xsltplaygroundcom";
const defaultRepoUrl = "https://github.com/alexandrev/xslt-lab";
const repoUrl = env.VITE_REPO_URL || defaultRepoUrl;
const newsUrl = env.VITE_NEWS_URL || "https://xsltplayground.com/blog/";
const resolvedVersion =
  typeof __APP_VERSION__ !== "undefined" && __APP_VERSION__
    ? __APP_VERSION__
    : env.VITE_APP_VERSION || "";
const gitCommit =
  typeof __GIT_COMMIT__ !== "undefined" && __GIT_COMMIT__
    ? __GIT_COMMIT__
    : "";
const commitUrl = gitCommit ? `${repoUrl}/commit/${gitCommit}` : repoUrl;

function defaultTab(overrides = {}) {
  const base = {
    id: Date.now() + Math.random(),
    params: [{ name: "input1", value: "<root/>", open: true }],
    xslt: `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n<xsl:template match="/">\n<root/>\n</xsl:template>\n</xsl:stylesheet>`,
    version: "1.0",
    name: "",
    expected: "",
  };
  const merged = { ...base, ...overrides };
  return {
    ...merged,
    id: overrides.id ?? base.id,
    params: Array.isArray(merged.params) ? merged.params : base.params,
    xslt: typeof merged.xslt === "string" ? merged.xslt : base.xslt,
    version: merged.version || base.version,
    name: typeof merged.name === "string" ? merged.name : base.name,
    expected: typeof merged.expected === "string" ? merged.expected : base.expected,
  };
}

// Embedded mode (?embed=1): the app is rendered inside an iframe on the blog's
// reference pages, so it drops the ads and workspace chrome and shows just the
// editor plus a way out to the full app.
const IS_EMBED = (() => {
  try {
    return new URLSearchParams(window.location.search).get("embed") === "1";
  } catch {
    return false;
  }
})();

const MAX_WORKSPACES = 3;
const WORKSPACE_EXPORT_VERSION = 1;
const RESULT_HEIGHT_KEY = "resultPaneHeight";
const DEFAULT_RESULT_RATIO = 0.4;
const MIN_RESULT_HEIGHT = 180;
const MIN_MAIN_HEIGHT = 320;
const PARAM_WIDTH_KEY = "paramsPaneWidth";
const DEFAULT_PARAM_WIDTH = 320;
const MIN_PARAM_WIDTH = 220;
const MIN_EDITOR_WIDTH = 360;
const ETHICAL_AD_COMPACT_BREAKPOINT = 1024;
const ETHICAL_AD_TEXT_BREAKPOINT = 720;
const THEME_STORAGE_KEY = "themeMode";
const THEME_DARK = "dark";
const THEME_LIGHT = "light";

function defaultWorkspaceStatus() {
  return {
    result: "",
    duration: null,
    serverMs: null,
    error: "",
    errorLines: [],
    isServerError: false,
    traceEntries: [],
    traceText: "",
    showRawTrace: false,
    resultView: "source",
    isRunning: false,
    secondaryResults: {},
  };
}

export function buildBugReportUrl(version, error, xslt) {
  const trimmedXslt = xslt ? xslt.slice(0, 500) : "";
  const body = [
    "## Bug report",
    "",
    `**XSLT version:** ${version || "default"}`,
    `**Error:** ${error || ""}`,
    "",
    "**Stylesheet (first 500 chars):**",
    "```xml",
    trimmedXslt,
    "```",
  ].join("\n");
  const title = `Server error: ${(error || "").slice(0, 80)}`;
  return (
    "https://github.com/alexandrev/xslt-lab/issues/new" +
    `?labels=bug&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}`
  );
}

function looksLikeHtml(text) {
  if (!text || typeof text !== "string") return false;
  const trimmed = text.trim();
  if (!trimmed.startsWith("<")) return false;
  const lowered = trimmed.slice(0, 200).toLowerCase();
  return (
    lowered.startsWith("<!doctype html") ||
    /^<html\b/.test(lowered) ||
    /^<body\b/.test(lowered)
  );
}

// ── URL preload helpers ─────────────────────────────────────────────────────

function b64Encode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function b64Decode(str) {
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4 ? "=".repeat(4 - (padded.length % 4)) : "";
  return decodeURIComponent(escape(atob(padded + pad)));
}

function parseUrlPreload() {
  try {
    const params = new URLSearchParams(window.location.search);
    if (!params.has("xslt")) return null;
    const xslt = b64Decode(params.get("xslt"));
    const xml = params.has("xml") ? b64Decode(params.get("xml")) : null;
    const version = params.get("version") || "1.0";
    const title = params.get("title") || "Preloaded example";
    const xmlParams = xml
      ? [{ name: "input", value: xml, open: true }]
      : undefined;
    return { xslt, version, name: title, ...(xmlParams ? { params: xmlParams } : {}) };
  } catch {
    return null;
  }
}

function buildShareUrl(tab) {
  const params = new URLSearchParams();
  params.set("xslt", b64Encode(tab.xslt));
  if (tab.params?.length > 0 && tab.params[0]?.value) {
    params.set("xml", b64Encode(tab.params[0].value));
  }
  params.set("version", tab.version || "1.0");
  if (tab.name) params.set("title", b64Encode(tab.name));
  return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
}

// Prefer the compressed ?c= form when it is actually shorter; fall back to the
// plain link if compression is unavailable (older browsers) or doesn't help.
async function buildShareUrlCompact(tab) {
  const plain = buildShareUrl(tab);
  try {
    const encoded = await encodeCompact(toSharePayload(tab));
    if (!encoded) return plain;
    const compact = `${window.location.origin}${window.location.pathname}?c=${encoded}`;
    return compact.length < plain.length ? compact : plain;
  } catch {
    return plain;
  }
}

// ───────────────────────────────────────────────────────────────────────────

function normalizeWorkspaceImport(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Workspace file is empty or invalid.");
  }
  if (
    payload.schemaVersion &&
    payload.schemaVersion !== WORKSPACE_EXPORT_VERSION
  ) {
    throw new Error(
      `Unsupported workspace format version ${payload.schemaVersion}.`,
    );
  }
  const workspace = payload.workspace || payload;
  if (!workspace.xslt || typeof workspace.xslt !== "string") {
    throw new Error("Workspace file is missing the XSLT content.");
  }
  const baseParams = defaultTab().params;
  const params = Array.isArray(workspace.params)
    ? workspace.params.map((p, idx) => ({
        name: typeof p?.name === "string" ? p.name : `param${idx + 1}`,
        value: typeof p?.value === "string" ? p.value : "",
        open: Boolean(p?.open),
      }))
    : baseParams;
  const status =
    payload.status && typeof payload.status === "object"
      ? { ...defaultWorkspaceStatus(), ...payload.status }
      : defaultWorkspaceStatus();
  return {
    workspace: {
      params,
      xslt: workspace.xslt,
      version: workspace.version || "1.0",
      expected: typeof workspace.expected === "string" ? workspace.expected : "",
    },
    status,
  };
}


function SecondaryResultItem({ href, content, theme }) {
  const [collapsed, setCollapsed] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      navigator.clipboard?.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <div className="secondary-result-item">
      <div className="secondary-result-header">
        <button
          type="button"
          className="icon-button"
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand secondary output" : "Collapse secondary output"}
          title={collapsed ? "Expand" : "Collapse"}
        >
          <Icon name={collapsed ? "chevron-right" : "chevron-down"} />
        </button>
        <span className="secondary-result-href" title={href}>{href}</span>
        <button
          type="button"
          className="icon-button"
          onClick={handleCopy}
          aria-label="Copy secondary output"
          title={copied ? "Copied!" : "Copy"}
        >
          <Icon name={copied ? "check" : "copy"} />
        </button>
      </div>
      {!collapsed && (
        <div className="secondary-result-body">
          <Editor
            height="200px"
            language="xml"
            theme={theme}
            value={content}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              automaticLayout: true,
              lineNumbers: "off",
              wordWrap: "bounded",
              wordWrapBreakAfterCharacters: ' \t})]?|>',
            }}
          />
        </div>
      )}
    </div>
  );
}

export default function App() {
  // URL preload takes priority over localStorage
  const urlPreload = parseUrlPreload();
  const urlVersion = (() => {
    try {
      const v = new URLSearchParams(window.location.search).get("v");
      return ["1.0", "2.0", "3.0"].includes(v) ? v : null;
    } catch { return null; }
  })();
  if (urlPreload || urlVersion) {
    // Remove query params from the URL without reloading
    window.history.replaceState({}, "", window.location.pathname);
  }

  let initialTabs = [defaultTab()];
  let isFirstVisit = false;
  if (urlPreload) {
    initialTabs = [defaultTab(urlPreload)];
  } else {
    try {
      const stored = localStorage.getItem("tabs");
      if (stored) {
        initialTabs = JSON.parse(stored);
      } else {
        isFirstVisit = true;
        initialTabs = [defaultTab(WELCOME_EXAMPLE)];
      }
    } catch {}
    if (!Array.isArray(initialTabs)) {
      initialTabs = [defaultTab()];
    }
    initialTabs = initialTabs.map((tab) => {
      if (!tab || typeof tab !== "object") return defaultTab();
      return defaultTab({
        id: tab.id,
        params: tab.params,
        xslt: tab.xslt,
        version: tab.version,
        name: tab.name,
      });
    });
    if (initialTabs.length > MAX_WORKSPACES) {
      initialTabs = initialTabs.slice(0, MAX_WORKSPACES);
    }
    // Apply ?v= version override to the active tab
    if (urlVersion) {
      initialTabs = initialTabs.map((tab, i) =>
        i === 0
          ? { ...tab, version: urlVersion, xslt: setStylesheetVersion(tab.xslt, urlVersion) }
          : tab
      );
    }
  }
  // ?template=<id> opens a starter workspace directly — this is what the
  // /xpath-tester/ and /xml-to-json/ landing pages link to.
  try {
    const templateId = new URLSearchParams(window.location.search).get("template");
    const template = templateId ? findTemplate(templateId) : null;
    if (template) {
      initialTabs = [defaultTab(templateToWorkspace(template))];
    }
  } catch {}

  let initialActive = initialTabs[0]?.id;
  try {
    const sAct = localStorage.getItem("active");
    if (sAct) initialActive = JSON.parse(sAct);
  } catch {}

  const readStoredWorkspaceStatus = () => {
    try {
      const stored = localStorage.getItem("workspaceStatus");
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    return {};
  };

  const [tabs, setTabs] = useState(initialTabs);
  const [active, setActive] = useState(initialActive);
  const [workspaceStatus, setWorkspaceStatus] = useState(() => {
    const stored = readStoredWorkspaceStatus();
    const initialStatus = {};
    initialTabs.forEach((tab, i) => {
      initialStatus[tab.id] = stored[tab.id]
        ? { ...defaultWorkspaceStatus(), ...stored[tab.id] }
        : defaultWorkspaceStatus();
      // First visit shows WELCOME_EXAMPLE, whose output is known at build time.
      // Seed it so the result pane renders on mount rather than ~2s later.
      // duration/serverMs stay null — no timing is claimed until the real run lands.
      if (isFirstVisit && i === 0 && !stored[tab.id]) {
        initialStatus[tab.id].result = WELCOME_EXAMPLE_RESULT;
      }
    });
    return initialStatus;
  });

  const [shareCopied, setShareCopied] = useState(false);
  const [resultCopied, setResultCopied] = useState(false);
  const copyResult = () => {
    if (!result) return;
    try {
      navigator.clipboard?.writeText(result);
      setResultCopied(true);
      setTimeout(() => setResultCopied(false), 2000);
    } catch {}
  };
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
  const [theme, setTheme] = useState(() => {
    if (typeof window === "undefined") return THEME_LIGHT;
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === THEME_DARK || stored === THEME_LIGHT) return stored;
    } catch {}
    try {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? THEME_DARK
        : THEME_LIGHT;
    } catch {}
    return THEME_LIGHT;
  });
  const isDarkTheme = theme === THEME_DARK;
  const editorTheme = isDarkTheme ? "vs-dark" : "light";
  const resultEditorRef = useRef(null);
  const traceHoverTimeoutRef = useRef(null);
  const traceTableWrapRef = useRef(null);
  const traceNameRefs = useRef([]);
  const tabsRef = useRef(tabs);
  const [traceEnabled, setTraceEnabled] = useState(() => {
    try { return JSON.parse(localStorage.getItem("traceEnabled") || "false"); } catch { return false; }
  });
  const [traceCollapsed, setTraceCollapsed] = useState(false);
  const [traceHover, setTraceHover] = useState(null);
  const [traceNameWidth, setTraceNameWidth] = useState(240);
  const [traceScrollLeft, setTraceScrollLeft] = useState(0);
  const [paramsCollapsed, setParamsCollapsed] = useState(false);
  const [namedParamsOpen, setNamedParamsOpen] = useState(false);
  const [errorCollapsed, setErrorCollapsed] = useState(false);
  const [ethicalAdsReady, setEthicalAdsReady] = useState(false);
  const [transformCount, setTransformCount] = useState(0);
  const [userHasTransformed, setUserHasTransformed] = useState(false);
  const [satisfactionDone, setSatisfactionDone] = useState(() => {
    try { return localStorage.getItem("xsp_satisfaction_feedback_done") === "1"; } catch { return false; }
  });
  const [serverErrorCount, setServerErrorCount] = useState(0);
  const [bugFeedbackDismissed, setBugFeedbackDismissed] = useState(false);
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [compareOpen, setCompareOpen] = useState(false);
  const [xsltBeforeFormat, setXsltBeforeFormat] = useState(null);
  const [resultBeforeFormat, setResultBeforeFormat] = useState(null);
  const workspaceImportRef = useRef(null);
  const resultResizeState = useRef({ startY: 0, startHeight: MIN_RESULT_HEIGHT });
  const paramResizeState = useRef({ startX: 0, startWidth: DEFAULT_PARAM_WIDTH });
  const lastAdRefreshRef = useRef(0);
  const adVisibleRef = useRef(false);
  const maybeRefreshAd = () => {
    const now = Date.now();
    if (
      adVisibleRef.current &&
      document.visibilityState === "visible" &&
      now - lastAdRefreshRef.current >= 60_000 &&
      window.ethicalads
    ) {
      window.ethicalads.reload();
      lastAdRefreshRef.current = now;
    }
  };
  const [resultHeight, setResultHeight] = useState(() => {
    try {
      const stored = localStorage.getItem(RESULT_HEIGHT_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "number" && Number.isFinite(parsed)) {
          return parsed;
        }
      }
    } catch {}
    return null;
  });
  const [paramWidth, setParamWidth] = useState(() => {
    if (typeof window === "undefined") return DEFAULT_PARAM_WIDTH;
    try {
      const stored = localStorage.getItem(PARAM_WIDTH_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (typeof parsed === "number" && Number.isFinite(parsed)) {
          return Math.max(parsed, MIN_PARAM_WIDTH);
        }
      }
    } catch {}
    return DEFAULT_PARAM_WIDTH;
  });
  const [isResizingResult, setIsResizingResult] = useState(false);
  const [isResizingParams, setIsResizingParams] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 0,
  );
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth : 0,
  );
  const [userInteracted, setUserInteracted] = useState(false);
  const [widgetsReady, setWidgetsReady] = useState(false);
  const [autoRunReady, setAutoRunReady] = useState(() => !!urlPreload || isFirstVisit);
  const ethicalSlotRef = useRef(null);
  const isLocalhost =
    typeof window !== "undefined" &&
    /^(localhost|127(?:\\.[0-9]+){3}|mac)$/i.test(window.location.hostname);
  const ethicalAdsEnabled =
    !IS_EMBED &&
    Boolean(ethicalAdsPublisher) &&
    (!isLocalhost || env.VITE_ETHICALADS_DEV === "true");
  const ethicalAdVariant = "stickybox";

  const backendBase = (env.VITE_BACKEND_URL || "").replace(/\/$/, "");

  useEffect(() => {
    const gaId = env.VITE_GA_ID;
    if (!gaId || !userInteracted) return;
    let cancelled = false;
    const cancelIdle = runWhenIdle(async () => {
      if (cancelled) return;
      try {
        const { default: GA4React } = await import("ga-4-react");
        if (cancelled) return;
        const ga4react = new GA4React(gaId);
        ga4react.initialize().catch((err) => console.error(err));
      } catch (err) {
        console.error(err);
      }
    }, 2500);
    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, [userInteracted]);

  useEffect(() => {
    const enable = () => {
      setUserInteracted(true);
      setAutoRunReady(true);
      setWidgetsReady(true);
    };
    window.addEventListener("pointerdown", enable, { once: true });
    window.addEventListener("keydown", enable, { once: true });
    return () => {
      window.removeEventListener("pointerdown", enable);
      window.removeEventListener("keydown", enable);
    };
  }, []);

  // Persist workspace on change
  useEffect(() => {
    try {
      localStorage.setItem("tabs", JSON.stringify(tabs));
      localStorage.setItem("active", JSON.stringify(active));
    } catch {}
  }, [tabs, active]);

  useEffect(() => {
    try {
      localStorage.setItem("workspaceStatus", JSON.stringify(workspaceStatus));
    } catch {}
  }, [workspaceStatus]);

  useEffect(() => {
    try { localStorage.setItem("traceEnabled", JSON.stringify(traceEnabled)); } catch {}
  }, [traceEnabled]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

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
      if (resultHeight === null) {
        localStorage.removeItem(RESULT_HEIGHT_KEY);
      } else {
        localStorage.setItem(RESULT_HEIGHT_KEY, JSON.stringify(resultHeight));
      }
    } catch {}
  }, [resultHeight]);
  useEffect(() => {
    try {
      localStorage.setItem(PARAM_WIDTH_KEY, JSON.stringify(paramWidth));
    } catch {}
  }, [paramWidth]);

  useEffect(() => {
    if (traceCollapsed) {
      setTraceHover(null);
      setTraceScrollLeft(0);
    }
  }, [traceCollapsed]);

  useEffect(() => {
    const el = ethicalSlotRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { adVisibleRef.current = entry.isIntersecting; },
      { threshold: 0.5 },
    );
    observer.observe(el);
    const id = setInterval(maybeRefreshAd, 30_000);
    return () => {
      clearInterval(id);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    setWorkspaceStatus((prev) => {
      let changed = false;
      const next = {};
      tabs.forEach((tab) => {
        if (prev[tab.id]) {
          next[tab.id] = prev[tab.id];
        } else {
          next[tab.id] = defaultWorkspaceStatus();
          changed = true;
        }
      });
      if (Object.keys(prev).length !== tabs.length) {
        changed = true;
      }
      return changed ? next : prev;
    });
  }, [tabs]);

  useEffect(() => {
    if (tabs.length === 0) {
      return;
    }
    if (!tabs.some((t) => t.id === active)) {
      setActive(tabs[0].id);
    }
  }, [tabs, active]);

  useEffect(() => {
    if (!traceEnabled) {
      setTraceHover(null);
      setTraceCollapsed(false);
    }
  }, [traceEnabled]);

  useEffect(() => {
    const closeOnChange = () => setTraceHover(null);
    window.addEventListener("scroll", closeOnChange, true);
    window.addEventListener("resize", closeOnChange);
    return () => {
      window.removeEventListener("scroll", closeOnChange, true);
      window.removeEventListener("resize", closeOnChange);
    };
  }, []);

  const activeTab = tabs.find((t) => t.id === active) || tabs[0];
  const primaryInput = activeTab.params[0];
  const namedParamCount = Math.max(activeTab.params.length - 1, 0);
  const activeStatus = activeTab
    ? (workspaceStatus[activeTab.id] || defaultWorkspaceStatus())
    : defaultWorkspaceStatus();
  const {
    result,
    duration,
    serverMs,
    error,
    errorLines,
    isServerError,
    traceEntries,
    traceText,
    showRawTrace,
    resultView,
    isRunning,
    secondaryResults,
  } = activeStatus;
  const MAX_ERROR_LINES = 3;
  const limitedErrorLines = (errorLines || []).slice(0, MAX_ERROR_LINES);
  const hasHiddenErrors = (errorLines || []).length > MAX_ERROR_LINES;
  const canCopyErrors = Boolean((errorLines && errorLines.length) || error);
  const showResultPane = !error;
  const canRenderHtml = useMemo(() => looksLikeHtml(result), [result]);
  const effectiveResultView = canRenderHtml ? resultView || "source" : "source";
  const TRACE_NAME_LIMIT = 80;
  const TRACE_VALUE_LIMIT = 200;
  const EMPTY_SYMBOL = "(empty)";
  const TRACE_NAME_MIN_WIDTH = 120;
  const TRACE_NAME_PADDING = 40;
  const clampResultPaneHeight = useCallback(
    (value) => {
      const numericValue =
        typeof value === "number" && Number.isFinite(value)
          ? value
          : MIN_RESULT_HEIGHT;
      if (!viewportHeight) {
        return Math.max(MIN_RESULT_HEIGHT, Math.round(numericValue));
      }
      const maxHeight = Math.max(
        MIN_RESULT_HEIGHT,
        viewportHeight - MIN_MAIN_HEIGHT,
      );
      return Math.min(
        Math.max(Math.round(numericValue), MIN_RESULT_HEIGHT),
        maxHeight,
      );
    },
    [viewportHeight],
  );
  const clampParamPaneWidth = useCallback(
    (value) => {
      const numericValue =
        typeof value === "number" && Number.isFinite(value)
          ? value
          : DEFAULT_PARAM_WIDTH;
      const viewportLimit =
        viewportWidth && viewportWidth > 0
          ? Math.max(MIN_PARAM_WIDTH, viewportWidth - MIN_EDITOR_WIDTH)
          : Number.POSITIVE_INFINITY;
      const maxWidth = Number.isFinite(viewportLimit)
        ? viewportLimit
        : Math.max(MIN_PARAM_WIDTH, numericValue);
      return Math.min(
        Math.max(Math.round(numericValue), MIN_PARAM_WIDTH),
        maxWidth,
      );
    },
    [viewportWidth],
  );
  const fallbackViewportHeight = viewportHeight || 800;
  const resolvedResultHeight = useMemo(
    () =>
      clampResultPaneHeight(
        resultHeight ??
          Math.round(fallbackViewportHeight * DEFAULT_RESULT_RATIO),
      ),
    [resultHeight, fallbackViewportHeight, clampResultPaneHeight],
  );
  const isCustomResultHeight = resultHeight !== null;
  useEffect(() => {
    setParamWidth((prev) => clampParamPaneWidth(prev));
  }, [clampParamPaneWidth]);

  useEffect(() => {
    if (!error) {
      setErrorCollapsed(false);
    }
  }, [error]);

  const clampTraceNameWidth = useCallback(() => {
    const container = traceTableWrapRef.current;
    if (!container) {
      return;
    }
    const maxWidth = Math.max(
      TRACE_NAME_MIN_WIDTH,
      container.clientWidth - 160,
    );
    setTraceNameWidth((prev) =>
      Math.min(Math.max(prev, TRACE_NAME_MIN_WIDTH), maxWidth),
    );
  }, []);

  if (traceNameRefs.current.length !== traceEntries.length) {
    traceNameRefs.current.length = traceEntries.length;
  }

  useEffect(() => {
    clampTraceNameWidth();
  }, [traceCollapsed, traceEntries.length, clampTraceNameWidth]);

  useEffect(() => {
    const handleResize = () => clampTraceNameWidth();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [clampTraceNameWidth]);

  useEffect(() => {
    setTraceScrollLeft(0);
  }, [traceEntries]);

  useEffect(() => {
    setResultHeight((prev) => {
      if (prev === null) return prev;
      const clamped = clampResultPaneHeight(prev);
      return clamped === prev ? prev : clamped;
    });
  }, [clampResultPaneHeight]);

  useEffect(() => {
    if (!isResizingResult) return;
    const handleMove = (event) => {
      event.preventDefault();
      const delta = event.clientY - resultResizeState.current.startY;
      const nextHeight = clampResultPaneHeight(
        resultResizeState.current.startHeight - delta,
      );
      setResultHeight(nextHeight);
    };
    const stop = () => setIsResizingResult(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [isResizingResult, clampResultPaneHeight]);

  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!isResizingResult) return undefined;
    const { style } = document.body;
    const previousCursor = style.cursor;
    const previousSelect = style.userSelect;
    style.cursor = "row-resize";
    style.userSelect = "none";
    return () => {
      style.cursor = previousCursor;
      style.userSelect = previousSelect;
    };
  }, [isResizingResult]);
  useEffect(() => {
    if (!isResizingParams) return;
    const handleMove = (event) => {
      event.preventDefault();
      const delta = event.clientX - paramResizeState.current.startX;
      const nextWidth = clampParamPaneWidth(
        paramResizeState.current.startWidth + delta,
      );
      setParamWidth(nextWidth);
    };
    const stop = () => setIsResizingParams(false);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", stop);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", stop);
    };
  }, [isResizingParams, clampParamPaneWidth]);
  useEffect(() => {
    if (typeof document === "undefined") return undefined;
    if (!isResizingParams) return undefined;
    const { style } = document.body;
    const previousCursor = style.cursor;
    const previousSelect = style.userSelect;
    style.cursor = "col-resize";
    style.userSelect = "none";
    return () => {
      style.cursor = previousCursor;
      style.userSelect = previousSelect;
    };
  }, [isResizingParams]);
  useEffect(() => {
    if (!paramsCollapsed) return;
    setIsResizingParams(false);
  }, [paramsCollapsed]);

  useEffect(() => {
    if (!goPro) return;
    let cancelled = false;
    const cancelIdle = runWhenIdle(async () => {
      if (cancelled) return;
      try {
        const cfg = env.VITE_FIREBASE_CONFIG;
        if (!cfg) return;
        const [{ initializeApp }, { getAuth }] = await Promise.all([
          import("firebase/app"),
          import("firebase/auth"),
        ]);
        if (cancelled) return;
        const app = initializeApp(JSON.parse(cfg));
        const a = getAuth(app);
        setAuth(a);
        a.onAuthStateChanged((u) => setUser(u));
      } catch {}
    }, 2500);
    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, [goPro]);

  useEffect(() => {
    tabsRef.current = tabs;
  }, [tabs]);

  const updateWorkspaceStatus = useCallback((tabId, updates) => {
    if (!tabId) return;
    if (!tabsRef.current.some((t) => t.id === tabId)) {
      return;
    }
    setWorkspaceStatus((prev) => {
      const current = prev[tabId]
        ? { ...defaultWorkspaceStatus(), ...prev[tabId] }
        : defaultWorkspaceStatus();
      const next =
        typeof updates === "function"
          ? updates(current)
          : { ...current, ...updates };
      return { ...prev, [tabId]: next };
    });
  }, []);

  useEffect(() => {
    if (!activeTab) return;
    if (!canRenderHtml && resultView === "render") {
      updateWorkspaceStatus(activeTab.id, (prev) => ({
        ...prev,
        resultView: "source",
      }));
    }
  }, [activeTab, canRenderHtml, resultView, updateWorkspaceStatus]);

  const truncateText = useCallback((text, limit) => {
    if (!text) {
      return "";
    }
    return text.length > limit ? `${text.slice(0, limit)}…` : text;
  }, []);

  const cancelTraceTooltipHide = useCallback(() => {
    if (traceHoverTimeoutRef.current) {
      clearTimeout(traceHoverTimeoutRef.current);
      traceHoverTimeoutRef.current = null;
    }
  }, []);

  const showTraceTooltip = useCallback((event, text) => {
    cancelTraceTooltipHide();
    const target = event.currentTarget;
    if (!target) {
      return;
    }
    const rect = target.getBoundingClientRect();
    const padding = 16;
    const pointerX = event.clientX;
    const pointerY = event.clientY;
    const desiredWidth = Math.max(rect.width, 280);
    const maxWidth = Math.min(desiredWidth, window.innerWidth - padding * 2);
    const left = Math.min(
      Math.max(pointerX + 12, padding),
      window.innerWidth - maxWidth - padding
    );
    const top = Math.min(pointerY + 16, window.innerHeight - padding - 40);
    setTraceHover({
      text: text || EMPTY_SYMBOL,
      x: left,
      y: top,
      width: maxWidth
    });
  }, [cancelTraceTooltipHide]);

  const hideTraceTooltip = useCallback(() => {
    cancelTraceTooltipHide();
    traceHoverTimeoutRef.current = window.setTimeout(() => {
      setTraceHover(null);
      traceHoverTimeoutRef.current = null;
    }, 120);
  }, [cancelTraceTooltipHide]);

  const copyTraceHover = useCallback(() => {
    if (!traceHover?.text) {
      return;
    }
    try {
      navigator.clipboard?.writeText(traceHover.text);
    } catch (err) {
      console.error("Clipboard copy failed", err);
    }
  }, [traceHover]);

  const copyErrors = useCallback(() => {
    const allLines = (errorLines && errorLines.length ? errorLines : error ? [error] : []);
    const payload = allLines.join("\n").trim();
    if (!payload) return;
    try {
      navigator.clipboard?.writeText(payload);
    } catch (err) {
      console.error("Copy errors failed", err);
    }
  }, [errorLines, error]);

  const registerTraceNameRef = useCallback(
    (index) => (node) => {
      traceNameRefs.current[index] = node;
    },
    []
  );

  const autoSizeTraceNameColumn = useCallback(() => {
    const container = traceTableWrapRef.current;
    if (!container) {
      return;
    }
    const maxAllowed = Math.max(TRACE_NAME_MIN_WIDTH, container.clientWidth - 160);
    let maxWidth = TRACE_NAME_MIN_WIDTH;
    traceNameRefs.current.forEach((el) => {
      if (el) {
        maxWidth = Math.max(maxWidth, el.scrollWidth + TRACE_NAME_PADDING);
      }
    });
    setTraceNameWidth(Math.min(Math.max(maxWidth, TRACE_NAME_MIN_WIDTH), maxAllowed));
  }, []);

  const handleTraceDividerMouseDown = useCallback((event) => {
    if (event.detail === 2) {
      event.preventDefault();
      autoSizeTraceNameColumn();
      return;
    }
    if (event.button !== 0) {
      return;
    }
    event.preventDefault();
    const startX = event.clientX;
    const startWidth = traceNameWidth;
    const container = traceTableWrapRef.current;
    const maxAllowed = container ? Math.max(TRACE_NAME_MIN_WIDTH, container.clientWidth - 160) : startWidth + 400;

    const onMove = (moveEvent) => {
      const delta = moveEvent.clientX - startX;
      const newWidth = Math.min(Math.max(startWidth + delta, TRACE_NAME_MIN_WIDTH), maxAllowed);
      setTraceNameWidth(newWidth);
    };
    const onUp = () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }, [autoSizeTraceNameColumn, traceNameWidth]);

  const handleCopyAllTrace = useCallback(() => {
    const chunks = traceEntries.map((entry) => {
      const name = (entry?.name ?? "").toString();
      const value = (entry?.value ?? "").toString();
      return `${name}\n${value}`.trim();
    }).filter(Boolean);
    let combined = chunks.join("\n\n");
    if (showRawTrace && traceText) {
      combined = combined
        ? `${combined}\n\n--- Raw Trace ---\n${traceText}`
        : traceText;
    }
    if (!combined && traceText) {
      combined = traceText;
    }
    if (!combined) {
      return;
    }
    try {
      navigator.clipboard?.writeText(combined);
    } catch (err) {
      console.error("Copy all trace failed", err);
    }
  }, [traceEntries, traceText, showRawTrace]);

  const syncParams = useCallback(() => {
    const names = extractParamNames(injectParamBlock(activeTab.xslt, activeTab.params));
    setTabs((tabs) =>
      tabs.map((t) => {
        if (t.id !== active) return t;
        // Keep the primary Input XML (index 0) untouched; only sync named parameters.
        const primary = t.params[0] || { name: "input", value: "", open: true };
        let named = t.params.slice(1);
        let changed = t.params.length === 0;
        names.forEach((n) => {
          // The primary Input XML is already injected under its own name; never
          // re-add it as a named parameter or it gets declared twice.
          if (n === primary.name) return;
          if (!named.some((p) => p.name === n)) {
            named.push({ name: n, value: "", open: true });
            changed = true;
          }
        });
        // Drop any named param that collides with the primary (self-heals state
        // persisted by an earlier buggy build) or is no longer referenced.
        const filtered = named.filter(
          (p) => p.name !== primary.name && (names.includes(p.name) || p.value),
        );
        if (filtered.length !== named.length) {
          named = filtered;
          changed = true;
        }
        return changed ? { ...t, params: [primary, ...named] } : t;
      }),
    );
  }, [active, activeTab.xslt]);

  const handleAddWorkspace = useCallback(() => {
    setTabs((current) => {
      if (current.length >= MAX_WORKSPACES) {
        window.alert(`You can only open up to ${MAX_WORKSPACES} workspaces.`);
        return current;
      }
      const nextTab = defaultTab();
      setWorkspaceStatus((prev) => ({
        ...prev,
        [nextTab.id]: defaultWorkspaceStatus(),
      }));
      setActive(nextTab.id);
      return [...current, nextTab];
    });
  }, [setActive, setWorkspaceStatus]);

  const handlePickTemplate = useCallback(
    (template) => {
      setTemplatesOpen(false);
      window.gtag?.("event", "template_opened", {
        event_category: "engagement",
        template_id: template.id,
      });
      setTabs((current) => {
        const nextTab = defaultTab(templateToWorkspace(template));
        setWorkspaceStatus((prev) => ({
          ...prev,
          [nextTab.id]: defaultWorkspaceStatus(),
        }));
        setActive(nextTab.id);
        // At the workspace cap, replace the active one rather than refusing:
        // picking a template is an explicit request to work on something else.
        if (current.length >= MAX_WORKSPACES) {
          return current.map((t) => (t.id === active ? nextTab : t));
        }
        return [...current, nextTab];
      });
    },
    [active, setActive, setWorkspaceStatus],
  );

  // A compact ?c= link carries a gzipped workspace, which can only be read
  // asynchronously — so unlike the legacy ?xslt= form it is applied after mount.
  useEffect(() => {
    let cancelled = false;
    let encoded = null;
    try {
      encoded = new URLSearchParams(window.location.search).get("c");
    } catch {}
    if (!encoded) return undefined;
    decodeCompact(encoded).then((payload) => {
      const overrides = fromSharePayload(payload);
      if (cancelled || !overrides) return;
      const tab = defaultTab({ name: "Shared transform", ...overrides });
      setWorkspaceStatus((prev) => ({ ...prev, [tab.id]: defaultWorkspaceStatus() }));
      setTabs([tab]);
      setActive(tab.id);
    });
    return () => {
      cancelled = true;
    };
  }, [setActive, setWorkspaceStatus]);

  const handleRemoveWorkspace = useCallback(
    (id) => {
      setTabs((current) => {
        if (current.length <= 1) {
          return current;
        }
        const filtered = current.filter((t) => t.id !== id);
        if (!filtered.length) {
          return current;
        }
        const nextActiveId = id === active ? filtered[0].id : active;
        setActive(nextActiveId);
        setWorkspaceStatus((prev) => {
          const next = { ...prev };
          delete next[id];
          if (nextActiveId && !next[nextActiveId]) {
            next[nextActiveId] = defaultWorkspaceStatus();
          }
          return next;
        });
        return filtered;
      });
    },
    [active, setActive, setWorkspaceStatus],
  );

  const handleClearWorkspace = useCallback(
    (tabData) => {
      const targetId = typeof tabData === "object" ? tabData?.id : tabData;
      if (!targetId) return;
      if (
        !window.confirm(
          "¿Limpiar este workspace? Se perderán los cambios no guardados.",
        )
      ) {
        return;
      }
      setTabs((current) =>
        current.map((t) => {
          if (t.id !== targetId) return t;
          const cleared = {
            ...defaultTab({ id: t.id, name: t.name }),
            params: [{ name: "input", value: "", open: true }],
          };
          return cleared;
        }),
      );
      setWorkspaceStatus((prev) => ({
        ...prev,
        [targetId]: defaultWorkspaceStatus(),
      }));
    },
    [setTabs, setWorkspaceStatus],
  );

  const runTransform = debounce(async (xsltText, ver, p, tabId) => {
    updateWorkspaceStatus(tabId, (prev) => ({ ...prev, isRunning: true }));
    const paramObj = {};
    p.forEach((pr) => {
      if (pr.name) paramObj[pr.name] = pr.value;
    });
    const clientStart = performance.now();
    try {
      const res = await fetch(`${backendBase}/transform`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          xslt: xsltText,
          version: ver,
          parameters: paramObj,
          trace: traceEnabled,
        }),
      });
      if (!res.ok) {
        let txt = "";
        try {
          // Prefer JSON to decode escaped newlines (\n)
          const j = await res.json();
          if (j && typeof j.error === "string") {
            txt = j.error;
          } else {
            txt = JSON.stringify(j);
          }
        } catch {
          // Fallback to raw text
          txt = await res.text();
        }
        const lines = parseErrorLines(txt || res.statusText || "");
        updateWorkspaceStatus(tabId, {
          error: txt || res.statusText,
          errorLines: lines,
          isServerError: res.status >= 500,
          duration: null,
          result: "",
          traceEntries: [],
          traceText: "",
          showRawTrace: false,
          resultView: "source",
          isRunning: false,
          secondaryResults: {},
        });
        if (res.status >= 500) setServerErrorCount((count) => count + 1);
        return;
      }
      const data = await res.json();
      // Round-trip the user actually experiences (network + server), so the
      // displayed time isn't just the server-side Saxon compute (data.duration_ms).
      const roundTripMs = Math.round(performance.now() - clientStart);
      const defaultView = looksLikeHtml(data.result) ? "render" : "source";
      setTransformCount((prev) => prev + 1);
      if (userInteracted) setUserHasTransformed(true);
      maybeRefreshAd();
      setResultBeforeFormat(null);
      setXsltBeforeFormat(null);
      updateWorkspaceStatus(tabId, {
        result: data.result,
        duration: roundTripMs,
        serverMs: data.duration_ms,
        error: "",
        isRunning: false,
        errorLines: [],
        isServerError: false,
        showRawTrace: false,
        resultView: defaultView,
        secondaryResults: data.secondary_results || {},
      });
      const newEntries = traceEnabled ? (data.trace || []) : [];
      updateWorkspaceStatus(tabId, (prev) => ({
        ...prev,
        traceEntries: newEntries,
        traceText: traceEnabled ? (data.trace_text || "") : "",
      }));
      requestAnimationFrame(() => {
        clampTraceNameWidth();
      });
    } catch (e) {
      const txt = String(e);
      updateWorkspaceStatus(tabId, {
        error: txt,
        errorLines: parseErrorLines(txt),
        isServerError: true,
        result: "",
        duration: null,
        traceEntries: [],
        traceText: "",
        showRawTrace: false,
        resultView: "source",
        isRunning: false,
        secondaryResults: {},
      });
      setServerErrorCount((count) => count + 1);
    }
  }, 2000);

  useEffect(() => {
    if (!activeTab || !autoRunReady) return;
    runTransform(
      injectParamBlock(activeTab.xslt, activeTab.params),
      activeTab.version,
      activeTab.params,
      activeTab.id,
    );
  }, [activeTab, traceEnabled, autoRunReady]);

  useEffect(() => {
    syncParams();
  }, [active, syncParams]);



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
    setNamedParamsOpen(true);
    setTabs((tabs) =>
      tabs.map((t) =>
        t.id === active
          ? { ...t, params: [...t.params, { name: `param${t.params.length}`, value: "", open: true }] }
          : t,
      ),
    );
  };

  const removeParam = (index) => {
    if (index === 0) return; // index 0 is the primary Input XML; never removed
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

  const handleResultResizeStart = (event) => {
    event.preventDefault();
    resultResizeState.current = {
      startY: event.clientY,
      startHeight: resolvedResultHeight,
    };
    setIsResizingResult(true);
  };

  const handleParamResizeStart = (event) => {
    if (paramsCollapsed) return;
    event.preventDefault();
    paramResizeState.current = {
      startX: event.clientX,
      startWidth: paramWidth || DEFAULT_PARAM_WIDTH,
    };
    setIsResizingParams(true);
  };

  const handleResetResultHeight = () => {
    setResultHeight(null);
  };

  const handleRenameWorkspace = useCallback((id, name) => {
    setTabs((current) =>
      current.map((tab) =>
        tab.id === id
          ? { ...tab, name: typeof name === "string" ? name.trim() : "" }
          : tab,
      ),
    );
  }, []);

  const download = useCallback((data, filename, mimeType = "text/xml") => {
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  const handleExportWorkspace = useCallback(
    (targetTab) => {
      const tab = targetTab || activeTab;
      if (!tab) return;
      const statusSnapshot =
        workspaceStatus[tab.id] || defaultWorkspaceStatus();
      const payload = {
        schemaVersion: WORKSPACE_EXPORT_VERSION,
        exportedAt: new Date().toISOString(),
        workspace: {
          params: tab.params,
          xslt: tab.xslt,
          version: tab.version,
          expected: tab.expected || "",
        },
        status: statusSnapshot,
      };
      download(
        JSON.stringify(payload, null, 2),
        `workspace-${tab.id}.json`,
        "application/json",
      );
    },
    [activeTab, download, workspaceStatus],
  );

  const handleWorkspaceImport = useCallback(
    (event) => {
      const input = event.target;
      const file = input?.files?.[0];
      if (!file) {
        if (input) input.value = "";
        return;
      }
      if (tabsRef.current.length >= MAX_WORKSPACES) {
        window.alert(
          `You can only keep up to ${MAX_WORKSPACES} workspaces simultaneously.`,
        );
        if (input) input.value = "";
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result || "{}");
          const normalized = normalizeWorkspaceImport(parsed);
          setTabs((current) => {
            if (current.length >= MAX_WORKSPACES) {
              window.alert(
                `You can only keep up to ${MAX_WORKSPACES} workspaces simultaneously.`,
              );
              return current;
            }
            const nextTab = defaultTab({
              params: normalized.workspace.params,
              xslt: normalized.workspace.xslt,
              version: normalized.workspace.version,
            });
            setWorkspaceStatus((prev) => ({
              ...prev,
              [nextTab.id]: normalized.status,
            }));
            setActive(nextTab.id);
            return [...current, nextTab];
          });
        } catch (err) {
          console.error(err);
          window.alert(
            typeof err?.message === "string"
              ? err.message
              : "Failed to import workspace file.",
          );
        } finally {
          if (input) input.value = "";
        }
      };
      reader.onerror = () => {
        window.alert("Unable to read the workspace file.");
        if (input) input.value = "";
      };
      reader.readAsText(file);
    },
    [setTabs, setActive, setWorkspaceStatus],
  );

  useEffect(() => {
    if (!adsenseClient || !adsenseSlot) return;
    const cancelIdle = runWhenIdle(() => {
      if (!window.adsbygoogle) return;
      try {
        window.adsbygoogle.push({});
      } catch {}
    }, 2000);
    return () => cancelIdle?.();
  }, []);

  useEffect(() => {
    if (!ethicalAdsEnabled) {
      setEthicalAdsReady(false);
      return;
    }
    if (window.ethicalads) {
      setEthicalAdsReady(true);
      return;
    }
    let cancelled = false;
    let script = null;
    let fallback = null;
    let onLoad = null;
    let onError = null;
    const loadEthicalAds = () => {
      if (cancelled) return;
      const existing = document.querySelector("script[data-ethicalads]");
      script = existing || document.createElement("script");
      if (!existing) {
        script.src = "https://media.ethicalads.io/media/client/ethicalads.min.js";
        script.async = true;
        script.dataset.ethicalads = "true";
        document.body.appendChild(script);
      }
      onLoad = () => setEthicalAdsReady(Boolean(window.ethicalads));
      onError = () => setEthicalAdsReady(false);
      script.addEventListener("load", onLoad);
      script.addEventListener("error", onError);
      fallback = window.setTimeout(() => {
        if (!window.ethicalads) setEthicalAdsReady(false);
      }, 3500);
    };
    const cancelIdle = runWhenIdle(loadEthicalAds, 2000);
    return () => {
      cancelled = true;
      cancelIdle?.();
      if (script && onLoad) script.removeEventListener("load", onLoad);
      if (script && onError) script.removeEventListener("error", onError);
      if (fallback) window.clearTimeout(fallback);
    };
  }, [ethicalAdsEnabled]);

  useEffect(() => {
    if (!ethicalAdsEnabled || !ethicalAdsReady || !ethicalSlotRef.current) return;
    const doLoad = () => {
      try {
        if (ethicalSlotRef.current) {
          ethicalSlotRef.current.innerHTML = "";
          window.ethicalads?.load(ethicalSlotRef.current);
        }
      } catch {}
    };
    doLoad();
    // Retry if slot still empty after 1.5s (race: ethicalads init vs load event)
    const t = window.setTimeout(() => {
      if (ethicalSlotRef.current && !ethicalSlotRef.current.children.length) {
        doLoad();
      }
    }, 1500);
    return () => window.clearTimeout(t);
  }, [ethicalAdsEnabled, ethicalAdsReady, ethicalAdVariant]);


  return (
    <div className={`app-container${IS_EMBED ? " app-container--embed" : ""}`}>
      <h1 className="sr-only">XSLT Playground - Online XSLT Editor and Tester</h1>
      {ethicalAdsEnabled && (
        <div
          ref={ethicalSlotRef}
          id="xsltplayground-main"
          className="ea-header-slot"
          data-ea-publisher={ethicalAdsPublisher}
          data-ea-type="text"
          data-ea-style="fixedheader"
          aria-label="Advertisement"
        />
      )}
      {IS_EMBED && (
        <div className="embed-bar">
          <span>XSLT Playground</span>
          <a
            href={typeof window !== "undefined" ? buildShareUrl(activeTab) : "https://xsltplayground.com/"}
            target="_blank"
            rel="noopener noreferrer"
          >
            Open in the full editor →
          </a>
        </div>
      )}
      {!IS_EMBED && (
      <div className="tabs">
        <TabsNav
          tabs={tabs}
          activeId={active}
          onSelect={setActive}
          onClose={handleRemoveWorkspace}
          onExport={handleExportWorkspace}
          onClear={handleClearWorkspace}
          onRename={handleRenameWorkspace}
        />
        <div className="tabs-right">
          <button
            type="button"
            className="icon-button tab-add"
            onClick={handleAddWorkspace}
            disabled={tabs.length >= MAX_WORKSPACES}
            aria-label="Add workspace"
            title={
              tabs.length >= MAX_WORKSPACES
                ? "Maximum number of workspaces reached"
                : "Add workspace"
            }
          >
            <Icon name="plus" />
          </button>
          <button
            type="button"
            className="tab-templates"
            onClick={() => setTemplatesOpen(true)}
            title="Start from a template"
          >
            Templates
          </button>
          <button
            type="button"
            className="icon-button tab-import"
            onClick={() => workspaceImportRef.current?.click()}
            title="Import workspace"
            aria-label="Import workspace"
          >
            <Icon name="import" />
          </button>
          <input
            ref={workspaceImportRef}
            type="file"
            accept="application/json,.json"
            className="file-input"
            onChange={handleWorkspaceImport}
            aria-label="Import workspace file"
          />
        </div>
      </div>
      )}
      <div className="main">
        {paramsCollapsed ? (
          <div className="params-collapsed">
            <button
              type="button"
              className="icon-button"
              title="Show data pipeline"
              aria-label="Show data pipeline"
              onClick={() => setParamsCollapsed(false)}
            >
              <Icon name="chevron-right" />
            </button>
          </div>
        ) : (
          <>
            <div
              className="params"
              style={{
                width: `${paramWidth}px`,
                flexBasis: `${paramWidth}px`,
              }}
            >
              <DataPipelineHeader
                collapsed={paramsCollapsed}
                onToggleCollapsed={() => setParamsCollapsed((v) => !v)}
              />
              <div
                className="params-body"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropNewParam}
              >
                {primaryInput && (
                  <div className="primary-input">
                    {/* Acts as a label for the editor below: clicking focuses it
                        so the click isn't dead. */}
                    <div
                      className="primary-input-label primary-input-label-clickable"
                      onClick={(e) => {
                        const cm = e.currentTarget.parentElement?.querySelector(
                          ".primary-editor .cm-content",
                        );
                        cm?.focus();
                      }}
                    >
                      Input XML
                    </div>
                    <div
                      className="param-editor primary-editor"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        e.stopPropagation();
                        handleDrop(e, (t) => updateParam(0, "value", t));
                      }}
                    >
                      <Editor
                        height="220px"
                        language="xml"
                        theme={editorTheme}
                        value={primaryInput.value}
                        onChange={(v) => updateParam(0, "value", v || "")}
                        options={{
                          minimap: { enabled: false },
                          automaticLayout: true,
                          lineNumbers: "off",
                        }}
                      />
                    </div>
                  </div>
                )}
                <div className="named-params">
                  <button
                    type="button"
                    className="named-params-toggle"
                    onClick={() => setNamedParamsOpen((o) => !o)}
                    aria-expanded={namedParamsOpen}
                  >
                    <Icon name={namedParamsOpen ? "chevron-down" : "chevron-right"} />
                    <span>
                      Named parameters{namedParamCount ? ` (${namedParamCount})` : ""}
                    </span>
                  </button>
                  {namedParamsOpen && (
                    <div className="named-params-body">
                {activeTab.params.slice(1).map((p, j) => {
                  const i = j + 1;
                  return (
                  <div key={i} className={`param-card${p.open ? " open" : ""}`}>
                    <div className="param-header-row">
                      <div className="param-name-wrap">
                        <button
                          type="button"
                          className={`icon-button param-toggle${p.open ? " open" : ""}`}
                          aria-label={p.open ? "Collapse parameter details" : "Expand parameter details"}
                          onClick={() => updateParam(i, "open", !p.open)}
                        >
                          <Icon name={p.open ? "chevron-down" : "chevron-right"} />
                        </button>
                        <input
                          className="param-name-input"
                          placeholder="Parameter name"
                          value={p.name}
                          onChange={(e) => updateParam(i, "name", e.target.value)}
                          aria-label="Parameter name"
                        />
                      </div>
                      <button
                        type="button"
                        className="icon-button param-remove"
                        aria-label="Remove parameter"
                        onClick={() => removeParam(i)}
                      >
                        <Icon name="close" />
                      </button>
                    </div>
                    {p.open && (
                      <div
                        className="param-content"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => {
                          e.stopPropagation();
                          handleDrop(e, (t) => updateParam(i, "value", t));
                        }}
                      >
                        <div className="param-editor">
                          <Editor
                            height="150px"
                            language="xml"
                            theme={editorTheme}
                            value={p.value}
                            onChange={(v) => updateParam(i, "value", v || "")}
                            options={{
                              minimap: { enabled: false },
                              automaticLayout: true,
                              lineNumbers: "off",
                            }}
                          />
                        </div>
                        <div className="param-footer">
                          <label
                            className="icon-button file-label param-upload"
                            aria-label="Upload parameter value"
                            title="Upload parameter value"
                          >
                            <Icon name="upload" />
                            <input
                              type="file"
                              accept=".xml"
                              className="file-input"
                              onChange={(e) => loadFile(e, (t) => updateParam(i, "value", t))}
                              aria-label="Upload parameter value file"
                            />
                          </label>
                          <button
                            type="button"
                            className="icon-button param-download"
                            aria-label="Download parameter value"
                            onClick={() => download(p.value, `${p.name || "param"}.xml`)}
                          >
                            <Icon name="download" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  );
                })}
                      <button
                        type="button"
                        className="add-named-param"
                        onClick={addParam}
                      >
                        <Icon name="plus" />
                        <span>Add named parameter</span>
                      </button>
                      <label className="drop-hint" title="Click to upload XML files">
                        Drop XML files as named parameters..
                        <input
                          type="file"
                          accept=".xml"
                          multiple
                          style={{ display: "none" }}
                          onChange={(e) => {
                            setNamedParamsOpen(true);
                            Array.from(e.target.files || []).forEach((file) => {
                              const reader = new FileReader();
                              reader.onload = () => {
                                const name = file.name.replace(/\.[^.]+$/, "");
                                setTabs((tabs) =>
                                  tabs.map((t) =>
                                    t.id === active
                                      ? { ...t, params: [...t.params, { name, value: reader.result, open: true }] }
                                      : t,
                                  ),
                                );
                              };
                              reader.readAsText(file);
                            });
                            e.target.value = "";
                          }}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {ethicalAdsEnabled && ethicalAdsReady && (
              <div className="params-ad">
                <div
                  id="xsltplayground-params"
                  className="ethical-ad"
                  data-ea-publisher={ethicalAdsPublisher}
                  data-ea-type="image"
                  data-ea-style="stickybox"
                />
              </div>
            )}
            <div
              className={`pane-divider${isResizingParams ? " dragging" : ""}`}
              onMouseDown={handleParamResizeStart}
              role="separator"
              aria-label="Resize data pipeline width"
              aria-orientation="vertical"
            >
              <span />
            </div>
          </>
        )}
        <div className="editor">
          <div className="toggle">
            <select
              className="version-select"
              value={activeTab.version}
              onChange={(e) =>
                setTabs((tabs) =>
                  tabs.map((t) =>
                    t.id === active
                      ? {
                          ...t,
                          version: e.target.value,
                          xslt: setStylesheetVersion(t.xslt, e.target.value),
                        }
                      : t,
                  ),
                )
              }
              aria-label="XSLT version"
            >
              <option value="1.0">XSLT 1.0</option>
              <option value="2.0">XSLT 2.0</option>
              <option value="3.0">XSLT 3.0</option>
            </select>
            <label className="trace-toggle">
              <input
                type="checkbox"
                checked={traceEnabled}
                onChange={(e) => setTraceEnabled(e.target.checked)}
              />
              <span className="trace-toggle-box" aria-hidden="true" />
              <span className="trace-toggle-label">Enable Internal Variables</span>
            </label>
            <button
              className="icon-button"
              aria-label="Format XSLT"
              title="Format XSLT (2-space indent)"
              onClick={async () => {
                try {
                  const { default: formatXML } = await import("xml-formatter");
                  const formatted = formatXML(
                    injectParamBlock(activeTab.xslt, activeTab.params),
                    { indentation: "  ", collapseContent: true },
                  );
                  const stripped = stripParamBlock(formatted);
                  setXsltBeforeFormat(activeTab.xslt);
                  setTabs((tabs) =>
                    tabs.map((tab) =>
                      tab.id === active ? { ...tab, xslt: stripped } : tab,
                    ),
                  );
                } catch {}
              }}
            >
              <Icon name="sparkles" />
            </button>
            {xsltBeforeFormat !== null && (
              <button
                className="icon-button"
                aria-label="Undo format XSLT"
                title="Undo format"
                onClick={() => {
                  setTabs((tabs) =>
                    tabs.map((tab) =>
                      tab.id === active ? { ...tab, xslt: xsltBeforeFormat } : tab,
                    ),
                  );
                  setXsltBeforeFormat(null);
                }}
              >
                <Icon name="undo" />
              </button>
            )}
            <button
              className="icon-button"
              aria-label="Copy share link"
              title="Copy shareable link"
              onClick={async () => {
                const url = await buildShareUrlCompact(activeTab);
                await navigator.clipboard.writeText(url);
                setShareCopied(true);
                setTimeout(() => setShareCopied(false), 2000);
              }}
            >
              <Icon name={shareCopied ? "check" : "share"} />
            </button>
            <div className="right-actions">
              <label
                className="icon-button file-label"
                aria-label="Upload stylesheet"
                title="Upload stylesheet"
              >
                <Icon name="upload" />
                <input
                  type="file"
                  accept=".xsl,.xslt"
                  className="file-input"
                  aria-label="Upload stylesheet file"
                  onChange={(e) =>
                    loadFile(e, (t) =>
                      setTabs((tabs) =>
                        tabs.map((tab) =>
                          tab.id === active
                            ? { ...tab, xslt: stripParamBlock(t), params: addParams(t,tab) }
                            : tab,
                        ),
                      )
                    )
                  }
                />
              </label>
              <button
                className="icon-button"
                aria-label="Download stylesheet"
                title="Download stylesheet"
                onClick={() =>
                  download(
                    injectParamBlock(activeTab.xslt, activeTab.params),
                    "transform.xsl",
                  )
                }
              >
                <Icon name="download" />
              </button>
            </div>
          </div>
          <div className="editor-split">
            <div className="xslt-editor-wrap">
              <Editor
                eager
                height="100%"
                language="xml"
                theme={editorTheme}
                wrapperProps={{
                  onDragOver: (e) => e.preventDefault(),
                  onDrop: (e) =>
                    handleDrop(e, (t) =>
                      setTabs((tabs) =>
                        tabs.map((tab) =>
                          tab.id === active ? { ...tab, xslt: stripParamBlock(t), params: addParams(t,tab) } : tab,
                        ),
                      ),
                    ),
                }}
                value={injectParamBlock(activeTab.xslt, activeTab.params)}
                onChange={(v) =>
                  setTabs((tabs) =>
                    tabs.map((tab) =>
                      tab.id === active ? { ...tab, xslt: stripParamBlock(v || ""), params: addParams(v,tab) } : tab,
                    ),
                  )
                }
                onBlur={syncParams}
                options={{ minimap: { enabled: false }, automaticLayout: true }}
                xsltVersion={activeTab.version}
              />
            </div>
            {traceEnabled && (
              <div className="trace-panel" style={{ width: traceCollapsed ? '2rem' : '30%' }}>
                <div className="trace-header" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="icon-button"
                    title={traceCollapsed ? 'Show trace' : 'Hide trace'}
                    onClick={() => setTraceCollapsed(v => !v)}
                    aria-label={traceCollapsed ? 'Show trace panel' : 'Hide trace panel'}
                  >
                    <Icon name={traceCollapsed ? "chevron-right" : "chevron-down"} />
                  </button>
                  {!traceCollapsed && (
                    <>
                      <span style={{ fontWeight: 'bold' }}>
                        Trace Variables {traceEntries.length ? `(${traceEntries.length})` : ''}
                      </span>
                      <div className="trace-header-actions">
                        <button
                          className="icon-button"
                          title="Copy all trace variables"
                          onClick={handleCopyAllTrace}
                          type="button"
                          disabled={!traceEntries.length && !traceText}
                          aria-label="Copy all trace variables"
                        >
                          <Icon name="copy" />
                        </button>
                        {traceText && (
                          <button
                            className="icon-button"
                            title={showRawTrace ? "Hide raw trace output" : "Show raw trace output"}
                            onClick={() => {
                              if (activeTab) {
                                updateWorkspaceStatus(activeTab.id, (prev) => ({
                                  ...prev,
                                  showRawTrace: !prev.showRawTrace,
                                }));
                              }
                            }}
                            type="button"
                            aria-label={showRawTrace ? "Hide raw trace output" : "Show raw trace output"}
                          >
                            <Icon name={showRawTrace ? "terminal-off" : "terminal"} />
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
                {!traceCollapsed && (
                  <div className="trace-content">
                    {traceEntries.length > 0 && (
                      <div
                        className="trace-table-wrap"
                        ref={traceTableWrapRef}
                        onScroll={(e) => setTraceScrollLeft(e.currentTarget.scrollLeft)}
                      >
                        <table className="trace-table">
                          <colgroup>
                            <col style={{ width: `${traceNameWidth}px` }} />
                            <col />
                          </colgroup>
                          <tbody>
                            {traceEntries.map((t, i) => {
                              const rawName = (t?.name ?? "").toString();
                              const rawValue = (t?.value ?? "").toString();
                              const namePreview = truncateText(rawName, TRACE_NAME_LIMIT);
                              const valuePreview = truncateText(rawValue, TRACE_VALUE_LIMIT);
                              return (
                                <tr key={`${rawName}-${i}`}>
                                  <td className="trace-name">
                                    <div
                                      className="trace-cell"
                                      onMouseEnter={(e) => showTraceTooltip(e, rawName)}
                                      onMouseLeave={hideTraceTooltip}
                                    >
                                      <pre
                                        className="trace-preview trace-name-preview"
                                        ref={registerTraceNameRef(i)}
                                      >
                                        {namePreview || EMPTY_SYMBOL}
                                      </pre>
                                    </div>
                                  </td>
                                  <td className="trace-value">
                                    <div
                                      className="trace-cell"
                                      onMouseEnter={(e) => showTraceTooltip(e, rawValue)}
                                      onMouseLeave={hideTraceTooltip}
                                    >
                                      <pre className="trace-preview trace-value-preview">{valuePreview || EMPTY_SYMBOL}</pre>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        <div
                          className="trace-divider"
                          style={{ left: `${traceNameWidth - 3 - traceScrollLeft}px` }}
                          onMouseDown={handleTraceDividerMouseDown}
                          role="separator"
                          aria-orientation="vertical"
                        />
                      </div>
                    )}
                    {showRawTrace && traceText && (
                      <pre className="trace-raw-block">{traceText}</pre>
                    )}
                    {!traceEntries.length && !traceText && (
                      <div className="trace-empty">Trace output is empty.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      <div
        className={`result-resizer${isResizingResult ? " dragging" : ""}`}
        onMouseDown={handleResultResizeStart}
        role="separator"
        aria-label="Resize result pane"
        aria-orientation="horizontal"
      >
        <span />
      </div>
      <div
        className="result"
        style={{
          height: `${resolvedResultHeight}px`,
          minHeight: `${MIN_RESULT_HEIGHT}px`,
        }}
      >
        {error && !errorCollapsed && (
          <div className="error-box" role="alert" aria-live="assertive">
            <div className="error-box-header">
              <span>Errors</span>
              <div className="error-box-actions">
                {userHasTransformed && (
                  <button
                    type="button"
                    className={`share-transform-btn error-share${shareCopied ? " copied" : ""}`}
                    title="Copy a shareable link to this transformation"
                    onClick={async () => {
                      const url = await buildShareUrlCompact(activeTab);
                      const text = `Check out my XSLT transformation! ✨\n${url}`;
                      navigator.clipboard.writeText(text).then(() => {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2500);
                        window.gtag?.("event", "share_transform", {
                          event_category: "engagement",
                          xslt_version: activeTab?.version,
                        });
                      });
                    }}
                  >
                    {shareCopied ? "✓ Copied!" : "🔗 Copy link"}
                  </button>
                )}
                <button
                  type="button"
                  className="icon-button"
                  onClick={copyErrors}
                  disabled={!canCopyErrors}
                  title="Copy all errors"
                  aria-label="Copy errors"
                >
                  <Icon name="copy" />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setErrorCollapsed(true)}
                  title="Hide errors"
                  aria-label="Hide errors"
                >
                  <Icon name="chevron-up" />
                </button>
              </div>
            </div>
            {limitedErrorLines.length > 0 ? (
              <table className="error-table">
                <tbody>
                  {limitedErrorLines.map((l, i) => (
                    <tr key={i} className="error-row">
                      <td className="error-icon" aria-hidden>
                        <Icon name="alert" />
                      </td>
                      <td className="error-text" title={l}>
                        {l}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="error-line">
                <span className="error-icon" aria-hidden>
                  <Icon name="alert" />
                </span>
                <span className="error-text" title={error || ""}>
                  {error}
                </span>
              </div>
            )}
            {hasHiddenErrors && (
              <div className="error-more">
                +{(errorLines || []).length - MAX_ERROR_LINES} more…
              </div>
            )}
            {(() => {
              const ref = findErrorReference(error);
              if (!ref) return null;
              return (
                <p className="error-doc-hint">
                  📖 <a href={ref.url} target="_blank" rel="noopener noreferrer">
                    {ref.code
                      ? `What ${ref.code} means and how to fix it`
                      : "What this error means and how to fix it"}
                  </a>
                </p>
              );
            })()}
            {/FODC0002|I\/O error|unable to open|Failed to read|UnmarshalException.*URI/i.test(error) && (
              <p className="error-doc-hint">
                💡 <code>doc()</code> only supports HTTP/HTTPS URLs in this playground — local file paths are not available.
                Host your XML file online and use <code>doc("https://…")</code>.
              </p>
            )}
            {(() => {
              const vh = detectVersionUpgradeHint(error, activeTab?.version);
              if (!vh) return null;
              const label = vh.func.includes("/") ? vh.func : `${vh.func}()`;
              return (
                <p className="error-doc-hint">
                  💡 <code>{label}</code> is an XSLT {vh.version} feature — it isn't
                  available in XSLT {activeTab.version}.{" "}
                  <button
                    type="button"
                    className="error-hint-switch"
                    onClick={() => {
                      setTabs((tabs) =>
                        tabs.map((t) =>
                          t.id === active
                            ? {
                                ...t,
                                version: vh.version,
                                xslt: setStylesheetVersion(t.xslt, vh.version),
                              }
                            : t,
                        ),
                      );
                      window.gtag?.("event", "version_upgrade_hint", {
                        event_category: "engagement",
                        from_version: activeTab?.version,
                        to_version: vh.version,
                      });
                    }}
                  >
                    Switch to XSLT {vh.version}
                  </button>
                </p>
              );
            })()}
            {isServerError && (
              <a
                className="error-report-link"
                href={buildBugReportUrl(activeTab?.version, error, activeTab?.xslt)}
                target="_blank"
                rel="noopener noreferrer"
              >
                Report this bug on GitHub
              </a>
            )}
            {isServerError && serverErrorCount >= 2 && !bugFeedbackDismissed && (
              <Suspense fallback={null}>
                <FeedbackWidget
                  kind="bug"
                  reportUrl={buildBugReportUrl(activeTab?.version, error, activeTab?.xslt)}
                  context={{
                    error,
                    version: activeTab?.version,
                    repro_url: buildShareUrl(activeTab),
                  }}
                  onComplete={() => setBugFeedbackDismissed(true)}
                />
              </Suspense>
            )}
          </div>
        )}
        {error && errorCollapsed && (
          <button
            type="button"
            className="icon-button error-expand-button"
            onClick={() => setErrorCollapsed(false)}
            title="Show errors"
            aria-label="Show errors"
          >
            <Icon name="alert" />
          </button>
        )}
        {showResultPane && (
          <>
            {isRunning ? (
              <div className="running-box" role="status" aria-live="polite">
                <span className="running-dot" />
                Running…
              </div>
            ) : duration !== null ? (
              <div className="success-area">
                <div className="success-box" role="status" aria-live="polite">
                  Success in {duration} ms
                  {serverMs != null && (
                    <span className="success-server-time" title="Server-side Saxon compile + transform time (excludes network)">
                      {" "}· Saxon {serverMs} ms
                    </span>
                  )}
                </div>
                {userHasTransformed && (
                  <button
                    type="button"
                    className={`share-transform-btn${shareCopied ? " copied" : ""}`}
                    title="Copy a shareable link to this transformation"
                    onClick={async () => {
                      const url = await buildShareUrlCompact(activeTab);
                      const text = `Check out my XSLT transformation! ✨\n${url}`;
                      navigator.clipboard.writeText(text).then(() => {
                        setShareCopied(true);
                        setTimeout(() => setShareCopied(false), 2500);
                        window.gtag?.("event", "share_transform", {
                          event_category: "engagement",
                          xslt_version: activeTab?.version,
                        });
                      });
                    }}
                  >
                    {shareCopied ? "✓ Copied!" : "🔗 Copy link"}
                  </button>
                )}
              </div>
            ) : null}
            {/* Ask only after the user has got value out of the tool twice — never
                on the very first run, and never alongside a second prompt. */}
            {widgetsReady && duration !== null && userHasTransformed && transformCount >= 2 && !satisfactionDone && (
              <Suspense fallback={null}>
                <FeedbackWidget
                  kind="satisfaction"
                  context={{ version: activeTab?.version }}
                  onComplete={() => setSatisfactionDone(true)}
                />
              </Suspense>
            )}
            {compareOpen && (
              <div className="compare-panel">
                <label className="compare-label" htmlFor="expected-output">
                  Expected output
                </label>
                <textarea
                  id="expected-output"
                  className="compare-expected"
                  placeholder="Paste the output this transform should produce…"
                  value={activeTab.expected || ""}
                  onChange={(e) =>
                    setTabs((tabs) =>
                      tabs.map((t) =>
                        t.id === active ? { ...t, expected: e.target.value } : t,
                      ),
                    )
                  }
                  rows={4}
                  spellCheck={false}
                />
                {(activeTab.expected || "").trim() && result ? (
                  (() => {
                    const d = diffLines(result, activeTab.expected);
                    return (
                      <>
                        <p className={`compare-verdict ${d.equal ? "match" : "differs"}`}>
                          {d.equal
                            ? "✓ Output matches the expected result"
                            : `✗ ${d.changes} line${d.changes === 1 ? "" : "s"} differ`}
                        </p>
                        {!d.equal && (
                          <div className="compare-diff">
                            {d.rows
                              .filter((r) => r.type !== "same")
                              .slice(0, 60)
                              .map((r, i) => (
                                <div key={i} className={`diff-row diff-${r.type}`}>
                                  <span className="diff-sign">
                                    {r.type === "added" ? "+" : "−"}
                                  </span>
                                  <span className="diff-text">{r.text}</span>
                                </div>
                              ))}
                            {d.truncated && <div className="diff-more">…diff truncated</div>}
                          </div>
                        )}
                        <p className="compare-legend">
                          <span className="diff-added">+</span> in the actual output ·{" "}
                          <span className="diff-removed">−</span> expected but missing ·
                          whitespace ignored
                        </p>
                      </>
                    );
                  })()
                ) : (
                  <p className="compare-legend">
                    Run the transform and paste an expected result to compare them.
                  </p>
                )}
              </div>
            )}
            <div className="result-actions">
              <button
                type="button"
                className={`compare-toggle${compareOpen ? " active" : ""}`}
                onClick={() => setCompareOpen((v) => !v)}
                title="Compare the output against an expected result"
              >
                Compare
              </button>
              <button
                type="button"
                className={`icon-button result-copy-button${resultCopied ? " copied" : ""}`}
                disabled={!result}
                onClick={copyResult}
                title={resultCopied ? "Copied!" : "Copy result"}
                aria-label="Copy result"
              >
                <Icon name={resultCopied ? "check" : "copy"} />
              </button>
              {canRenderHtml && (
                <button
                  type="button"
                  className={`icon-button result-view-toggle${effectiveResultView === "render" ? " active" : ""}`}
                  onClick={() => {
                    if (!activeTab) return;
                    const next = effectiveResultView === "render" ? "source" : "render";
                    updateWorkspaceStatus(activeTab.id, (prev) => ({
                      ...prev,
                      resultView: next,
                    }));
                  }}
                  title={
                    effectiveResultView === "render"
                      ? "Show source instead of rendered HTML"
                      : "Render HTML output"
                  }
                  aria-label={
                    effectiveResultView === "render"
                      ? "Show source instead of rendered HTML"
                      : "Render HTML output"
                  }
                >
                  <Icon name={effectiveResultView === "render" ? "code" : "globe"} />
                </button>
              )}
              <button
                className="icon-button result-format-button"
                disabled={effectiveResultView !== "source"}
                onClick={async () => {
                  if (effectiveResultView !== "source") return;
                  try {
                    const { default: formatXML } = await import("xml-formatter");
                    const formatted = formatXML(result);
                    if (activeTab) {
                      setResultBeforeFormat(result);
                      updateWorkspaceStatus(activeTab.id, (prev) => ({
                        ...prev,
                        result: formatted,
                      }));
                    }
                  } catch {}
                }}
                title="Format result as pretty XML"
                aria-label="Format result as pretty XML"
              >
                <Icon name="sparkles" />
              </button>
              {resultBeforeFormat !== null && (
                <button
                  className="icon-button"
                  aria-label="Undo format result"
                  title="Undo format"
                  onClick={() => {
                    if (activeTab) {
                      updateWorkspaceStatus(activeTab.id, (prev) => ({
                        ...prev,
                        result: resultBeforeFormat,
                      }));
                    }
                    setResultBeforeFormat(null);
                  }}
                >
                  <Icon name="undo" />
                </button>
              )}
              <button
                type="button"
                className={`icon-button result-reset-button${isCustomResultHeight ? " active" : ""}`}
                onClick={handleResetResultHeight}
                title="Reset result pane height"
                aria-label="Reset result pane height"
              >
                <Icon name="refresh" />
              </button>
            </div>
            <div className="result-body">
              <div className={`result-editor-wrap${isRunning ? " result--loading" : ""}`}>
                {effectiveResultView === "render" && canRenderHtml ? (
                  <div className="result-render">
                    <iframe
                      title="Rendered HTML output"
                      srcDoc={result || "<!-- empty -->"}
                      sandbox=""
                      loading="lazy"
                    />
                  </div>
                ) : !isRunning && !result ? (
                  <div className="result-empty" role="status">
                    <span>Run a transform — the output appears here.</span>
                  </div>
                ) : (
                  <Editor
                    height="100%"
                    language="xml"
                    theme={editorTheme}
                    value={result}
                    onMount={(editor) => (resultEditorRef.current = editor)}
                    options={{
                      readOnly: true,
                      minimap: { enabled: false },
                      automaticLayout: true,
                      wordWrap: "bounded",
                      wordWrapBreakAfterCharacters: ' \t})]?|>'
                    }}
                  />
                )}
              </div>
              {secondaryResults && Object.keys(secondaryResults).length > 0 && (
                <div className="secondary-results">
                  <div className="secondary-results-header">
                    Secondary outputs ({Object.keys(secondaryResults).length})
                  </div>
                  {Object.entries(secondaryResults).map(([href, content]) => (
                    <SecondaryResultItem
                      key={href}
                      href={href}
                      content={content}
                      theme={editorTheme}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <div className="footer">
        <div className="footer-left">
          <a href="/" className="footer-brand" aria-label="XSLT Playground home">
            <img src={logo} alt="XSLT Playground logo" className="logo" />
            <strong>xsltplayground.com</strong>
          </a>
          <span className="footer-tagline">Free XSLT Editor &amp; Tester</span>
          <a
            className="news-link"
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Blog &amp; Tutorials
          </a>
          <span className="footer-blog-links">
            <a href="/xslt-2-0/">XSLT 2.0</a>
            {" · "}
            <a href="/xslt-3-0/">XSLT 3.0</a>
            {" · "}
            <a href="https://xsltplayground.com/blog/posts/xslt-for-beginners/" target="_blank" rel="noopener noreferrer">XSLT for Beginners</a>
            {" · "}
            <a href="https://xsltplayground.com/blog/posts/xslt-3-new-features/" target="_blank" rel="noopener noreferrer">XSLT 3.0</a>
            {" · "}
            <a href="https://xsltplayground.com/blog/posts/xslt-string-functions/" target="_blank" rel="noopener noreferrer">String Functions</a>
            {" · "}
            <a href="https://xsltplayground.com/blog/posts/xslt-grouping-for-each-group/" target="_blank" rel="noopener noreferrer">Grouping</a>
            {" · "}
            <a href="https://xsltplayground.com/blog/posts/xslt-template-matching-explained/" target="_blank" rel="noopener noreferrer">Template Matching</a>
          </span>
          {gitCommit && (
            <a
              className="version-pill"
              href={commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              title={`View commit ${gitCommit} on GitHub`}
            >
              {gitCommit}
            </a>
          )}
        </div>
        <div className="footer-right">
          <span>© 2026 <a href="https://alexandre-vazquez.com" target="_blank" rel="noopener noreferrer">Alexandre Vazquez</a>. All rights reserved.</span>
          <a
            href="https://alexandre-vazquez.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            alexandre-vazquez.com
          </a>
          <button
            type="button"
            className={`icon-button footer-theme-toggle${isDarkTheme ? " active" : ""}`}
            onClick={() => setTheme(isDarkTheme ? THEME_LIGHT : THEME_DARK)}
            title="Toggle dark mode"
            aria-label="Toggle dark mode"
          >
            <Icon name="moon" />
          </button>
        </div>
      </div>
      {traceHover && (
        <div
          className="trace-hover-tooltip"
          style={{ top: traceHover.y, left: traceHover.x, maxWidth: traceHover.width }}
          onMouseEnter={cancelTraceTooltipHide}
          onMouseLeave={() => {
            cancelTraceTooltipHide();
            setTraceHover(null);
          }}
        >
          <div className="trace-hover-actions">
            <button
              type="button"
              className="icon-button"
              onClick={copyTraceHover}
              title="Copy value"
              aria-label="Copy value"
            >
              <Icon name="copy" />
            </button>
          </div>
          <pre>{traceHover.text}</pre>
        </div>
      )}
      {templatesOpen && (
        <Suspense fallback={null}>
          <TemplateGallery
            onPick={handlePickTemplate}
            onClose={() => setTemplatesOpen(false)}
          />
        </Suspense>
      )}
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
