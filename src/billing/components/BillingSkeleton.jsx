export default function BillingSkeleton() {
  return (
    <main className="saas-shell finance-shell">
      <section className="loading-box billing-skeleton">
        <span className="micro-label">Finance Ops</span>
        <h1>Montando o painel da fatura...</h1>
        <p>Carregando raizes, categorias, estabelecimentos e filtros do ciclo.</p>
        <div className="skeleton-grid">
          <span className="skeleton-block skeleton-hero" />
          <span className="skeleton-block" />
          <span className="skeleton-block" />
          <span className="skeleton-block" />
        </div>
      </section>
    </main>
  );
}
