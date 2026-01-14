import Icon from "./Icon";

export default function DataPipelineHeader({
  collapsed,
  onToggleCollapsed,
  onAddParam,
}) {
  return (
    <div className="params-header">
      <button
        type="button"
        className="icon-button params-collapse"
        title={collapsed ? "Show data pipeline" : "Hide data pipeline"}
        onClick={onToggleCollapsed}
        aria-label={collapsed ? "Show data pipeline" : "Hide data pipeline"}
      >
        <Icon name={collapsed ? "chevron-right" : "chevron-down"} />
      </button>
      <div className="title">Data Pipeline</div>
      <div className="params-header-actions">
        <button
          type="button"
          className="icon-button"
          onClick={onAddParam}
          title="Add new parameter"
          aria-label="Add new parameter"
        >
          <Icon name="plus" />
        </button>
      </div>
    </div>
  );
}
