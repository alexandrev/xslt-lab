import { TEMPLATES } from "../lib/templates";

export default function TemplateGallery({ onPick, onClose }) {
  return (
    <div
      className="template-gallery-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Start from a template"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="template-gallery">
        <div className="template-gallery-header">
          <h2>Start from a template</h2>
          <button
            type="button"
            className="template-gallery-close"
            onClick={onClose}
            aria-label="Close templates"
          >
            ×
          </button>
        </div>
        <p className="template-gallery-lead">
          Each template opens in a new workspace with input XML that already runs.
        </p>
        <ul className="template-gallery-list">
          {TEMPLATES.map((t) => (
            <li key={t.id}>
              <button type="button" onClick={() => onPick(t)}>
                <span className="template-title">{t.title}</span>
                <span className="template-version">XSLT {t.version}</span>
                <span className="template-description">{t.description}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
