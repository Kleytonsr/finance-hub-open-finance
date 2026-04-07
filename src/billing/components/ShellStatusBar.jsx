export default function ShellStatusBar({
  shellView,
  selectedCard,
  filteredTotal,
  filteredTransactionsCount,
  activeFilters,
  money,
  shortCount,
  activateView,
  cardHomeRef,
  rootMapRef,
  explorerRef,
}) {
  const shellTitleMap = {
    home: "Inicio do produto",
    carteira: "Central da carteira",
    insights: "Insights do ciclo",
    explorer: "Explorer da fatura",
  };

  const scopeLabel = selectedCard === "todos" ? "Carteira inteira em leitura" : `Foco no cartao final ${selectedCard}`;

  return (
    <section className="shell-status-bar module-card section-reveal">
      <div className="shell-status-copy">
        <span className="micro-label">Modo ativo</span>
        <strong>{shellTitleMap[shellView] || "Finance Hub"}</strong>
        <small>{scopeLabel}</small>
      </div>

      <div className="shell-status-metrics">
        <div className="shell-status-pill">
          <span>Recorte</span>
          <strong>{money(filteredTotal)}</strong>
        </div>
        <div className="shell-status-pill">
          <span>Itens</span>
          <strong>{shortCount(filteredTransactionsCount)}</strong>
        </div>
      </div>

      <div className="shell-status-tags">
        {activeFilters.length ? (
          activeFilters.slice(0, 3).map((filter) => (
            <span key={filter.label} className="shell-status-tag">
              {filter.label}
            </span>
          ))
        ) : (
          <span className="shell-status-tag muted">Sem filtros extras</span>
        )}
      </div>

      <div className="shell-status-actions">
        <button type="button" className="shell-action shell-action-ghost" onClick={() => activateView("carteira", cardHomeRef)}>
          Carteira
        </button>
        <button type="button" className="shell-action shell-action-ghost" onClick={() => activateView("insights", rootMapRef)}>
          Insights
        </button>
        <button type="button" className="shell-action shell-action-primary" onClick={() => activateView("explorer", explorerRef)}>
          Explorer
        </button>
      </div>
    </section>
  );
}
