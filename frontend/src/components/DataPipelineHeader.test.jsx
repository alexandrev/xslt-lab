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
      <DataPipelineHeader
        collapsed={false}
        onToggleCollapsed={onToggle}
        onAddParam={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /hide data pipeline/i }));
    expect(onToggle).toHaveBeenCalledTimes(1);
  });

  it("calls add handler when add button pressed", () => {
    const onAdd = vi.fn();
    render(
      <DataPipelineHeader
        collapsed
        onToggleCollapsed={vi.fn()}
        onAddParam={onAdd}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add new parameter/i }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });
});
