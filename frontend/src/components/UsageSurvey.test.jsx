import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import UsageSurvey from "./UsageSurvey";

afterEach(cleanup);

describe("UsageSurvey", () => {
  it("renders all four options", () => {
    render(<UsageSurvey onDismiss={() => {}} />);
    expect(screen.getByText("Learning XSLT")).toBeInTheDocument();
    expect(screen.getByText("Work / integration")).toBeInTheDocument();
    expect(screen.getByText("Debugging")).toBeInTheDocument();
    expect(screen.getByText("Other")).toBeInTheDocument();
  });

  it("calls onDismiss when an option is clicked", () => {
    const onDismiss = vi.fn();
    render(<UsageSurvey onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: "Learning XSLT" }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("calls onDismiss when the dismiss button is clicked", () => {
    const onDismiss = vi.fn();
    render(<UsageSurvey onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: /dismiss survey/i }));
    expect(onDismiss).toHaveBeenCalledOnce();
  });

  it("fires a gtag event with the selected use_case", () => {
    const gtag = vi.fn();
    window.gtag = gtag;
    render(<UsageSurvey onDismiss={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Work / integration" }));
    expect(gtag).toHaveBeenCalledWith("event", "usage_survey", { use_case: "work" });
    delete window.gtag;
  });

  it("does not throw when gtag is not defined", () => {
    delete window.gtag;
    render(<UsageSurvey onDismiss={() => {}} />);
    expect(() =>
      fireEvent.click(screen.getByRole("button", { name: "Debugging" })),
    ).not.toThrow();
  });
});
