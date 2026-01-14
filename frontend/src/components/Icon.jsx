const ICON_PATHS = {
  plus: (
    <>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </>
  ),
  close: (
    <>
      <path d="M6 6l12 12" />
      <path d="M18 6l-12 12" />
    </>
  ),
  "chevron-right": <path d="M9 6l6 6-6 6" />,
  "chevron-left": <path d="M15 6l-6 6 6 6" />,
  "chevron-down": <path d="M6 9l6 6 6-6" />,
  "chevron-up": <path d="M6 15l6-6 6 6" />,
  upload: (
    <>
      <path d="M12 16V6" />
      <path d="M8 10l4-4 4 4" />
      <path d="M4 18h16" />
    </>
  ),
  download: (
    <>
      <path d="M12 8v10" />
      <path d="M8 14l4 4 4-4" />
      <path d="M4 20h16" />
    </>
  ),
  import: (
    <>
      <path d="M12 4v10" />
      <path d="M8 10l4 4 4-4" />
      <path d="M4 18h16" />
    </>
  ),
  export: (
    <>
      <path d="M12 20V10" />
      <path d="M8 14l4-4 4 4" />
      <path d="M4 6h16" />
    </>
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M8 6V4h8v2" />
      <path d="M6 6l1 14h10l1-14" />
      <path d="M10 10v6" />
      <path d="M14 10v6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20l4-1 11-11-3-3-11 11-1 4z" />
      <path d="M14 5l3 3" />
    </>
  ),
  copy: (
    <>
      <rect x="9" y="9" width="10" height="10" rx="2" />
      <rect x="5" y="5" width="10" height="10" rx="2" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15 15 0 0 1 0 20" />
      <path d="M12 2a15 15 0 0 0 0 20" />
    </>
  ),
  code: (
    <>
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </>
  ),
  refresh: <path d="M3 12a9 9 0 0 1 15-6l2-2v6h-6l2-2a7 7 0 1 0 2 8" />,
  sparkles: (
    <>
      <path d="M12 3l1.6 4.8L18 9l-4.4 1.2L12 15l-1.6-4.8L6 9l4.4-1.2L12 3z" />
      <path d="M19 4l0.8 2.4L22 7l-2.2 0.6L19 10l-0.8-2.4L16 7l2.2-0.6L19 4z" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4l9 16H3l9-16z" />
      <path d="M12 9v4" />
      <path d="M12 17h0.01" />
    </>
  ),
  terminal: (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10l2 2-2 2" />
      <path d="M12 14h4" />
    </>
  ),
  "terminal-off": (
    <>
      <rect x="4" y="5" width="16" height="14" rx="2" />
      <path d="M8 10l2 2-2 2" />
      <path d="M12 14h4" />
      <path d="M6 6l12 12" />
    </>
  ),
  moon: (
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  ),
};

export default function Icon({ name, size = 16, stroke = 1.8, className = "" }) {
  const icon = ICON_PATHS[name];
  if (!icon) return null;
  return (
    <svg
      className={`icon-svg ${className}`.trim()}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon}
    </svg>
  );
}
