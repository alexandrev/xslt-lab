const SURVEY_OPTIONS = [
  { id: "learning", label: "Learning XSLT" },
  { id: "work", label: "Work / integration" },
  { id: "debugging", label: "Debugging" },
  { id: "other", label: "Other" },
];

export default function UsageSurvey({ onDismiss }) {
  const handleSelect = (id) => {
    if (typeof window.gtag === "function") {
      window.gtag("event", "usage_survey", { use_case: id });
    }
    onDismiss();
  };

  return (
    <div className="usage-survey" role="complementary" aria-label="Quick survey">
      <span className="usage-survey-q">What are you using this for?</span>
      <div className="usage-survey-options">
        {SURVEY_OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className="usage-survey-btn"
            onClick={() => handleSelect(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="usage-survey-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss survey"
      >
        ✕
      </button>
    </div>
  );
}
