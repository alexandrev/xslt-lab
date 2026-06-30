import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import DataPipelineHeader from "./DataPipelineHeader";

afterEach(() => {
  cleanup();
});
describe("DataPipelineHeader", () => {
  it("calls toggle when collapse button clicked", () => {
    const onToggle = vi.fn();
    render(
      <DataPipelineHeader collapsed={false} onToggleCollapsed={onToggle} />,
    );

    fireEvent.click(screen.getByRole("button", { name: /hide input/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("renders the Input title", () => {
    render(<DataPipelineHeader collapsed={false} onToggleCollapsed={vi.fn()} />);
    expect(screen.getByText("Input")).toBeInTheDocument();
  });
});
