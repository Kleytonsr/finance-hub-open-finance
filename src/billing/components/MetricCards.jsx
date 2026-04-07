export function SummaryCard({ label, value, note, tone = "neutral" }) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <div className="summary-top">
        <span className="metric-label">{label}</span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function InsightCard({ label, value, note, tone = "neutral" }) {
  return (
    <article className={`insight-card insight-${tone}`}>
      <span className="micro-label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function OverviewMetricCard({ label, value, note, tone = "neutral" }) {
  return (
    <article className={`overview-metric-card overview-${tone}`}>
      <span className="micro-label">{label}</span>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

export function ContextBadge({ children, theme = "context-badge-neutral" }) {
  return <span className={`context-badge ${theme}`}>{children}</span>;
}
