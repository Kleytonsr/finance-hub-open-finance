import { PluggyConnect } from "react-pluggy-connect";

function formatDateTime(value) {
  if (!value) return "Ainda nao sincronizado";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Ainda nao sincronizado";

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

export default function OpenFinancePanel({
  sourceMode,
  connection,
  syncState,
  connectTokenState,
  onOpenConnect,
  onOpenReconnect,
  onRefresh,
  onDisconnect,
  onUseDemo,
  onWidgetSuccess,
  onWidgetClose,
  onWidgetError,
}) {
  const isConnected = Boolean(connection?.itemId);
  const isSyncing = syncState.phase === "syncing";
  const isTokenLoading = connectTokenState.phase === "loading";
  const shouldRenderWidget = Boolean(connectTokenState.token);

  return (
    <section className="module-card open-finance-panel section-reveal">
      <div className="module-header split">
        <div>
          <span className="micro-label">Open Finance beta</span>
          <h2>Conecte sua conta real</h2>
        </div>
        <div className="open-finance-pills">
          <span className={`open-finance-pill ${sourceMode === "pluggy" ? "is-live" : ""}`}>
            {sourceMode === "pluggy" ? "Modo conectado" : "Modo demo"}
          </span>
          {isConnected ? <span className="open-finance-pill">{connection.connectorName}</span> : null}
        </div>
      </div>

      <div className="open-finance-grid">
        <div className="open-finance-copy">
          <strong>Use sua propria conta sem expor credenciais no frontend.</strong>
          <p>
            A conexao usa Pluggy + Open Finance. O token do widget sai de uma funcao segura no backend, e o painel troca
            automaticamente do modo demo para os dados da conta conectada.
          </p>
          <div className="open-finance-status">
            <div className="open-finance-status-card">
              <span className="micro-label">Item</span>
              <strong>{isConnected ? connection.itemId.slice(0, 8) : "Nao conectado"}</strong>
              <small>{isConnected ? `${connection.status} · ${connection.executionStatus}` : "Conecte uma instituicao para iniciar."}</small>
            </div>
            <div className="open-finance-status-card">
              <span className="micro-label">Ultima sync</span>
              <strong>{formatDateTime(connection?.lastSyncAt || connection?.updatedAt)}</strong>
              <small>{syncState.phase === "error" ? syncState.error : "O recorte ao vivo substitui o dataset demo."}</small>
            </div>
          </div>
        </div>

        <div className="open-finance-actions-panel">
          {!isConnected ? (
            <button type="button" className="open-finance-primary" onClick={onOpenConnect} disabled={isTokenLoading}>
              {isTokenLoading ? "Preparando conexao..." : "Conectar via Pluggy"}
            </button>
          ) : (
            <>
              <button type="button" className="open-finance-primary" onClick={onRefresh} disabled={isSyncing}>
                {isSyncing ? "Atualizando..." : "Atualizar agora"}
              </button>
              <button type="button" className="open-finance-secondary" onClick={onOpenReconnect} disabled={isTokenLoading}>
                Atualizar credenciais
              </button>
              <button type="button" className="open-finance-secondary" onClick={onDisconnect}>
                Desconectar item
              </button>
              {sourceMode === "pluggy" ? (
                <button type="button" className="open-finance-ghost" onClick={onUseDemo}>
                  Voltar para demo
                </button>
              ) : null}
            </>
          )}
          {syncState.phase === "error" ? <p className="open-finance-error">{syncState.error}</p> : null}
          {!isConnected ? (
            <p className="open-finance-note">MVP local-first: sem banco de dados proprio por enquanto. O item fica salvo no navegador para voce testar com sua conta.</p>
          ) : (
            <p className="open-finance-note">Se o banco pedir nova autorizacao, use “Atualizar credenciais”. Para dados mais frescos, rode “Atualizar agora”.</p>
          )}
        </div>
      </div>

      {shouldRenderWidget ? (
        <PluggyConnect
          connectToken={connectTokenState.token}
          updateItem={connectTokenState.updateItem || undefined}
          onSuccess={onWidgetSuccess}
          onClose={onWidgetClose}
          onError={(error) => onWidgetError(error?.message || "Falha ao abrir o widget do Pluggy.")}
          onLoadError={(error) => onWidgetError(error.message || "Falha ao carregar o widget do Pluggy.")}
          includeSandbox={false}
          theme="light"
          language="pt"
        />
      ) : null}
    </section>
  );
}
