import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { describe, it, expect, vi, afterEach } from "vitest";
import TabsNav from "./TabsNav";

const sampleTabs = [
  { id: "a" },
  { id: "b" },
];

afterEach(() => {
  cleanup();
});

describe("TabsNav", () => {
  it("invokes export handler for the selected tab button", () => {
    const onExport = vi.fn();
    render(
      <TabsNav
        tabs={sampleTabs}
        activeId="a"
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onExport={onExport}
        onClear={vi.fn()}
      />,
    );

    const exportButtons = screen.getAllByRole("button", { name: /Export workspace/ });
    fireEvent.click(exportButtons[1]);

    expect(onExport).toHaveBeenCalledTimes(1);
    expect(onExport).toHaveBeenCalledWith(sampleTabs[1]);
  });

  it("invokes clear handler for matching tab", () => {
    const onClear = vi.fn();
    render(
      <TabsNav
        tabs={sampleTabs}
        activeId="a"
        onSelect={vi.fn()}
        onClose={vi.fn()}
        onExport={vi.fn()}
        onClear={onClear}
      />,
    );

    const clearButton = screen.getAllByRole("button", { name: /Clear workspace/ })[0];
    fireEvent.click(clearButton);

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onClear).toHaveBeenCalledWith(sampleTabs[0]);
  });
});
