import { useState } from "react";
import Icon from "./Icon";

export default function TabsNav({
  tabs,
  activeId,
  onSelect,
  onClose,
  onExport,
  onClear,
  onRename,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftName, setDraftName] = useState("");

  const startEditing = (tab) => {
    setEditingId(tab.id);
    setDraftName(typeof tab.name === "string" ? tab.name : "");
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftName("");
  };

  const commitEditing = (tab) => {
    if (!tab) return;
    onRename?.(tab.id, draftName);
    cancelEditing();
  };

  return (
    <div className="tabs-left">
      {tabs.map((tab, index) => {
        const isActive = tab.id === activeId;
        const isEditing = tab.id === editingId;
        const label =
          typeof tab.name === "string" && tab.name.trim()
            ? tab.name
            : `Workspace ${index + 1}`;
        return (
          <div
            key={tab.id}
            className={`tab ${isActive ? "active" : ""}`}
          >
            <div className="tab-tools">
              <button
                type="button"
                className="icon-button tab-icon"
                onClick={() => onExport?.(tab)}
                title="Export workspace"
                aria-label={`Export workspace ${index + 1}`}
              >
                <Icon name="export" />
              </button>
              <button
                type="button"
                className="icon-button tab-icon"
                onClick={() => onClear?.(tab)}
                title="Clear workspace"
                aria-label={`Clear workspace ${index + 1}`}
              >
                <Icon name="trash" />
              </button>
              <button
                type="button"
                className="icon-button tab-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  startEditing(tab);
                }}
                title="Rename workspace"
                aria-label={`Rename workspace ${index + 1}`}
              >
                <Icon name="edit" />
              </button>
            </div>
            {isEditing ? (
              <input
                type="text"
                className="tab-name-input"
                value={draftName}
                placeholder={`Workspace ${index + 1}`}
                onChange={(e) => setDraftName(e.target.value)}
                onBlur={() => commitEditing(tab)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    commitEditing(tab);
                  }
                  if (e.key === "Escape") {
                    e.preventDefault();
                    cancelEditing();
                  }
                }}
                autoFocus
              />
            ) : (
              <button
                type="button"
                className="tab-button"
                onClick={() => onSelect?.(tab.id)}
                title={label}
              >
                {label}
              </button>
            )}
            {tabs.length > 1 && (
              <button
                type="button"
                className="icon-button tab-close"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose?.(tab.id);
                }}
                title="Close workspace"
                aria-label={`Close workspace ${index + 1}`}
              >
                <Icon name="close" />
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
