import { useDeferredValue, useEffect, useMemo, useState } from "react";

const DATA_ROOT = "/meta-ads/2026-03-31";

function money(value) {
  return `R$ ${Number(value || 0).toFixed(2)}`;
}

function pct(value) {
  return `${Number(value || 0).toFixed(2)}%`;
}

function badgeTone(status) {
  if (["verde", "melhorando"].includes(status)) return "success";
  if (["amarelo", "estavel", "alto"].includes(status)) return "warning";
  if (["vermelho", "piorando", "critico"].includes(status)) return "danger";
  if (["medio"].includes(status)) return "info";
  return "neutral";
}

function SummaryCard({ label, value, note, tone = "neutral", help }) {
  return (
    <article className={`summary-card tone-${tone}`}>
      <div className="summary-top">
        <span className="metric-label">{label}</span>
        {help ? <span className="help-pill" title={help}>?</span> : null}
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </article>
  );
}

function AlertPill({ alert }) {
  return (
    <button className="alert-pill" type="button">
      <span className={`status-dot dot-${badgeTone(alert.priority)}`} />
      <span className="alert-pill-copy">
        <strong>{alert.entity_name}</strong>
        <small>{alert.action}</small>
      </span>
      <span className={`status-badge status-${badgeTone(alert.priority)}`}>{alert.priority}</span>
    </button>
  );
}

function Drawer({ row, onClose }) {
  if (!row) return null;

  const checklists = [];

  if (row.action.includes("reduzir")) {
    checklists.push("Conferir quais anúncios concentram o gasto sem retorno.");
    checklists.push("Verificar se houve mudança recente de público, verba ou criativo.");
    checklists.push("Reduzir verba antes de desligar a campanha inteira.");
  }
  if (row.action.includes("trocar")) {
    checklists.push("Substituir criativo de abertura e revisar headline.");
    checklists.push("Checar se a promessa do anúncio conversa com o público certo.");
  }
  if (row.action.includes("escalar")) {
    checklists.push("Aumentar verba gradualmente e manter o criativo vencedor isolado.");
    checklists.push("Duplicar vencedor apenas se houver hipótese nova de variação.");
  }
  if (row.action.includes("manter")) {
    checklists.push("Acompanhar por mais alguns dias e esperar mais histórico.");
  }
  if (checklists.length === 0) {
    checklists.push("Revisar manualmente e comparar com a média da conta.");
  }

  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer-panel" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <span className="micro-label">{row.entity_type}</span>
            <h2>{row.entity_name}</h2>
          </div>
          <button className="drawer-close" type="button" onClick={onClose}>
            Fechar
          </button>
        </div>

        <div className="drawer-body">
          <div className="drawer-section">
            <span className="micro-label">Leitura rápida</span>
            <div className="drawer-kpis">
              <div><strong>{row.leads}</strong><span>Leads</span></div>
              <div><strong>{row.cpa == null ? "N/D" : money(row.cpa)}</strong><span>CPA</span></div>
              <div><strong>{pct(row.ctr)}</strong><span>CTR</span></div>
              <div><strong>{money(row.spend)}</strong><span>Gasto</span></div>
            </div>
          </div>

          <div className="drawer-section">
            <span className="micro-label">Diagnóstico</span>
            <div className="drawer-note">
              <span className={`status-badge status-${badgeTone(row.status)}`}>{row.status}</span>
              <span className={`status-badge status-${badgeTone(row.trend)}`}>{row.trend}</span>
            </div>
            <p>{row.alert}</p>
            <p><strong>Ação sugerida:</strong> {row.action}</p>
          </div>

          <div className="drawer-section">
            <span className="micro-label">Checklist operacional</span>
            <ul className="drawer-list">
              {checklists.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="drawer-section">
            <span className="micro-label">Ajuda</span>
            <p>
              CTR mede atração do criativo. CPA mede custo por lead. Quando CTR cai e CPA sobe, normalmente é
              sinal de criativo fraco ou fadiga. Quando CTR está bom e o CPA ruim, costuma ser oferta,
              formulário ou público.
            </p>
          </div>
        </div>
      </aside>
    </div>
  );
}

export default function MetaOpsDashboard() {
  const [dataset, setDataset] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [actionFilter, setActionFilter] = useState("todos");
  const [trendFilter, setTrendFilter] = useState("todos");
  const [view, setView] = useState("campaign");
  const [selectedRow, setSelectedRow] = useState(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function load() {
      const [summary, scorecard, comparison, alerts] = await Promise.all([
        fetch(`${DATA_ROOT}/summary.json`).then((res) => res.json()),
        fetch(`${DATA_ROOT}/scorecard.json`).then((res) => res.json()),
        fetch(`${DATA_ROOT}/period_comparison.json`).then((res) => res.json()),
        fetch(`${DATA_ROOT}/daily_alerts.json`).then((res) => res.json()),
      ]);

      if (!active) return;
      setDataset({ summary, scorecard, comparison, alerts });
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const filteredRows = useMemo(() => {
    if (!dataset) return [];

    const trendByCampaign = new Map(
      (dataset.comparison.rows || []).map((item) => [item.campaign_id || item.campaign_name, item.trend?.status || "sem_dado"]),
    );

    return (dataset.scorecard.rows || [])
      .filter((row) => row.entity_type === view)
      .map((row) => ({
        ...row,
        trend:
          trendByCampaign.get(row.entity_id) ||
          trendByCampaign.get(row.campaign_name) ||
          "sem_dado",
      }))
      .filter((row) => {
        const searchBase = `${row.entity_name} ${row.campaign_name}`.toLowerCase();
        const matchesSearch = !deferredSearch || searchBase.includes(deferredSearch.toLowerCase());
        const matchesStatus = statusFilter === "todos" || row.status === statusFilter;
        const matchesAction = actionFilter === "todos" || row.action.toLowerCase().includes(actionFilter);
        const matchesTrend = trendFilter === "todos" || row.trend === trendFilter;
        return matchesSearch && matchesStatus && matchesAction && matchesTrend;
      })
      .sort((a, b) => b.spend - a.spend);
  }, [dataset, deferredSearch, statusFilter, actionFilter, trendFilter, view]);

  if (!dataset) {
    return (
      <main className="saas-shell">
        <section className="loading-box">
          <span className="micro-label">Meta Ops</span>
          <h1>Carregando workspace da Escodelar...</h1>
          <p>Montando score, alertas e tendência da conta principal.</p>
        </section>
      </main>
    );
  }

  const summary = dataset.summary;
  const alerts = dataset.alerts.alerts || [];
  const comparisonRows = (dataset.comparison.rows || []).slice().sort((a, b) => (b.current?.spend || 0) - (a.current?.spend || 0));
  const filtered = filteredRows;

  const criticalCount = alerts.filter((item) => item.priority === "critico").length;
  const highCount = alerts.filter((item) => item.priority === "alto").length;
  const scalingCount = (dataset.scorecard.rows || []).filter(
    (item) => item.entity_type === "campaign" && item.action.includes("escalar"),
  ).length;
  const worseningCount = comparisonRows.filter((item) => item.trend?.status === "piorando").length;

  const primaryAlerts = alerts.filter((item) => item.priority === "critico" || item.priority === "alto").slice(0, 6);

  return (
    <main className="saas-shell">
      <header className="topbar">
        <div>
          <span className="micro-label">Internal Product</span>
          <h1>Meta Ops Workspace</h1>
        </div>
        <div className="topbar-meta">
          <span>Conta: Escodelar Anúncios</span>
          <span>Atualizado: {summary.generated_at.slice(0, 10)}</span>
        </div>
      </header>

      <section className="priority-ribbon">
        <div className="ribbon-card ribbon-primary">
          <span className="micro-label">Conta principal</span>
          <strong>{money(summary.totals.spend)}</strong>
          <small>{summary.totals.results} leads no consolidado</small>
        </div>
        <div className="ribbon-card-grid">
          {primaryAlerts.map((alert) => (
            <AlertPill key={`${alert.type}-${alert.entity_name}-${alert.priority}`} alert={alert} />
          ))}
        </div>
      </section>

      <section className="summary-grid">
        <SummaryCard label="Alertas críticos" value={criticalCount} note={`${highCount} alertas altos ativos`} tone="danger" help="Campanhas ou estruturas que exigem ação imediata." />
        <SummaryCard label="Escalas sugeridas" value={scalingCount} note={`${worseningCount} campanhas piorando`} tone="success" help="Volume com eficiência suficiente para considerar aumento gradual de verba." />
        <SummaryCard label="CPA médio" value={money(summary.totals.cpa)} note="Meta sugerida: R$ 18,00" tone="warning" help="Custo médio por lead. Use isso como norte da conta." />
        <SummaryCard label="CTR médio" value={pct(summary.totals.ctr)} note={`CPC médio ${money(summary.totals.cpc)}`} tone="neutral" help="Taxa de clique e custo por clique do consolidado." />
      </section>

      <section className="module-card account-health">
        <div className="module-header">
          <div>
            <span className="micro-label">Comparativo semanal</span>
            <h2>Saúde da conta</h2>
          </div>
        </div>
        <div className="compare-grid refined-compare">
          <div className="compare-card">
            <span>{dataset.comparison.label_current}</span>
            <strong>{money(dataset.comparison.summary_current.cpa)}</strong>
            <small>CPA atual</small>
          </div>
          <div className="compare-card">
            <span>{dataset.comparison.label_previous}</span>
            <strong>{money(dataset.comparison.summary_previous.cpa)}</strong>
            <small>CPA anterior</small>
          </div>
          <div className="compare-notes">
            {comparisonRows.slice(0, 3).map((row) => (
              <div key={row.campaign_id || row.campaign_name} className="compare-line">
                <div className="compare-line-top">
                  <strong>{row.campaign_name}</strong>
                  <span className={`status-badge status-${badgeTone(row.trend?.status)}`}>{row.trend?.status}</span>
                </div>
                <span>{row.trend?.reason}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="module-card">
        <div className="module-header split">
          <div>
            <span className="micro-label">Explorer</span>
            <h2>Monitoramento por camada</h2>
          </div>
          <div className="tabs">
            <button className={view === "campaign" ? "active" : ""} onClick={() => setView("campaign")}>
              Campanhas
            </button>
            <button className={view === "adset" ? "active" : ""} onClick={() => setView("adset")}>
              Conjuntos
            </button>
            <button className={view === "ad" ? "active" : ""} onClick={() => setView("ad")}>
              Anúncios
            </button>
          </div>
        </div>

        <div className="filters-row">
          <label className="input-group search-group">
            <span>Buscar</span>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Studio, Jardins, Corretores..." />
          </label>
          <label className="input-group">
            <span>Status</span>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="todos">Todos</option>
              <option value="vermelho">Vermelho</option>
              <option value="amarelo">Amarelo</option>
              <option value="verde">Verde</option>
            </select>
          </label>
          <label className="input-group">
            <span>Ação</span>
            <select value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="todos">Todas</option>
              <option value="escalar">Escalar</option>
              <option value="reduzir">Reduzir</option>
              <option value="trocar">Trocar criativo</option>
              <option value="manter">Manter</option>
            </select>
          </label>
          <label className="input-group">
            <span>Tendência</span>
            <select value={trendFilter} onChange={(e) => setTrendFilter(e.target.value)}>
              <option value="todos">Todas</option>
              <option value="piorando">Piorando</option>
              <option value="melhorando">Melhorando</option>
              <option value="estavel">Estável</option>
              <option value="novo">Nova</option>
            </select>
          </label>
        </div>

        <div className="instruction-banner">
          Clique em qualquer linha para abrir o detalhe com orientação, hipótese de problema e checklist de ação.
        </div>

        <div className="table-frame">
          <table className="workspace-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Status</th>
                <th>Tendência</th>
                <th>Leads</th>
                <th>CPA</th>
                <th>CTR</th>
                <th>Gasto</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={`${row.entity_type}-${row.entity_id}`} className="clickable-row" onClick={() => setSelectedRow(row)}>
                  <td>
                    <strong>{row.entity_name}</strong>
                    <span className="row-sub">{row.alert}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${badgeTone(row.status)}`}>{row.status}</span>
                  </td>
                  <td>
                    <span className={`status-badge status-${badgeTone(row.trend)}`}>{row.trend}</span>
                  </td>
                  <td>{row.leads}</td>
                  <td>{row.cpa == null ? "indisponível" : money(row.cpa)}</td>
                  <td>{pct(row.ctr)}</td>
                  <td>{money(row.spend)}</td>
                  <td>{row.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty-box">Nenhum item encontrado com esses filtros.</div>}
        </div>
      </section>

      <Drawer row={selectedRow} onClose={() => setSelectedRow(null)} />
    </main>
  );
}
