import { useEffect, useRef } from "react";

const SCRIPT_ID = "bmc-widget";

export default function BuyMeACoffee() {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (document.getElementById(SCRIPT_ID)) return;

    let cancelled = false;
    let script = null;
    let cancelIdle = null;
    let handleLoad = null;
    const loadWidget = () => {
      if (cancelled || !containerRef.current) return;
      script = document.createElement("script");
      script.id = SCRIPT_ID;
      script.setAttribute("data-name", "BMC-Widget");
      script.src = "https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js";
      script.setAttribute("data-id", "alexandrev");
      script.setAttribute("data-description", "Support me on Buy me a coffee!");
      script.setAttribute(
        "data-message",
        "Thanks for using XSLT Playground. If it helped you, feel free to buy me a coffee ☕",
      );
      script.setAttribute("data-color", "#FFDD00");
      script.setAttribute("data-position", "Right");
      script.setAttribute("data-x_margin", "24");
      script.setAttribute("data-y_margin", "24");
      script.async = true;
      containerRef.current.appendChild(script);

      handleLoad = () => {
        const evt = document.createEvent("Event");
        evt.initEvent("DOMContentLoaded", false, false);
        window.dispatchEvent(evt);
      };
      script.addEventListener("load", handleLoad);
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(loadWidget, { timeout: 2500 });
      cancelIdle = () => window.cancelIdleCallback?.(idleId);
    } else {
      const timerId = window.setTimeout(loadWidget, 1800);
      cancelIdle = () => window.clearTimeout(timerId);
    }

    return () => {
      cancelled = true;
      cancelIdle?.();
      if (script && handleLoad) {
        script.removeEventListener("load", handleLoad);
      }
    };
  }, []);

  return <div id="supportByBMC" ref={containerRef} />;
}
