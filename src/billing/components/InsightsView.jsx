import { InsightCard, SummaryCard } from "./MetricCards";
import RankList from "./RankList";
import RootCard from "./RootCard";

export default function InsightsView({
  summary,
  installmentsCount,
  topCategory,
  topMerchant,
  topRoot,
  rootRows,
  rootDetails,
  expandedRoot,
  openRoot,
  toggleRoot,
  openTransaction,
  showRootTransactions,
  setRootFilter,
  categoryRows,
  dayRows,
  money,
  pct,
  shortCount,
  summaryBandRef,
  rootMapRef,
}) {
  return (
    <section className="finance-main">
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

      <section ref={summaryBandRef} className="module-card highlight-band section-reveal">
        <div className="module-header split">
          <div>
            <span className="micro-label">Leitura executiva</span>
            <h2>Resumo rapido do ciclo</h2>
          </div>
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

      <section ref={rootMapRef} className="module-card section-reveal">
        <div className="module-header split">
          <div>
            <span className="micro-label">Mapa por raiz</span>
            <h2>Onde a fatura se concentra</h2>
          </div>
        </div>
        <div className="root-grid">
          {rootRows.slice(0, 8).map((row) => (
            <RootCard
              key={row.key}
              row={row}
              details={rootDetails[row.root] || { transactions: [], subgroups: [], channels: [] }}
              expanded={expandedRoot === row.root}
              onOpen={openRoot}
              onApplyFilter={(root) => setRootFilter(root)}
              onToggle={toggleRoot}
              onOpenTransaction={openTransaction}
              onShowTransactions={showRootTransactions}
            />
          ))}
        </div>
      </section>

      <section className="finance-panels-grid section-reveal">
        <RankList
          title="Categorias"
          subtitle="Leitura por tipo de gasto"
          rows={categoryRows.slice(0, 8)}
          rowLabel={(row) => row.category}
          rowValue={(row) => `${money(row.total)} · ${pct(row.sharePct)}`}
          rowNote={(row) => `${shortCount(row.count)} lancamentos`}
        />

        <RankList
          title="Dias mais pesados"
          subtitle="Concentracao temporal"
          rows={dayRows}
          rowLabel={(row) => row.date}
          rowValue={(row) => `${money(row.total)} · ${pct(row.sharePct)}`}
          rowNote={(row) => `${shortCount(row.count)} lancamentos`}
        />
      </section>
    </section>
  );
}
