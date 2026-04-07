export default function FiltersPanel({
  mobileFiltersOpen,
  setMobileFiltersOpen,
  search,
  onSearchChange,
  categoryFilter,
  setCategoryFilter,
  categoryOptions,
  rootFilter,
  setRootFilter,
  rootOptions,
  installmentFilter,
  setInstallmentFilter,
  activeFilters,
  clearAllFilters,
  filteredTotal,
  filteredTransactionsCount,
  dataset,
  selectedCard,
  shellView,
  money,
  shortCount,
}) {
  const cardLabel = selectedCard === "todos" ? "Carteira completa" : `Cartao ${selectedCard}`;
  const modeLabel = shellView === "insights" ? "Mapa e insights" : "Explorer detalhado";

  return (
    <aside className={`finance-sidebar module-card ${mobileFiltersOpen ? "mobile-open" : ""}`}>
      <div className="module-header">
        <div>
          <span className="micro-label">Controle do recorte</span>
          <h2>Filtros da fatura</h2>
        </div>
        <button type="button" className="sidebar-close" onClick={() => setMobileFiltersOpen(false)}>
          Fechar
        </button>
      </div>

      <div className="sidebar-shell">
        <section className="sidebar-identity">
          <span className="micro-label">Conta ativa</span>
          <strong>{cardLabel}</strong>
          <small>{modeLabel} · {shortCount(filteredTransactionsCount)} itens no recorte atual</small>
        </section>

        <section className="sidebar-actions-row">
          <button type="button" className="sidebar-secondary-action" onClick={clearAllFilters}>
            Limpar recorte
          </button>
          <button type="button" className="sidebar-primary-action" onClick={() => setMobileFiltersOpen(false)}>
            Aplicar agora
          </button>
        </section>

        <div className="finance-sidebar-stack">
          <label className="input-group search-group">
            <span>Buscar</span>
            <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="iFood, Uber, Apple, farmacia..." />
          </label>

          <label className="input-group">
            <span>Categoria</span>
            <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              <option value="todos">Todas</option>
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Raiz</span>
            <select value={rootFilter} onChange={(event) => setRootFilter(event.target.value)}>
              <option value="todos">Todas</option>
              {rootOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>

          <label className="input-group">
            <span>Parcelamento</span>
            <select value={installmentFilter} onChange={(event) => setInstallmentFilter(event.target.value)}>
              <option value="todos">Todos</option>
              <option value="sim">Somente parcelados</option>
              <option value="nao">Somente a vista</option>
            </select>
          </label>

          <div className="filter-chip-stack">
            {activeFilters.length ? (
              activeFilters.map((filter) => (
                <button key={filter.label} type="button" className="filter-chip" onClick={filter.clear}>
                  {filter.label}
                </button>
              ))
            ) : (
              <span className="row-sub">Sem filtros ativos. A visao esta no ciclo completo.</span>
            )}
          </div>

          <section className="sidebar-callout">
            <span className="micro-label">Leitura filtrada</span>
            <strong>{money(filteredTotal)}</strong>
            <small>{shortCount(filteredTransactionsCount)} lancamentos depois dos filtros</small>
          </section>

          {dataset.export_links ? (
            <section className="sidebar-export-panel">
              <div className="sidebar-export-header">
                <span className="micro-label">Saidas rapidas</span>
                <small>Leve o recorte para planilha quando precisar.</small>
              </div>
              <div className="sidebar-links">
                <a href={dataset.export_links.groups_csv}>CSV grupos</a>
                <a href={dataset.export_links.merchants_csv}>CSV estabelecimentos</a>
                <a href={dataset.export_links.transactions_csv}>CSV lancamentos</a>
                <a href={dataset.export_links.installments_csv}>CSV parcelados</a>
              </div>
            </section>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
