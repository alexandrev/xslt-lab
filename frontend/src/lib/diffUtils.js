// Line diff for comparing a transform's output against an expected result —
// the building block of the "does this stylesheet still do what it did?" check
// described in the regression-testing guide.

function normalize(text, { ignoreWhitespace }) {
  const lines = String(text ?? "").replace(/\r\n/g, "\n").split("\n");
  // Trailing blank lines are an artefact of serialisation, never a real change.
  while (lines.length && lines[lines.length - 1].trim() === "") lines.pop();
  return ignoreWhitespace ? lines.map((l) => l.trim()) : lines;
}

// Longest common subsequence over lines, walked back into a diff script.
function lcsTable(a, b) {
  const table = Array.from({ length: a.length + 1 }, () => new Uint32Array(b.length + 1));
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      table[i][j] = a[i] === b[j]
        ? table[i + 1][j + 1] + 1
        : Math.max(table[i + 1][j], table[i][j + 1]);
    }
  }
  return table;
}

/**
 * Compare actual output against expected output.
 * Returns { equal, changes, rows } where rows is a line-by-line script of
 * { type: "same" | "added" | "removed", text, line }.
 * "removed" = present in expected but missing from the actual output.
 */
export function diffLines(actual, expected, options = {}) {
  const { ignoreWhitespace = true, maxRows = 400 } = options;
  const a = normalize(expected, { ignoreWhitespace });
  const b = normalize(actual, { ignoreWhitespace });

  const table = lcsTable(a, b);
  const rows = [];
  let i = 0;
  let j = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      rows.push({ type: "same", text: a[i], line: j + 1 });
      i++;
      j++;
    } else if (table[i + 1][j] >= table[i][j + 1]) {
      rows.push({ type: "removed", text: a[i], line: null });
      i++;
    } else {
      rows.push({ type: "added", text: b[j], line: j + 1 });
      j++;
    }
  }
  while (i < a.length) rows.push({ type: "removed", text: a[i++], line: null });
  while (j < b.length) rows.push({ type: "added", text: b[j], line: j++ + 1 });

  const changes = rows.filter((r) => r.type !== "same").length;
  return {
    equal: changes === 0,
    changes,
    rows: rows.length > maxRows ? rows.slice(0, maxRows) : rows,
    truncated: rows.length > maxRows,
  };
}
