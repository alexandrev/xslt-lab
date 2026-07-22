import Icon from "./Icon";

export default function DataPipelineHeader({
  collapsed,
  onToggleCollapsed,
}) {
  return (
    <div className="params-header">
      <button
        type="button"
        className="icon-button params-collapse"
        title={collapsed ? "Show input" : "Hide input"}
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Show input" : "Hide input"}
      >
        <Icon name={collapsed ? "chevron-right" : "chevron-down"} />
      </button>
      {/* The title reads as part of the collapse control — clicking it toggles
          too, so clicks on the header text aren't dead. */}
      <div
        className="title title-clickable"
        onClick={onToggleCollapsed}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onToggleCollapsed();
          }
        }}
      >
        Input
      </div>
    </div>
  );
}
