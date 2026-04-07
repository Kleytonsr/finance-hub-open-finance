import { barTone } from "../utils";

export default function RankList({ title, subtitle, rows, rowLabel, rowValue, rowNote }) {
  const maxValue = rows[0]?.total || 1;

  return (
    <section className="module-card">
      <div className="module-header">
        <div>
          <span className="micro-label">{subtitle}</span>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="rank-list">
        {rows.map((row) => (
          <div key={row.key} className="rank-row">
            <div className="rank-row-top">
              <div>
                <strong>{rowLabel(row)}</strong>
                {rowNote ? <span className="row-sub">{rowNote(row)}</span> : null}
              </div>
              <span>{rowValue(row)}</span>
            </div>
            <div className="rank-track">
              <div
                className={`rank-fill ${barTone(row.category || row.root || row.name)}`}
                style={{ width: `${Math.max((row.total / maxValue) * 100, 6)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
