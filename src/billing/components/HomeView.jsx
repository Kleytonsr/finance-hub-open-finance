import { InsightCard, OverviewMetricCard, SummaryCard } from "./MetricCards";

export default function HomeView({
  summary,
  installmentsCount,
  overviewMetrics,
  cardOptions,
  topCategory,
  topMerchant,
  topRoot,
  money,
  pct,
  shortCount,
  activateView,
  cardHomeRef,
  rootMapRef,
  explorerRef,
  handleCardSelect,
}) {
  return (
    <>
      <section className="overview-stage">
        <article className="overview-hero">
          <span className="micro-label">Pressao do ciclo</span>
          <strong>{pct(summary.credit_usage_pct)}</strong>
          <p>
            O limite fechou com {money(summary.credit_limit_available)} livres sobre {money(summary.credit_limit_total)}.
            A leitura principal deste ciclo combina pressao no limite, concentracao por raiz e peso das proximas faturas.
          </p>
          <div className="overview-pill-row">
            <span className="hero-pill">Fatura {money(summary.total_bill)}</span>
            <span className="hero-pill">Minimo {money(summary.minimum_payment)}</span>
            <span className="hero-pill">Proximas {money(summary.future_bills_total)}</span>
          </div>
          <div className="overview-actions">
            <button type="button" className="overview-action-primary" onClick={() => activateView("carteira", cardHomeRef)}>
              Abrir carteira
            </button>
            <button type="button" className="overview-action-secondary" onClick={() => activateView("insights", rootMapRef)}>
              Ver mapa por raiz
            </button>
            <button type="button" className="overview-action-secondary" onClick={() => activateView("explorer", explorerRef)}>
              Ir para explorer
            </button>
          </div>
        </article>

        <div className="overview-metric-grid">
          {overviewMetrics.map((item) => (
            <OverviewMetricCard
              key={item.label}
              label={item.label}
              value={item.value}
              note={item.note}
              tone={item.tone}
            />
          ))}
        </div>
      </section>

      <section className="home-stack section-reveal">
        <section className="module-card home-snapshot">
          <div className="module-header split">
            <div>
              <span className="micro-label">Carteira</span>
              <h2>Panorama rapido</h2>
            </div>
            <button type="button" className="quick-action" onClick={() => activateView("carteira", cardHomeRef)}>
              Abrir carteira
            </button>
          </div>
          <div className="home-snapshot-grid">
            {cardOptions.slice(0, 4).map((card) => (
              <button
                key={`home-${card.label}`}
                type="button"
                className="home-mini-card"
                onClick={() => handleCardSelect(card.label)}
              >
                <span className="micro-label">{card.label}</span>
                <strong>{money(card.official_total)}</strong>
                <small>{card.holder}</small>
              </button>
            ))}
          </div>
        </section>

        <section className="finance-summary-grid section-reveal">
          <SummaryCard
            label="Total da fatura"
            value={money(summary.total_bill)}
            note={`${shortCount(summary.transaction_count)} lancamentos`}
            tone="neutral"
          />
          <SummaryCard
            label="Parcelados no ciclo"
            value={money(summary.installments_current_total)}
            note={`${shortCount(installmentsCount)} linhas com tag de parcela`}
            tone="warning"
          />
          <SummaryCard
            label="Recorrentes observados"
            value={money(summary.recurring_observed_total)}
            note="Assinaturas, planos e software"
            tone="danger"
          />
          <SummaryCard
            label="Duplicidades provaveis"
            value={money(summary.possible_direct_duplicate_total)}
            note="ChatGPT e NordVPN fora da Apple"
            tone="info"
          />
        </section>

        <section className="module-card highlight-band section-reveal">
          <div className="module-header split">
            <div>
              <span className="micro-label">Leitura executiva</span>
              <h2>Resumo rapido do ciclo</h2>
            </div>
            <button type="button" className="quick-action" onClick={() => activateView("insights", rootMapRef)}>
              Abrir insights
            </button>
          </div>
          <div className="hero-grid">
            <InsightCard
              label="Categoria dominante"
              value={topCategory ? `${topCategory.category}` : "-"}
              note={topCategory ? `${money(topCategory.total)} no ciclo` : "Sem dados"}
              tone="warning"
            />
            <InsightCard
              label="Maior estabelecimento"
              value={topMerchant ? `${topMerchant.merchant}` : "-"}
              note={topMerchant ? `${money(topMerchant.total)} em ${topMerchant.root}` : "Sem dados"}
              tone="info"
            />
            <InsightCard
              label="Reducao Apple mapeada"
              value={money(summary.cancelled_apple_total)}
              note={`Projecao simples: ${money(summary.projected_without_cancelled_apple)}`}
              tone="success"
            />
            <InsightCard
              label="Raiz mais pesada"
              value={topRoot ? `${topRoot.root}` : "-"}
              note={topRoot ? `${pct(topRoot.sharePct)} da fatura` : "Sem dados"}
              tone="danger"
            />
          </div>
        </section>
      </section>
    </>
  );
}
