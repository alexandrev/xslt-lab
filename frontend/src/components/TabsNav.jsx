export default function TabsNav({
  tabs,
  activeId,
  onSelect,
  onClose,
  onExport,
  onClear,
}) {
  return (
    <div className="tabs-left">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;
        return (
          <div
            key={tab.id}
            className={`tab ${isActive ? "active" : ""}`}
          >
            <div className="tab-tools">
              <button
                type="button"
                className="tab-icon"
                onClick={() => onExport?.(tab)}
                title="Export workspace"
                aria-label={`Export workspace ${index + 1}`}
              >
                📤
              </button>
              <button
                type="button"
                className="tab-icon"
                onClick={() => onClear?.(tab)}
                title="Clear workspace"
                aria-label={`Clear workspace ${index + 1}`}
              >
                🧹
              </button>
            </div>
            <button
              type="button"
              className="tab-button"
              onClick={() => onSelect?.(tab.id)}
            >
              {`Workspace ${index + 1}`}
            </button>
            {tabs.length > 1 && (
              <button
                type="button"
                className="tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.(tab.id);
                }}
                title="Close workspace"
                aria-label={`Close workspace ${index + 1}`}
              >
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
