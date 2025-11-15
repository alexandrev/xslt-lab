import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import GA4React from "ga-4-react";
import Editor from "@monaco-editor/react";
import formatXML from "xml-formatter";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import logo from "./logo.svg";
import TabsNav from "./components/TabsNav";
import DataPipelineHeader from "./components/DataPipelineHeader";
import FeedbackWidget from "./components/FeedbackWidget";
import BuyMeACoffee from "./components/BuyMeACoffee";
import {
  parseErrorLines,
  stripParamBlock,
  injectParamBlock,
  addParams,
  extractParamNames,
  setStylesheetVersion,
} from "./lib/workspaceUtils";

/* global __APP_VERSION__ */

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
const defaultRepoUrl = "https://github.com/alexandrev/xslt-lab";
const repoUrl = env.VITE_REPO_URL || defaultRepoUrl;
const newsUrl = env.VITE_NEWS_URL || "https://alexandrev.github.io/xslt-lab/";
const resolvedVersion =
  typeof __APP_VERSION__ !== "undefined" && __APP_VERSION__
    ? __APP_VERSION__
    : env.VITE_APP_VERSION || "";
const changelogUrl = `${repoUrl}/blob/main/CHANGELOG.md${
  resolvedVersion ? `#${changelogAnchor(resolvedVersion)}` : ""
}`;

function defaultTab() {
  return {
    id: Date.now() + Math.random(),
    params: [{ name: "input1", value: "<root/>", open: true }],
    xslt: `<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">\n<xsl:template match="/">\n<root/>\n</xsl:template>\n</xsl:stylesheet>`,
    version: "1.0",
  };
}

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

function defaultWorkspaceStatus() {
  return {
    result: "",
    duration: null,
    error: "",
    errorLines: [],
    traceEntries: [],
    traceText: "",
    showRawTrace: false,
  };
}

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
    },
    status,
  };
}

function changelogAnchor(version) {
  if (!version) return "";
  return `v${version}`.replace(/[^0-9a-zA-Z]+/g, "").toLowerCase();
}

export default function App() {
  // Load persisted workspace from localStorage (if present)
  let initialTabs = [defaultTab()];
  try {
    const stored = localStorage.getItem("tabs");
    if (stored) initialTabs = JSON.parse(stored);
  } catch {}
  if (initialTabs.length > MAX_WORKSPACES) {
    initialTabs = initialTabs.slice(0, MAX_WORKSPACES);
  }
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
    initialTabs.forEach((tab) => {
      initialStatus[tab.id] = stored[tab.id]
        ? { ...defaultWorkspaceStatus(), ...stored[tab.id] }
        : defaultWorkspaceStatus();
    });
    return initialStatus;
  });
  const [editorFocused, setEditorFocused] = useState(false);
  const [user, setUser] = useState(null);
  const [auth, setAuth] = useState(null);
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
  const [errorCollapsed, setErrorCollapsed] = useState(false);
  const workspaceImportRef = useRef(null);
  const resultResizeState = useRef({ startY: 0, startHeight: MIN_RESULT_HEIGHT });
  const paramResizeState = useRef({ startX: 0, startWidth: DEFAULT_PARAM_WIDTH });
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

  const backendBase = (env.VITE_BACKEND_URL || "").replace(/\/$/, "");
  console.log("Using this URL as backendURL:", backendBase);

  useEffect(() => {
    const ga4react = new GA4React(env.VITE_GA_ID);
    ga4react.initialize().catch(err => console.error(err));
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
  const activeStatus = activeTab
    ? (workspaceStatus[activeTab.id] || defaultWorkspaceStatus())
    : defaultWorkspaceStatus();
  const {
    result,
    duration,
    error,
    errorLines,
    traceEntries,
    traceText,
    showRawTrace,
  } = activeStatus;
  const MAX_ERROR_LINES = 3;
  const limitedErrorLines = (errorLines || []).slice(0, MAX_ERROR_LINES);
  const hasHiddenErrors = (errorLines || []).length > MAX_ERROR_LINES;
  const canCopyErrors = Boolean((errorLines && errorLines.length) || error);
  const showResultPane = !error;
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
    try {
      const cfg = env.VITE_FIREBASE_CONFIG;
      if (cfg) {
        const app = initializeApp(JSON.parse(cfg));
        const a = getAuth(app);
        setAuth(a);
        a.onAuthStateChanged((u) => setUser(u));
      }
    } catch {}
  }, []);

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
          const cleared = { ...defaultTab(), id: t.id, params: [] };
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
          duration: null,
          result: "",
          traceEntries: [],
          traceText: "",
          showRawTrace: false,
        });
        return;
      }
      const data = await res.json();
      updateWorkspaceStatus(tabId, {
        result: data.result,
        duration: data.duration_ms,
        error: "",
        errorLines: [],
        showRawTrace: false,
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
        result: "",
        duration: null,
        traceEntries: [],
        traceText: "",
        showRawTrace: false,
      });
    }
  }, 500);

  useEffect(() => {
    if (!activeTab) return;
    runTransform(
      injectParamBlock(activeTab.xslt, activeTab.params),
      activeTab.version,
      activeTab.params,
      activeTab.id,
    );
  }, [activeTab, traceEnabled]);

  useEffect(() => {
    syncParams();
  }, [active, syncParams]);

  useEffect(() => {
    if (!editorFocused) syncParams();
  }, [editorFocused, syncParams]);


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
    if (adsenseClient && adsenseSlot && window.adsbygoogle) {
      try {
        window.adsbygoogle.push({});
      } catch {}
    }
  }, []);

  return (
    <div className="app-container">
      <div className="tabs">
        <TabsNav
          tabs={tabs}
          activeId={active}
          onSelect={setActive}
          onClose={handleRemoveWorkspace}
          onExport={handleExportWorkspace}
          onClear={handleClearWorkspace}
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
            ➕
          </button>
          <button
            type="button"
            className="icon-button tab-import"
            onClick={() => workspaceImportRef.current?.click()}
            title="Import workspace"
            aria-label="Import workspace"
          >
            📥
          </button>
          <input
            ref={workspaceImportRef}
            type="file"
            accept="application/json,.json"
            className="file-input"
            onChange={handleWorkspaceImport}
          />
        </div>
      </div>
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
              ▶
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
                onAddParam={addParam}
              />
              <div
                className="params-body"
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDropNewParam}
              >
                {activeTab.params.map((p, i) => (
                  <div key={i} className={`param-card${p.open ? " open" : ""}`}>
                    <div className="param-header-row">
                      <div className="param-name-wrap">
                        <button
                          type="button"
                          className={`icon-button param-toggle${p.open ? " open" : ""}`}
                          aria-label={p.open ? "Collapse parameter details" : "Expand parameter details"}
                          onClick={() => updateParam(i, "open", !p.open)}
                        >
                          {p.open ? "▾" : "▸"}
                        </button>
                        <input
                          className="param-name-input"
                          placeholder="Parameter name"
                          value={p.name}
                          onChange={(e) => updateParam(i, "name", e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        className="icon-button param-remove"
                        aria-label="Remove parameter"
                        onClick={() => removeParam(i)}
                      >
                        <span aria-hidden="true">✕</span>
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
                          <label className="icon-button file-label param-upload">
                            📤
                            <input
                              type="file"
                              accept=".xml"
                              className="file-input"
                              onChange={(e) => loadFile(e, (t) => updateParam(i, "value", t))}
                            />
                          </label>
                          <button
                            type="button"
                            className="icon-button param-download"
                            aria-label="Download parameter value"
                            onClick={() => download(p.value, `${p.name || "param"}.xml`)}
                          >
                            📥
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
                <div className="drop-hint">Drop your input XML files here..</div>
              </div>
            </div>
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
            >
              <option value="1.0">XSLT 1.0</option>
              <option value="2.0">XSLT 2.0</option>
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
            <div className="right-actions">
              <label className="icon-button file-label">
                📤
                <input
                  type="file"
                  accept=".xsl,.xslt"
                  className="file-input"
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
                onClick={() =>
                  download(
                    injectParamBlock(activeTab.xslt, activeTab.params),
                    "transform.xsl",
                  )
                }
              >
                📥
              </button>
            </div>
          </div>
          <div className="editor-split">
            <div className="xslt-editor-wrap">
              <Editor
                height="100%"
                language="xml"
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
                value={editorFocused ? activeTab.xslt : injectParamBlock(activeTab.xslt, activeTab.params)}
                onChange={(v) =>
                  setTabs((tabs) =>
                    tabs.map((tab) =>
                      tab.id === active ? { ...tab, xslt: stripParamBlock(v || ""), params: addParams(v,tab) } : tab,
                    ),
                  )
                }
                onFocus={() => setEditorFocused(true)}
                onBlur={() => {
                  setEditorFocused(false);
                  syncParams();
                }}
                options={{ minimap: { enabled: false }, automaticLayout: true }}
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
                    {traceCollapsed ? '▶' : '▼'}
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
                        >
                          📋
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
                          >
                            {showRawTrace ? "🗕" : "🗖"}
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
          <div className="error-box">
            <div className="error-box-header">
              <span>Errors</span>
              <div className="error-box-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={copyErrors}
                  disabled={!canCopyErrors}
                  title="Copy all errors"
                  aria-label="Copy errors"
                >
                  📋
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={() => setErrorCollapsed(true)}
                  title="Hide errors"
                  aria-label="Hide errors"
                >
                  🗕
                </button>
              </div>
            </div>
            {limitedErrorLines.length > 0 ? (
              <table className="error-table">
                <tbody>
                  {limitedErrorLines.map((l, i) => (
                    <tr key={i} className="error-row">
                      <td className="error-icon" aria-hidden>
                        🚨
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
                  🚨
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
            ⚠️
          </button>
        )}
        {showResultPane && (
          <>
            {duration !== null && (
              <div className="success-box">Success in {duration} ms</div>
            )}
            <button
              className="icon-button result-format-button"
              onClick={() => {
                try {
                  const formatted = formatXML(result);
                  if (activeTab) {
                    updateWorkspaceStatus(activeTab.id, (prev) => ({
                      ...prev,
                      result: formatted,
                    }));
                  }
                } catch {}
              }}
            >
              📝
            </button>
            <button
              type="button"
              className={`icon-button result-reset-button${isCustomResultHeight ? " active" : ""}`}
              onClick={handleResetResultHeight}
              title="Reset result pane height"
              aria-label="Reset result pane height"
            >
              ⟳
            </button>
            <div className="result-editor-wrap">
              <Editor
                height="100%"
                language="xml"
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
            </div>
          </>
        )}
      </div>
      <div className="footer">
        <div className="footer-left">
          <img src={logo} alt="logo" className="logo" />
          <strong>xsltplayground.com</strong>
          <a
            className="news-link"
            href={newsUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            News
          </a>
          {resolvedVersion && (
            <a
              className="version-pill"
              href={changelogUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="View CHANGELOG"
            >
              v{resolvedVersion}
            </a>
          )}
        </div>
        <div className="footer-right">
          <span>© 2025 Alexandre Vazquez. All rights reserved.</span>
          <a
            href="https://alexandre-vazquez.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            alexandre-vazquez.com
          </a>
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
            <button type="button" className="icon-button" onClick={copyTraceHover} title="Copy value">
              📋
            </button>
          </div>
          <pre>{traceHover.text}</pre>
        </div>
      )}
      <BuyMeACoffee />
      <FeedbackWidget />
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
