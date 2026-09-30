import "@testing-library/jest-dom/vitest";

// jsdom has no layout, and CodeMirror measures text ranges when it scrolls a
// selection into view. Empty rectangles are enough for it to carry on.
if (typeof Range !== "undefined") {
  const emptyRects = () => Object.assign([], { item: () => null });
  const emptyRect = () => ({ x: 0, y: 0, top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 });
  Range.prototype.getClientRects ??= emptyRects;
  Range.prototype.getBoundingClientRect ??= emptyRect;
}
