import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const FEEDBACK_MAIL = "xsltplayground@alexandre-vazquez.cloud";
const STORAGE_KEY = "feedbackPos";
const MIN_MARGIN = 10;
const DEFAULT_MARGIN = 24;
const FALLBACK_WIDTH = 220;
const ISSUE_URL =
  "https://github.com/alexandrev/xslt-lab/issues/new?template=idea.yml";

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
        if (
          typeof parsed?.x === "number" &&
          typeof parsed?.y === "number"
        ) {
          return parsed;
        }
        if (
          typeof parsed?.right === "number" &&
          typeof parsed?.top === "number"
        ) {
          return {
            x: Math.max(
              MIN_MARGIN,
              window.innerWidth - parsed.right - FALLBACK_WIDTH,
            ),
            y: Math.max(MIN_MARGIN, parsed.top),
          };
        }
      }
    } catch {}
    return null;
  });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [opensUp, setOpensUp] = useState(false);
  const resolvedPosition = useMemo(
    () => {
      if (position) return position;
      const fallbackHeight =
        viewportHeight || (typeof window !== "undefined" ? window.innerHeight : 0);
      return {
        x: DEFAULT_MARGIN,
        y: Math.max(DEFAULT_MARGIN, fallbackHeight - 220),
      };
    },
    [position, viewportHeight],
  );

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

  const clampWithinViewport = useCallback(
    (pos) => {
      if (
        !pos ||
        typeof window === "undefined" ||
        !widgetRef.current
      ) {
        return pos;
      }
      const rect = widgetRef.current.getBoundingClientRect();
      const maxX = Math.max(
        MIN_MARGIN,
        window.innerWidth - rect.width - MIN_MARGIN,
      );
      const maxY = Math.max(
        MIN_MARGIN,
        window.innerHeight - rect.height - MIN_MARGIN,
      );
      return {
        x: Math.min(Math.max(MIN_MARGIN, pos.x), maxX),
        y: Math.min(Math.max(MIN_MARGIN, pos.y), maxY),
      };
    },
    [],
  );

  useLayoutEffect(() => {
    if (!position) return;
    const next = clampWithinViewport(position);
    if (!next) return;
    if (next.x !== position.x || next.y !== position.y) {
      setPosition(next);
    }
  }, [position, clampWithinViewport, viewportHeight, viewportWidth, collapsed]);

  useLayoutEffect(() => {
    if (
      position ||
      typeof window === "undefined" ||
      typeof document === "undefined"
    )
      return;
    const widget = widgetRef.current;
    if (!widget) return;
    const footer = document.querySelector(".footer");
    const margin = DEFAULT_MARGIN;
    const viewport = window.innerHeight;
    const widgetRect = widget.getBoundingClientRect();
    let y = Math.max(margin, viewport - widgetRect.height - margin);

    if (footer) {
      const footerRect = footer.getBoundingClientRect();
      if (footerRect.top < viewport) {
        y = Math.max(margin, footerRect.top - widgetRect.height - margin);
      }
    }

    setPosition({ x: margin, y });
  }, [position]);

  useEffect(() => {
    if (!dragging) return;
    const handleMove = (event) => {
      event.preventDefault();
      const widget = widgetRef.current;
      const widgetRect = widget?.getBoundingClientRect();
      const maxX = Math.max(
        MIN_MARGIN,
        window.innerWidth -
          (widgetRect?.width ?? 0) -
          MIN_MARGIN,
      );
      const maxY = Math.max(
        MIN_MARGIN,
        window.innerHeight -
          (widgetRect?.height ?? 0) -
          MIN_MARGIN,
      );

      setPosition({
        x: Math.min(
          Math.max(MIN_MARGIN, event.clientX - offset.x),
          maxX,
        ),
        y: Math.min(
          Math.max(MIN_MARGIN, event.clientY - offset.y),
          maxY,
        ),
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

  const startDrag = (event) => {
    event.preventDefault();
    const rect = event.currentTarget.getBoundingClientRect();
    setOffset({
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    });
    setDragging(true);
  };

  const mailLink = `mailto:${FEEDBACK_MAIL}?subject=${encodeURIComponent(
    "xsltplayground feedback",
  )}`;

  return (
    <div
      ref={widgetRef}
      className={`feedback-widget ${collapsed ? "collapsed" : ""} ${opensUp ? "opens-up" : ""}`}
      style={{ left: resolvedPosition.x, top: resolvedPosition.y }}
    >
      <div
        className="feedback-header"
        onMouseDown={startDrag}
      >
        <span>Feedback</span>
        <button
          type="button"
          className="icon-button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Show feedback panel" : "Hide feedback panel"}
        >
          {collapsed ? "▲" : "▼"}
        </button>
      </div>
      {!collapsed && (
        <div className="feedback-body">
          <p>Have an idea or found a glitch? I would love to hear from you.</p>
          <a className="feedback-link" href={mailLink}>
            ✉️ Send feedback
          </a>
          <a
            className="feedback-link"
            href={ISSUE_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            🐞 Report issue on GitHub
          </a>
        </div>
      )}
    </div>
  );
}
