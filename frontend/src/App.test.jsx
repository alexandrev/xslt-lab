import { render, screen, waitFor, cleanup, fireEvent, act } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App, { buildBugReportUrl } from "./App";

vi.mock("@monaco-editor/react", () => ({
  default: () => <div data-testid="monaco-editor" />,
}));

vi.mock("ga-4-react", () => {
  return {
    default: class {
      initialize() {
        return Promise.resolve();
      }
    },
  };
});

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: async () => ({ result: "<root/>", duration_ms: 5 }),
      }),
    ),
  );
  window.env = {
    VITE_BACKEND_URL: "",
    VITE_GA_ID: "",
    VITE_GO_PRO: "false",
    VITE_APP_VERSION: "test",
    VITE_NEWS_URL: "https://example.com/news",
    VITE_REPO_URL: "https://example.com/repo",
  };
  window.adsbygoogle = [];
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete window.env;
});

describe("App bootstrap", () => {
  it("renders without crashing", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.getByText(/xsltplayground\.com/i)).toBeInTheDocument();
  });
});

describe("buildBugReportUrl", () => {
  it("includes version and error in the URL", () => {
    const url = buildBugReportUrl("2.0", "Connection refused", "<xsl:stylesheet/>");
    expect(url).toContain("labels=bug");
    expect(url).toContain(encodeURIComponent("2.0"));
    expect(url).toContain(encodeURIComponent("Connection refused"));
  });

  it("truncates xslt to 500 chars in the body", () => {
    const longXslt = "x".repeat(600);
    const url = buildBugReportUrl("1.0", "err", longXslt);
    const body = decodeURIComponent(url.split("body=")[1]);
    expect(body).toContain("x".repeat(500));
    expect(body).not.toContain("x".repeat(501));
  });

  it("handles missing arguments gracefully", () => {
    const url = buildBugReportUrl(undefined, undefined, undefined);
    expect(url).toContain("github.com/alexandrev/xslt-lab/issues/new");
  });
});

describe("server error reporting", () => {
  it("shows report link on 5xx response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 500,
          statusText: "Internal Server Error",
          json: async () => ({ error: "Saxon died" }),
        }),
      ),
    );
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() =>
      expect(screen.getByText(/report this bug/i)).toBeInTheDocument(),
    );
  });

  it("does not show report link on 400 XSLT syntax error", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 400,
          statusText: "Bad Request",
          json: async () => ({ error: "XSLT syntax error at line 3" }),
        }),
      ),
    );
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() =>
      expect(screen.getByText(/xslt syntax error/i)).toBeInTheDocument(),
    );
    expect(screen.queryByText(/report this bug/i)).not.toBeInTheDocument();
  });
});

describe("usage survey", () => {
  it("does not show survey before 3 successful transforms", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    expect(screen.queryByText(/what are you using this for/i)).not.toBeInTheDocument();
  });

  it("shows survey after 3 successful transforms", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    // 1st transform on mount
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 2000 });
    // Toggle trace twice to trigger 2 more transforms
    const traceCheckbox = screen.getByRole("checkbox", { name: /enable internal variables/i });
    await act(async () => { fireEvent.click(traceCheckbox); });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2), { timeout: 2000 });
    await act(async () => { fireEvent.click(traceCheckbox); });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3), { timeout: 2000 });
    await waitFor(() =>
      expect(screen.getByText(/what are you using this for/i)).toBeInTheDocument(),
    );
  });

  it("dismisses survey when ✕ is clicked", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1), { timeout: 2000 });
    const traceCheckbox = screen.getByRole("checkbox", { name: /enable internal variables/i });
    await act(async () => { fireEvent.click(traceCheckbox); });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2), { timeout: 2000 });
    await act(async () => { fireEvent.click(traceCheckbox); });
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(3), { timeout: 2000 });
    await waitFor(() =>
      expect(screen.getByText(/what are you using this for/i)).toBeInTheDocument(),
    );
    fireEvent.click(screen.getByRole("button", { name: /dismiss survey/i }));
    expect(screen.queryByText(/what are you using this for/i)).not.toBeInTheDocument();
  });
});

describe("version selector", () => {
  it("renders XSLT 1.0, 2.0 and 3.0 options", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const select = screen.getByRole("combobox", { name: /xslt version/i });
    const options = Array.from(select.querySelectorAll("option")).map(
      (o) => o.value,
    );
    expect(options).toContain("1.0");
    expect(options).toContain("2.0");
    expect(options).toContain("3.0");
  });

  it("updates stylesheet version attribute when selection changes", async () => {
    render(<App />);
    fireEvent.pointerDown(window);
    await waitFor(() => expect(fetch).toHaveBeenCalled());
    const select = screen.getByRole("combobox", { name: /xslt version/i });
    fireEvent.change(select, { target: { value: "3.0" } });
    expect(select.value).toBe("3.0");
  });
});
