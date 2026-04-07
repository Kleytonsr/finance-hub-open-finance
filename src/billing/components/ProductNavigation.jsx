export function ProductNavigation({ shellView, activateView, cardHomeRef, summaryBandRef, explorerRef }) {
  return (
    <nav className="product-nav module-card">
      <button type="button" className={`product-nav-pill ${shellView === "home" ? "active" : ""}`} onClick={() => activateView("home")}>
        Inicio
      </button>
      <button type="button" className={`product-nav-pill ${shellView === "carteira" ? "active" : ""}`} onClick={() => activateView("carteira", cardHomeRef)}>
        Carteira
      </button>
      <button type="button" className={`product-nav-pill ${shellView === "insights" ? "active" : ""}`} onClick={() => activateView("insights", summaryBandRef)}>
        Insights
      </button>
      <button type="button" className={`product-nav-pill ${shellView === "explorer" ? "active" : ""}`} onClick={() => activateView("explorer", explorerRef)}>
        Explorer
      </button>
    </nav>
  );
}

export function BottomBankNav({ shellView, activateView, cardHomeRef, rootMapRef, explorerRef }) {
  return (
    <nav className="bottom-bank-nav">
      <button type="button" className={shellView === "home" ? "active" : ""} onClick={() => activateView("home")}>
        <span>Inicio</span>
      </button>
      <button type="button" className={shellView === "carteira" ? "active" : ""} onClick={() => activateView("carteira", cardHomeRef)}>
        <span>Carteira</span>
      </button>
      <button type="button" className={shellView === "insights" ? "active" : ""} onClick={() => activateView("insights", rootMapRef)}>
        <span>Insights</span>
      </button>
      <button type="button" className={shellView === "explorer" ? "active" : ""} onClick={() => activateView("explorer", explorerRef)}>
        <span>Explorer</span>
      </button>
    </nav>
  );
}
