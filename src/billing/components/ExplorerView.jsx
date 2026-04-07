import { ContextBadge } from "./MetricCards";
import SortHeader from "./SortHeader";

export default function ExplorerView({
  sectionRef,
  view,
  handleViewChange,
  sortConfig,
  handleSort,
  viewRows,
  openRoot,
  openMerchant,
  openTransaction,
  money,
  pct,
  shortCount,
  cardBadgeTheme,
  channelBadgeTheme,
}) {
  return (
    <section ref={sectionRef} className="module-card section-reveal explorer-screen">
      <div className="module-header split">
        <div>
          <span className="micro-label">Explorer</span>
          <h2>Exploracao detalhada</h2>
        </div>
        <div className="tabs">
          <button className={view === "roots" ? "active" : ""} onClick={() => handleViewChange("roots")}>
            Raizes
          </button>
          <button className={view === "merchants" ? "active" : ""} onClick={() => handleViewChange("merchants")}>
            Estabelecimentos
          </button>
          <button className={view === "transactions" ? "active" : ""} onClick={() => handleViewChange("transactions")}>
            Lancamentos
          </button>
        </div>
      </div>

      <div className="table-frame">
        <table className="workspace-table finance-table">
          <thead>
            {view === "roots" ? (
              <tr>
                <th><SortHeader label="Raiz" column="root" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th>Mix de categorias</th>
                <th><SortHeader label="Total" column="total" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="% da fatura" column="sharePct" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Lancamentos" column="count" sortConfig={sortConfig} onSort={handleSort} /></th>
              </tr>
            ) : view === "merchants" ? (
              <tr>
                <th><SortHeader label="Estabelecimento" column="merchant" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Raiz" column="root" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Categoria" column="category" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Total" column="total" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="% da fatura" column="sharePct" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Lancamentos" column="count" sortConfig={sortConfig} onSort={handleSort} /></th>
              </tr>
            ) : (
              <tr>
                <th><SortHeader label="Data" column="date" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Estabelecimento" column="merchant" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Raiz" column="group" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Cartao" column="card_last4" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Categoria" column="category" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Canal" column="channel" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Valor" column="amount" sortConfig={sortConfig} onSort={handleSort} /></th>
                <th><SortHeader label="Parcela" column="installment_tag" sortConfig={sortConfig} onSort={handleSort} /></th>
              </tr>
            )}
          </thead>
          <tbody>
            {view === "roots"
              ? viewRows.map((row) => (
                  <tr key={row.key} className="clickable-row" onClick={() => openRoot(row)}>
                    <td>
                      <strong>{row.root}</strong>
                      <span className="row-sub">{row.subgroups.map((item) => item.name).join(" · ")}</span>
                    </td>
                    <td>{row.categories.map((item) => `${item.name} ${pct(item.sharePct)}`).join(" · ")}</td>
                    <td>{money(row.total)}</td>
                    <td>{pct(row.sharePct)}</td>
                    <td>{shortCount(row.count)}</td>
                  </tr>
                ))
              : view === "merchants"
                ? viewRows.map((row) => (
                    <tr key={row.key} className="clickable-row" onClick={() => openMerchant(row)}>
                      <td>
                        <strong>{row.merchant}</strong>
                        <span className="row-sub">{row.samples.join(" · ")}</span>
                      </td>
                      <td>{row.root}</td>
                      <td>{row.category}</td>
                      <td>{money(row.total)}</td>
                      <td>{pct(row.sharePct)}</td>
                      <td>{shortCount(row.count)}</td>
                    </tr>
                  ))
                : viewRows.map((row) => (
                    <tr key={row.id} className="clickable-row" onClick={() => openTransaction(row)}>
                      <td>{row.date}</td>
                      <td>
                        <strong>{row.merchant}</strong>
                        <span className="row-sub">{row.description}</span>
                      </td>
                      <td>{row.group}</td>
                      <td>
                        <div className="table-badge-stack">
                          <ContextBadge theme={cardBadgeTheme(row.card_last4)}>{row.card_last4}</ContextBadge>
                          <span className="row-sub">{row.card_holder}</span>
                        </div>
                      </td>
                      <td>{row.category}</td>
                      <td>
                        <ContextBadge theme={channelBadgeTheme(row.channel)}>{row.channel}</ContextBadge>
                      </td>
                      <td>{money(row.amount)}</td>
                      <td>{row.installment_tag || "A vista"}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
        {!viewRows.length ? <div className="empty-box">Nenhum item encontrado com os filtros atuais.</div> : null}
      </div>

      <div className="mobile-explorer-list">
        {view === "roots"
          ? viewRows.map((row) => (
              <button key={row.key} type="button" className="mobile-record-card" onClick={() => openRoot(row)}>
                <div className="mobile-record-top">
                  <strong>{row.root}</strong>
                  <span>{money(row.total)}</span>
                </div>
                <p>{row.categories.map((item) => `${item.name} ${pct(item.sharePct)}`).join(" · ")}</p>
                <small>{shortCount(row.count)} lancamentos · {pct(row.sharePct)} da fatura</small>
              </button>
            ))
          : view === "merchants"
            ? viewRows.map((row) => (
                <button key={row.key} type="button" className="mobile-record-card" onClick={() => openMerchant(row)}>
                  <div className="mobile-record-top">
                    <strong>{row.merchant}</strong>
                    <span>{money(row.total)}</span>
                  </div>
                  <p>{row.root} · {row.category}</p>
                  <small>{shortCount(row.count)} lancamentos · {pct(row.sharePct)} da fatura</small>
                </button>
              ))
            : viewRows.map((row) => (
                <button key={row.id} type="button" className="mobile-record-card" onClick={() => openTransaction(row)}>
                  <div className="mobile-record-top">
                    <strong>{row.merchant}</strong>
                    <span>{money(row.amount)}</span>
                  </div>
                  <p>{row.date} · {row.group} · {row.category}</p>
                  <div className="mobile-record-badges">
                    <ContextBadge theme={cardBadgeTheme(row.card_last4)}>{row.card_last4}</ContextBadge>
                    <ContextBadge theme={channelBadgeTheme(row.channel)}>{row.channel}</ContextBadge>
                    <ContextBadge>{row.installment_tag || "A vista"}</ContextBadge>
                  </div>
                </button>
              ))}
      </div>
    </section>
  );
}
