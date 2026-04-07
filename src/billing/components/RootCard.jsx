import { ContextBadge } from "./MetricCards";
import { barTone, cardBadgeTheme, channelBadgeTheme, money, pct, shortCount, toneForName } from "../utils";

export default function RootCard({
  row,
  details,
  expanded,
  onOpen,
  onApplyFilter,
  onToggle,
  onOpenTransaction,
  onShowTransactions,
}) {
  const breakdown = row.categories.slice(0, 4);
  const primaryCategory = breakdown[0]?.name || row.root;

  return (
    <article className="root-card">
      <div className="root-card-top">
        <div>
          <span className={`root-chip root-chip-${toneForName(primaryCategory)}`}>{row.root}</span>
          <h3>{money(row.total)}</h3>
        </div>
        <button type="button" className="ghost-link" onClick={() => onApplyFilter(row.root)}>
          filtrar
        </button>
      </div>

      <div className="root-card-meta">
        <span>{pct(row.sharePct)} da fatura</span>
        <span>{shortCount(row.count)} lancamentos</span>
      </div>

      <div className="segment-bar">
        {breakdown.map((item) => (
          <span
            key={`${row.root}-${item.name}`}
            className={`segment-piece ${barTone(item.name)}`}
            style={{ width: `${Math.max(item.sharePct, 6)}%` }}
            title={`${item.name}: ${money(item.total)}`}
          />
        ))}
      </div>

      <div className="root-card-tags">
        {breakdown.map((item) => (
          <span key={`${row.root}-${item.name}-tag`} className="mini-chip">
            {item.name} {pct(item.sharePct)}
          </span>
        ))}
      </div>

      <p className="root-card-note">
        Topo: {row.merchants.map((item) => `${item.name} ${money(item.total)}`).join(" · ")}
      </p>

      <div className="root-card-actions">
        <button type="button" className="detail-link" onClick={() => onToggle(row.root)}>
          {expanded ? "ocultar lancamentos" : "abrir lancamentos"}
        </button>
        <button type="button" className="ghost-link" onClick={() => onOpen(row)}>
          resumo
        </button>
      </div>

      {expanded ? (
        <div className="root-card-expanded">
          <div className="expanded-meta-grid">
            <div>
              <span className="micro-label">Subtipos</span>
              <div className="expanded-chip-row">
                {details.subgroups.slice(0, 6).map((item) => (
                  <span key={`${row.root}-${item.name}-sub`} className="mini-chip">
                    {item.name} {money(item.total)}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className="micro-label">Canal inferido</span>
              <div className="expanded-chip-row">
                {details.channels.map((item) => (
                  <span key={`${row.root}-${item.name}-channel`} className="mini-chip mini-chip-muted">
                    {item.name} {shortCount(item.count)}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="mini-table">
            <div className="mini-table-header">
              <span>Data</span>
              <span>Lancamento</span>
              <span>Contexto</span>
              <span>Valor</span>
            </div>
            {details.transactions.map((transaction) => (
              <button
                key={transaction.id}
                type="button"
                className="mini-table-row"
                onClick={() => onOpenTransaction(transaction)}
              >
                <span className="mini-cell-date">{transaction.date}</span>
                <span className="mini-cell-merchant">
                  <strong>{transaction.merchant}</strong>
                  <small>{transaction.subgroup}{transaction.installment_tag ? ` · ${transaction.installment_tag}` : ""}</small>
                </span>
                <span className="mini-cell-context">
                  <ContextBadge theme={cardBadgeTheme(transaction.card_last4)}>{transaction.card_last4}</ContextBadge>
                  <ContextBadge theme={channelBadgeTheme(transaction.channel)}>{transaction.channel}</ContextBadge>
                </span>
                <span className="mini-cell-value">{money(transaction.amount)}</span>
              </button>
            ))}
          </div>

          <div className="root-card-actions">
            <button type="button" className="detail-link" onClick={() => onShowTransactions(row.root)}>
              ver todos na tabela
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}
