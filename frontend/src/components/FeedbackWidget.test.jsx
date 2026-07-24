import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import FeedbackWidget from "./FeedbackWidget";

beforeEach(() => {
  localStorage.clear();
  window.env = { VITE_FEEDBACK_WEBHOOK_URL: "https://example.test/feedback" };
  window.gtag = vi.fn();
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  delete window.env;
  delete window.gtag;
});

describe("FeedbackWidget", () => {
  it("opens the detail form after a negative satisfaction answer", () => {
    render(<FeedbackWidget />);
    fireEvent.click(screen.getByRole("button", { name: "Not quite" }));
    expect(screen.getByPlaceholderText("What could be better?")).toBeInTheDocument();
  });

  it("persists dismissal so satisfaction is not requested again", () => {
    const onComplete = vi.fn();
    render(<FeedbackWidget onComplete={onComplete} />);
    fireEvent.click(screen.getByRole("button", { name: "Dismiss feedback" }));
    expect(localStorage.getItem("xsp_satisfaction_feedback_done")).toBe("1");
    expect(onComplete).toHaveBeenCalledOnce();
  });

  it("submits a contextual bug report and keeps a GitHub fallback", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);
    render(
      <FeedbackWidget
        kind="bug"
        reportUrl="https://github.test/issue"
        context={{ error: "daemon unavailable", repro_url: "https://example.test/repro" }}
      />,
    );
    expect(screen.getByRole("link", { name: "Open GitHub issue" })).toHaveAttribute(
      "href",
      "https://github.test/issue",
    );
    fireEvent.change(screen.getByPlaceholderText("What did you expect to happen?"), {
      target: { value: "Expected a result" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Send feedback" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    const payload = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(payload).toMatchObject({
      type: "bug",
      message: "Expected a result",
      error: "daemon unavailable",
      repro_url: "https://example.test/repro",
    });
  });
});
