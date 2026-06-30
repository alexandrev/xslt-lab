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
      <div className="title">Input</div>
    </div>
  );
}
