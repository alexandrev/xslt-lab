import { render, screen, waitFor, cleanup, fireEvent } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

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
