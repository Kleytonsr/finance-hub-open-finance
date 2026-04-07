import { cardTheme, money, pct, shortCount } from "../utils";
import TabPanel from "./TabPanel";

export default function WalletView({
  sectionRef,
  cardOptions,
  selectedCard,
  summary,
  activeCardData,
  activeCardSummaryNote,
  cardPanelTab,
  setCardPanelTab,
  handleCardSelect,
  activateView,
  cardHomeRef,
  rootMapRef,
  explorerRef,
  cardScopedMerchantRows,
  cardScopedInstallments,
  cardScopedSubscriptions,
  activeCardAlerts,
  openTransaction,
  handleViewChange,
  setRootFilter,
}) {
  return (
    <>
      <section className="section-intro section-reveal">
        <div>
          <span className="micro-label">Carteira</span>
          <h2>Home por cartao</h2>
        </div>
        <p>
          Entrada principal do produto para navegar por responsavel, limite, parcelas futuras e sinais de atencao.
        </p>
      </section>

      <section ref={sectionRef} className="bank-home section-reveal">
        <div className="bank-card-rack">
          <button
            type="button"
            className={`bank-card bank-card-overview ${selectedCard === "todos" ? "active" : ""}`}
            onClick={() => handleCardSelect("todos")}
          >
            <div className="bank-card-face bank-card-face-overview">
              <div className="bank-card-network">
                <span className="bank-network-mark">
                  <span className="network-circle network-left" />
                  <span className="network-circle network-right" />
                </span>
                <span className="bank-card-tier">wallet</span>
              </div>

              <div className="bank-card-chip-row">
                <span className="bank-card-chip" />
                <span className="bank-card-issuer">itau</span>
              </div>

              <div className="bank-card-face-footer">
                <div>
                  <span className="bank-card-number">Carteira completa</span>
                  <small>Todos os responsaveis</small>
                </div>
                <span className="bank-card-vertical-mark">black</span>
              </div>
            </div>

            <div className="bank-card-data">
              <strong>{money(summary.total_bill)}</strong>
              <p>Todos os cartões · {shortCount(summary.transaction_count)} lancamentos</p>
            </div>
            <div className="bank-card-bottom">
              <span>Limite {pct(summary.credit_usage_pct)}</span>
              <span>Proximas {money(summary.future_bills_total)}</span>
            </div>
          </button>

          {cardOptions.map((card) => (
            <button
              key={card.label}
              type="button"
              className={`bank-card ${cardTheme(card.label)} ${selectedCard === card.label ? "active" : ""}`}
              onClick={() => handleCardSelect(card.label)}
            >
              <div className={`bank-card-face ${cardTheme(card.label)}`}>
                <div className="bank-card-network">
                  <span className="bank-network-mark">
                    <span className="network-circle network-left" />
                    <span className="network-circle network-right" />
                  </span>
                  <span className="bank-card-tier">black</span>
                </div>

                <div className="bank-card-chip-row">
                  <span className="bank-card-chip" />
                  <span className="bank-card-issuer">itau</span>
                </div>

                <div className="bank-card-face-footer">
                  <div>
                    <span className="bank-card-number">•••• {card.label}</span>
                    <small>{card.holder}</small>
                  </div>
                  <span className="bank-card-vertical-mark">visa</span>
                </div>
              </div>

              <div className="bank-card-data">
                <strong>{money(card.official_total)}</strong>
                <p>{card.holder}</p>
              </div>
              <div className="bank-card-bottom">
                <span>{shortCount(card.transaction_count)} lancamentos</span>
                <span>Futuras {money(card.future_installments_estimated)}</span>
              </div>
            </button>
          ))}
        </div>

        <aside className="card-focus-panel module-card">
          <div className="module-header split">
            <div>
              <span className="micro-label">Cartao selecionado</span>
              <h2>{activeCardData?.label || "Carteira completa"}</h2>
            </div>
            <div className="tabs">
              <button className={cardPanelTab === "resumo" ? "active" : ""} onClick={() => setCardPanelTab("resumo")}>
                Resumo
              </button>
              <button className={cardPanelTab === "gastos" ? "active" : ""} onClick={() => setCardPanelTab("gastos")}>
                Gastos
              </button>
              <button className={cardPanelTab === "parcelas" ? "active" : ""} onClick={() => setCardPanelTab("parcelas")}>
                Parcelas
              </button>
              <button className={cardPanelTab === "assinaturas" ? "active" : ""} onClick={() => setCardPanelTab("assinaturas")}>
                Assinaturas
              </button>
              <button className={cardPanelTab === "alertas" ? "active" : ""} onClick={() => setCardPanelTab("alertas")}>
                Alertas
              </button>
            </div>
          </div>

          <div className="card-focus-headline">
            <div>
              <span className="micro-label">Responsavel</span>
              <strong>{activeCardData?.holder || "Todos os cartões"}</strong>
              <small>{activeCardSummaryNote}</small>
            </div>
            <div>
              <span className="micro-label">Total do ciclo</span>
              <strong>{money(activeCardData?.official_total || summary.total_bill)}</strong>
              <small>Visao oficial do fechamento para o recorte atual</small>
            </div>
          </div>

          <div className="card-quick-actions">
            <button
              type="button"
              className="quick-action"
              onClick={() => {
                handleViewChange("transactions");
                activateView("explorer", explorerRef);
              }}
            >
              Ver lancamentos
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => {
                setCardPanelTab("parcelas");
                activateView("carteira", cardHomeRef);
              }}
            >
              Ver parcelas
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => {
                setCardPanelTab("gastos");
                activateView("insights", rootMapRef);
              }}
            >
              Ver gastos
            </button>
            <button
              type="button"
              className="quick-action"
              onClick={() => {
                setCardPanelTab("alertas");
                activateView("carteira", cardHomeRef);
              }}
            >
              Ver alertas
            </button>
          </div>

          <TabPanel panelKey="resumo" activeKey={cardPanelTab}>
            <div className="card-focus-grid">
              <div className="focus-metric">
                <span className="micro-label">Lancamentos</span>
                <strong>{shortCount(activeCardData?.transaction_count || 0)}</strong>
              </div>
              <div className="focus-metric">
                <span className="micro-label">Parcelas atuais</span>
                <strong>{money(activeCardData?.current_installments_total || 0)}</strong>
              </div>
              <div className="focus-metric">
                <span className="micro-label">Parcelas futuras</span>
                <strong>{money(activeCardData?.future_installments_estimated || 0)}</strong>
              </div>
              <div className="focus-metric">
                <span className="micro-label">Total detectado</span>
                <strong>{money(activeCardData?.detected_total || 0)}</strong>
              </div>
            </div>
          </TabPanel>

          <TabPanel panelKey="gastos" activeKey={cardPanelTab}>
            <div className="focus-section-stack">
              <div className="focus-list">
                {(activeCardData?.top_roots || []).map((item) => (
                  <button
                    key={`${activeCardData?.label}-${item.name}`}
                    type="button"
                    className="focus-list-row"
                    onClick={() => {
                      setRootFilter(item.name);
                      activateView("insights", rootMapRef);
                    }}
                  >
                    <span>
                      <strong>{item.name}</strong>
                      <small>Raiz mais presente neste cartão</small>
                    </span>
                    <strong>{money(item.total)}</strong>
                  </button>
                ))}
              </div>

              <div className="focus-list">
                {cardScopedMerchantRows.slice(0, 4).map((item) => (
                  <button
                    key={`merchant-${item.key}`}
                    type="button"
                    className="focus-list-row focus-list-rich"
                    onClick={() => {
                      setRootFilter(item.root);
                      handleViewChange("transactions");
                      activateView("explorer", explorerRef);
                    }}
                  >
                    <span>
                      <strong>{item.merchant}</strong>
                      <small>{item.root} · {shortCount(item.count)} lançamentos</small>
                    </span>
                    <strong>{money(item.total)}</strong>
                  </button>
                ))}
              </div>
            </div>
          </TabPanel>

          <TabPanel panelKey="parcelas" activeKey={cardPanelTab}>
            <div className="focus-list">
              {cardScopedInstallments.length ? (
                cardScopedInstallments.map((item) => (
                  <button
                    key={`inst-${item.id}`}
                    type="button"
                    className="focus-list-row focus-list-rich"
                    onClick={() => openTransaction(item)}
                  >
                    <span>
                      <strong>{item.merchant}</strong>
                      <small>{item.installment_tag} · {item.date}</small>
                    </span>
                    <strong>{money(item.amount)}</strong>
                  </button>
                ))
              ) : (
                <div className="empty-box">Nenhuma parcela identificada para esse cartão no recorte atual.</div>
              )}
            </div>
          </TabPanel>

          <TabPanel panelKey="assinaturas" activeKey={cardPanelTab}>
            <div className="focus-list">
              {cardScopedSubscriptions.length ? (
                cardScopedSubscriptions.map((item) => (
                  <button
                    key={`sub-${item.id}`}
                    type="button"
                    className="focus-list-row focus-list-rich"
                    onClick={() => openTransaction(item)}
                  >
                    <span>
                      <strong>{item.merchant}</strong>
                      <small>{item.subgroup} · {item.date}</small>
                    </span>
                    <strong>{money(item.amount)}</strong>
                  </button>
                ))
              ) : (
                <div className="empty-box">Nenhuma assinatura foi identificada para esse cartão no recorte atual.</div>
              )}
            </div>
          </TabPanel>

          <TabPanel panelKey="alertas" activeKey={cardPanelTab}>
            <div className="focus-alert-grid">
              {activeCardAlerts.length ? (
                activeCardAlerts.map((alert) => (
                  <article key={`${alert.title}-${alert.note}`} className={`focus-alert focus-alert-${alert.tone}`}>
                    <span className="micro-label">Alerta</span>
                    <strong>{alert.title}</strong>
                    <p>{alert.note}</p>
                  </article>
                ))
              ) : (
                <div className="empty-box">Nenhum alerta forte apareceu para esse cartão com os filtros atuais.</div>
              )}
            </div>
          </TabPanel>
        </aside>
      </section>
    </>
  );
}
