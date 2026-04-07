import { startTransition, useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { aggregateCategories, aggregateDays, aggregateMerchants, aggregateRoots } from "./billing/aggregations";
import BillingSkeleton from "./billing/components/BillingSkeleton";
import DetailDrawer from "./billing/components/DetailDrawer";
import ExplorerView from "./billing/components/ExplorerView";
import FiltersPanel from "./billing/components/FiltersPanel";
import HomeView from "./billing/components/HomeView";
import InsightsView from "./billing/components/InsightsView";
import OpenFinancePanel from "./billing/components/OpenFinancePanel";
import { BottomBankNav, ProductNavigation } from "./billing/components/ProductNavigation";
import ShellStatusBar from "./billing/components/ShellStatusBar";
import WalletView from "./billing/components/WalletView";
import normalizePluggyDataset from "./billing/live/normalizePluggyDataset";
import { cardBadgeTheme, channelBadgeTheme, money, pct, shortCount, sortRows } from "./billing/utils";

const DATA_URL = "/billing/itau-2026-04.json";
const CONNECTION_STORAGE_KEY = "financehub.pluggy.connection";
const CLIENT_USER_STORAGE_KEY = "financehub.pluggy.client-user";
const FUNCTIONS_UNAVAILABLE_MESSAGE = "Este deploy esta sem as funcoes do Netlify. Para usar Open Finance, publique pelo repositorio no Netlify com netlify/functions e as variaveis PLUGGY_CLIENT_ID e PLUGGY_CLIENT_SECRET.";
const TRIAL_MODE_MESSAGE = "Sua aplicacao Pluggy ainda esta em trial para conexoes reais. Para validar o MVP agora, use o fluxo Sandbox PF > Fluxo basico.";

function readStoredConnection() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(CONNECTION_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeStoredConnection(connection) {
  if (typeof window === "undefined") return;
  if (!connection) {
    window.localStorage.removeItem(CONNECTION_STORAGE_KEY);
    return;
  }

  window.localStorage.setItem(CONNECTION_STORAGE_KEY, JSON.stringify(connection));
}

function getClientUserId() {
  if (typeof window === "undefined") return "finance-hub-user";

  const current = window.localStorage.getItem(CLIENT_USER_STORAGE_KEY);
  if (current) return current;

  const next = window.crypto?.randomUUID?.() || `finance-hub-${Date.now()}`;
  window.localStorage.setItem(CLIENT_USER_STORAGE_KEY, next);
  return next;
}

async function readApiPayload(response) {
  const text = await response.text();
  const contentType = response.headers.get("content-type") || "";

  if (!text) {
    return { data: null, rawText: "" };
  }

  if (contentType.includes("application/json")) {
    try {
      return { data: JSON.parse(text), rawText: text };
    } catch {
      return { data: null, rawText: text };
    }
  }

  try {
    return { data: JSON.parse(text), rawText: text };
  } catch {
    return { data: null, rawText: text };
  }
}

function getFunctionErrorMessage(response, payload, fallback) {
  if (response.status === 404) {
    return FUNCTIONS_UNAVAILABLE_MESSAGE;
  }

  if (payload?.error) {
    return getFriendlyPluggyMessage(payload.error);
  }

  return fallback;
}

function getFriendlyPluggyMessage(message) {
  if (!message) return message;

  if (message.includes("TRIAL_CLIENT_ITEM_CREATE_NOT_ALLOWED")) {
    return TRIAL_MODE_MESSAGE;
  }

  if (message.toLowerCase().includes("nenhuma conta disponivel para compartilhar")) {
    return "Esse fluxo abriu a autorizacao real do meu.pluggy.ai, mas nao ha contas autorizaveis ali. Para o trial, volte e use Sandbox PF > Fluxo basico.";
  }

  return message;
}

export default function BillingDashboard() {
  const [dataset, setDataset] = useState(null);
  const [sourceMode, setSourceMode] = useState("demo");
  const [connection, setConnection] = useState(() => readStoredConnection());
  const [syncState, setSyncState] = useState({ phase: "idle", error: "" });
  const [connectTokenState, setConnectTokenState] = useState({ phase: "idle", token: "", updateItem: null, error: "" });
  const [search, setSearch] = useState("");
  const [shellView, setShellView] = useState("home");
  const [selectedCard, setSelectedCard] = useState("todos");
  const [cardPanelTab, setCardPanelTab] = useState("resumo");
  const [categoryFilter, setCategoryFilter] = useState("todos");
  const [rootFilter, setRootFilter] = useState("todos");
  const [installmentFilter, setInstallmentFilter] = useState("todos");
  const [view, setView] = useState("roots");
  const [sortConfig, setSortConfig] = useState({ key: "total", direction: "desc" });
  const [selected, setSelected] = useState(null);
  const [expandedRoot, setExpandedRoot] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const cardHomeRef = useRef(null);
  const rootMapRef = useRef(null);
  const summaryBandRef = useRef(null);
  const explorerRef = useRef(null);
  const syncPluggyItemRef = useRef(null);
  const deferredSearch = useDeferredValue(search);

  useEffect(() => {
    let active = true;

    async function load() {
      const response = await fetch(DATA_URL);
      const json = await response.json();
      if (active) {
        setDataset(json);
        setSourceMode("demo");
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    writeStoredConnection(connection);
  }, [connection]);

  const categoryOptions = useMemo(() => {
    if (!dataset) return [];
    return [...new Set(dataset.transactions.map((item) => item.category))].sort();
  }, [dataset]);

  const cardOptions = useMemo(() => dataset?.cards || [], [dataset]);

  const rootOptions = useMemo(() => {
    if (!dataset) return [];
    return [
      ...new Set(
        dataset.transactions
          .filter((item) => selectedCard === "todos" || item.card_last4 === selectedCard)
          .map((item) => item.group),
      ),
    ].sort();
  }, [dataset, selectedCard]);

  const selectedCardTransactions = useMemo(() => {
    if (!dataset) return [];
    if (selectedCard === "todos") return dataset.transactions;
    return dataset.transactions.filter((item) => item.card_last4 === selectedCard);
  }, [dataset, selectedCard]);

  const filteredTransactions = useMemo(() => {
    if (!dataset) return [];

    return dataset.transactions.filter((transaction) => {
      const searchBase = `${transaction.description} ${transaction.group} ${transaction.category} ${transaction.merchant} ${transaction.subgroup}`.toLowerCase();
      const matchesSearch = !deferredSearch || searchBase.includes(deferredSearch.toLowerCase());
      const matchesCard = selectedCard === "todos" || transaction.card_last4 === selectedCard;
      const matchesCategory = categoryFilter === "todos" || transaction.category === categoryFilter;
      const matchesRoot = rootFilter === "todos" || transaction.group === rootFilter;
      const matchesInstallment =
        installmentFilter === "todos"
          || (installmentFilter === "sim" && transaction.is_installment)
          || (installmentFilter === "nao" && !transaction.is_installment);

      return matchesSearch && matchesCard && matchesCategory && matchesRoot && matchesInstallment;
    });
  }, [categoryFilter, dataset, deferredSearch, installmentFilter, rootFilter, selectedCard]);

  const filteredTotal = useMemo(() => filteredTransactions.reduce((sum, item) => sum + item.amount, 0), [filteredTransactions]);
  const rootRows = useMemo(() => aggregateRoots(filteredTransactions, dataset?.summary.total_bill || 1), [dataset, filteredTransactions]);
  const categoryRows = useMemo(() => aggregateCategories(filteredTransactions, dataset?.summary.total_bill || 1), [dataset, filteredTransactions]);
  const merchantRows = useMemo(() => aggregateMerchants(filteredTransactions, dataset?.summary.total_bill || 1), [dataset, filteredTransactions]);
  const dayRows = useMemo(() => aggregateDays(filteredTransactions, dataset?.summary.total_bill || 1), [dataset, filteredTransactions]);

  const rootDetails = useMemo(() => {
    const groups = new Map();

    filteredTransactions.forEach((transaction) => {
      if (!groups.has(transaction.group)) {
        groups.set(transaction.group, { transactions: [], subgroups: new Map(), channels: new Map() });
      }

      const row = groups.get(transaction.group);
      row.transactions.push(transaction);
      row.subgroups.set(transaction.subgroup, (row.subgroups.get(transaction.subgroup) || 0) + transaction.amount);
      row.channels.set(transaction.channel, (row.channels.get(transaction.channel) || 0) + 1);
    });

    return Object.fromEntries(
      [...groups.entries()].map(([root, row]) => [
        root,
        {
          transactions: [...row.transactions].sort((left, right) => right.amount - left.amount).slice(0, 6),
          subgroups: [...row.subgroups.entries()].sort((left, right) => right[1] - left[1]).map(([name, total]) => ({ name, total })),
          channels: [...row.channels.entries()].sort((left, right) => right[1] - left[1]).map(([name, count]) => ({ name, count })),
        },
      ]),
    );
  }, [filteredTransactions]);

  const cardScopedRootRows = useMemo(() => aggregateRoots(selectedCardTransactions, dataset?.summary.total_bill || 1), [dataset, selectedCardTransactions]);
  const cardScopedInstallments = useMemo(() => selectedCardTransactions.filter((item) => item.is_installment).sort((a, b) => b.amount - a.amount).slice(0, 6), [selectedCardTransactions]);
  const cardScopedMerchantRows = useMemo(() => aggregateMerchants(selectedCardTransactions, dataset?.summary.total_bill || 1), [dataset, selectedCardTransactions]);
  const cardScopedSubscriptions = useMemo(
    () => selectedCardTransactions.filter((item) => item.category === "Assinaturas e apps").sort((a, b) => b.amount - a.amount).slice(0, 6),
    [selectedCardTransactions],
  );

  const activeCardData = useMemo(() => {
    if (!dataset) return null;
    if (selectedCard === "todos") {
      return {
        label: "Carteira completa",
        holder: "Todos os cartões",
        official_total: dataset.summary.total_bill,
        detected_total: dataset.summary.total_bill,
        transaction_count: dataset.summary.transaction_count,
        current_installments_total: dataset.summary.installments_current_total,
        future_installments_estimated: dataset.installments.reduce((sum, item) => {
          if (!item.installment_tag) return sum;
          const [currentInstallment, totalInstallments] = item.installment_tag.split("/").map(Number);
          return sum + item.amount * Math.max(totalInstallments - currentInstallment, 0);
        }, 0),
        top_roots: cardScopedRootRows.slice(0, 4).map((item) => ({ name: item.root, total: item.total })),
      };
    }

    return dataset.cards.find((item) => item.label === selectedCard) || null;
  }, [cardScopedRootRows, dataset, selectedCard]);

  const activeCardAlerts = useMemo(() => {
    if (!activeCardData) return [];

    const alerts = [];
    const primaryRoot = cardScopedRootRows[0];
    const total = activeCardData.official_total || 0;
    const subscriptionsTotal = selectedCardTransactions.filter((item) => item.category === "Assinaturas e apps").reduce((sum, item) => sum + item.amount, 0);
    const mobilityTotal = selectedCardTransactions.filter((item) => item.category === "Mobilidade").reduce((sum, item) => sum + item.amount, 0);
    const smallCount = selectedCardTransactions.filter((item) => item.amount <= 20).length;
    const hasDirectDupes = selectedCardTransactions.some((item) => ["ChatGPT", "NordVPN"].includes(item.group));

    if (primaryRoot && total && (primaryRoot.total / total) >= 0.35) {
      alerts.push({ tone: "warning", title: `${primaryRoot.root} domina este cartão`, note: `${money(primaryRoot.total)} concentrados nessa raiz.` });
    }
    if (activeCardData.future_installments_estimated > total * 0.2) {
      alerts.push({ tone: "danger", title: "Parcelas futuras relevantes", note: `${money(activeCardData.future_installments_estimated)} ainda comprometidos nas proximas faturas.` });
    }
    if (subscriptionsTotal > total * 0.12) {
      alerts.push({ tone: "info", title: "Recorrencias pesando no cartao", note: `${money(subscriptionsTotal)} em assinaturas e apps no recorte atual.` });
    }
    if (mobilityTotal > total * 0.18) {
      alerts.push({ tone: "warning", title: "Mobilidade acima do normal", note: `${money(mobilityTotal)} sairam em transporte por app.` });
    }
    if (smallCount >= 10) {
      alerts.push({ tone: "neutral", title: "Muitas compras pequenas", note: `${shortCount(smallCount)} lancamentos de ate R$ 20 tendem a escapar do radar.` });
    }
    if (hasDirectDupes) {
      alerts.push({ tone: "danger", title: "Recorrencias que merecem conferencia", note: "ChatGPT ou NordVPN aparecem fora da Apple neste cartao." });
    }
    return alerts.slice(0, 4);
  }, [activeCardData, cardScopedRootRows, selectedCardTransactions]);

  const activeFilters = [
    selectedCard !== "todos" ? { label: `Cartao: ${selectedCard}`, clear: () => setSelectedCard("todos") } : null,
    categoryFilter !== "todos" ? { label: `Categoria: ${categoryFilter}`, clear: () => setCategoryFilter("todos") } : null,
    rootFilter !== "todos" ? { label: `Raiz: ${rootFilter}`, clear: () => setRootFilter("todos") } : null,
    installmentFilter !== "todos"
      ? { label: installmentFilter === "sim" ? "Somente parcelados" : "Somente a vista", clear: () => setInstallmentFilter("todos") }
      : null,
    search ? { label: `Busca: ${search}`, clear: () => setSearch("") } : null,
  ].filter(Boolean);

  const viewRows = useMemo(() => {
    if (view === "roots") return sortRows(rootRows, sortConfig.key, sortConfig.direction);
    if (view === "merchants") return sortRows(merchantRows, sortConfig.key, sortConfig.direction);
    return sortRows(filteredTransactions, sortConfig.key, sortConfig.direction);
  }, [filteredTransactions, merchantRows, rootRows, sortConfig.direction, sortConfig.key, view]);

  useEffect(() => {
    if (!connection?.itemId) return;

    syncPluggyItemRef.current?.(connection.itemId, { refresh: false, silent: true }).catch(() => {
      // Keep the demo fallback if the live sync fails on boot.
    });
  }, [connection?.itemId]);

  if (!dataset) return <BillingSkeleton />;

  const summary = dataset.summary;
  const topRoot = rootRows[0];
  const topCategory = categoryRows[0];
  const topMerchant = merchantRows[0];
  const overviewMetrics = [
    { label: "Maior raiz", value: topRoot ? `${topRoot.root}` : "-", note: topRoot ? `${money(topRoot.total)} no ciclo` : "Sem dados", tone: "warning" },
    { label: "Maior cartao", value: cardOptions[0]?.label || "-", note: cardOptions[0] ? `${money(cardOptions[0].official_total)} neste fechamento` : "Sem dados", tone: "info" },
    { label: "Assinaturas", value: money(summary.recurring_observed_total), note: "Planos, software e recorrencias observadas", tone: "danger" },
    { label: "Duplicidades", value: money(summary.possible_direct_duplicate_total), note: "ChatGPT e NordVPN fora da Apple", tone: "success" },
  ];
  const activeCardSummaryNote = selectedCard === "todos"
    ? "Visao consolidada da carteira para decidir cortes, filtros e prioridades."
    : `${activeCardData?.holder || "Responsavel"} · ${shortCount(activeCardData?.transaction_count || 0)} lancamentos no ciclo.`;

  function handleSearchChange(value) {
    startTransition(() => setSearch(value));
  }

  function handleSort(column) {
    setSortConfig((current) => ({
      key: column,
      direction: current.key === column && current.direction === "desc" ? "asc" : "desc",
    }));
  }

  function handleCardSelect(label) {
    setSelectedCard((current) => (current === label ? "todos" : label));
    setCardPanelTab("resumo");
    setRootFilter("todos");
    setShellView("carteira");
  }

  function handleViewChange(nextView) {
    setView(nextView);
    setSortConfig(nextView === "transactions" ? { key: "amount", direction: "desc" } : { key: "total", direction: "desc" });
  }

  function clearAllFilters() {
    setSelectedCard("todos");
    setCategoryFilter("todos");
    setRootFilter("todos");
    setInstallmentFilter("todos");
    setSearch("");
  }

  function scrollToSection(ref) {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activateView(nextView, ref = null) {
    setShellView(nextView);
    if (ref) requestAnimationFrame(() => scrollToSection(ref));
  }

  async function loadStaticDataset() {
    const response = await fetch(DATA_URL);
    const json = await response.json();
    setDataset(json);
    setSourceMode("demo");
    return json;
  }

  async function syncPluggyItem(itemId, { refresh = false, silent = false } = {}) {
    try {
      if (!silent) {
        setSyncState({ phase: "syncing", error: "" });
      }

      const response = await fetch("/.netlify/functions/pluggy-sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ itemId, refresh }),
      });

      const { data: json } = await readApiPayload(response);
      if (!response.ok) {
        throw new Error(getFunctionErrorMessage(response, json, "Falha ao sincronizar o item conectado."));
      }

      const normalized = normalizePluggyDataset(json);
      setDataset(normalized);
      setSourceMode("pluggy");
      setConnection((current) => ({
        ...(current || {}),
        itemId,
        connectorName: normalized.connection.connectorName,
        status: normalized.connection.status,
        executionStatus: normalized.connection.executionStatus,
        lastSyncAt: new Date().toISOString(),
      }));
      setSyncState({ phase: "success", error: "" });
      return normalized;
    } catch (error) {
      setSyncState({ phase: "error", error: error.message || "Falha ao sincronizar o Pluggy." });
      if (!dataset) {
        await loadStaticDataset();
      }
      throw error;
    }
  }

  syncPluggyItemRef.current = syncPluggyItem;

  async function requestConnectToken(updateItem = null) {
    try {
      setConnectTokenState({ phase: "loading", token: "", updateItem, error: "" });
      setSyncState((current) => ({ ...current, error: "" }));

      const response = await fetch("/.netlify/functions/pluggy-connect-token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientUserId: getClientUserId(),
          ...(updateItem ? { itemId: updateItem } : {}),
        }),
      });

      const { data: json } = await readApiPayload(response);
      if (!response.ok) {
        throw new Error(getFunctionErrorMessage(response, json, "Nao foi possivel gerar o token de conexao."));
      }

      setConnectTokenState({ phase: "ready", token: json.accessToken, updateItem, error: "" });
    } catch (error) {
      setConnectTokenState({ phase: "error", token: "", updateItem: null, error: error.message || "Falha ao iniciar a conexao." });
      setSyncState({ phase: "error", error: error.message || "Falha ao iniciar a conexao." });
    }
  }

  function handleOpenConnect() {
    requestConnectToken();
  }

  function handleOpenReconnect() {
    if (!connection?.itemId) return;
    requestConnectToken(connection.itemId);
  }

  function handleWidgetError(message) {
    const friendlyMessage = getFriendlyPluggyMessage(message);
    setConnectTokenState({ phase: "error", token: "", updateItem: null, error: friendlyMessage });
    setSyncState({ phase: "error", error: friendlyMessage });
  }

  function handleWidgetClose() {
    setConnectTokenState({ phase: "idle", token: "", updateItem: null, error: "" });
  }

  async function handleWidgetSuccess(payload) {
    const itemId = payload?.item?.id;
    if (!itemId) {
      handleWidgetError("O Pluggy concluiu a conexao, mas nao retornou um item valido.");
      return;
    }

    handleWidgetClose();
    await syncPluggyItem(itemId, { refresh: false });
  }

  async function handleRefreshLive() {
    if (!connection?.itemId) return;
    await syncPluggyItem(connection.itemId, { refresh: true });
  }

  async function handleDisconnect() {
    try {
      if (connection?.itemId) {
        const response = await fetch("/.netlify/functions/pluggy-disconnect", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ itemId: connection.itemId }),
        });

        const { data: json } = await readApiPayload(response);
        if (!response.ok) {
          throw new Error(getFunctionErrorMessage(response, json, "Falha ao desconectar o item."));
        }
      }
      setConnection(null);
      setConnectTokenState({ phase: "idle", token: "", updateItem: null, error: "" });
      setSyncState({ phase: "idle", error: "" });
      await loadStaticDataset();
    } catch (error) {
      setSyncState({ phase: "error", error: error.message || "Falha ao desconectar o item conectado." });
    }
  }

  function handleUseDemo() {
    setSourceMode("demo");
    loadStaticDataset();
  }

  function openRoot(row) {
    setSelected({
      kind: "raiz",
      title: row.root,
      kpis: [
        { label: "Total", value: money(row.total) },
        { label: "Participacao", value: pct(row.sharePct) },
        { label: "Lancamentos", value: shortCount(row.count) },
        { label: "Categorias", value: shortCount(row.categories.length) },
      ],
      notes: [
        ...row.categories.map((item) => `${item.name}: ${money(item.total)} (${pct(item.sharePct)})`),
        ...(rootDetails[row.root]?.channels || []).map((item) => `Canal ${item.name}: ${item.count} lancamentos`),
        ...row.merchants.map((item) => `${item.name}: ${money(item.total)}`),
      ].slice(0, 8),
    });
  }

  function openMerchant(row) {
    setSelected({
      kind: "estabelecimento",
      title: row.merchant,
      kpis: [
        { label: "Total", value: money(row.total) },
        { label: "Participacao", value: pct(row.sharePct) },
        { label: "Lancamentos", value: shortCount(row.count) },
        { label: "Raiz", value: row.root },
      ],
      notes: [
        `Categoria: ${row.category}`,
        `Subtipo: ${row.subgroup}`,
        `Cartoes: ${row.cards.map((item) => `${item.name} ${money(item.total)}`).join(" · ") || "Nao identificado"}`,
        `Canais: ${row.channels.map((item) => `${item.name} (${shortCount(item.count)})`).join(" · ") || "Nao identificado"}`,
        ...row.samples,
      ],
    });
  }

  function openTransaction(row) {
    setSelected({
      kind: "lancamento",
      title: row.description,
      kpis: [
        { label: "Valor", value: money(row.amount) },
        { label: "Data", value: row.date },
        { label: "Raiz", value: row.group },
        { label: "Categoria", value: row.category },
      ],
      notes: [
        `Estabelecimento: ${row.merchant}`,
        `Subtipo: ${row.subgroup}`,
        `Cartao: ${row.card_last4} · ${row.card_holder}`,
        `Canal inferido: ${row.channel}`,
        row.installment_tag ? `Parcela: ${row.installment_tag}` : "Lancamento sem tag de parcelamento",
      ],
    });
  }

  function toggleRoot(root) {
    setExpandedRoot((current) => (current === root ? null : root));
  }

  function showRootTransactions(root) {
    setRootFilter(root);
    handleViewChange("transactions");
    activateView("explorer", explorerRef);
  }

  return (
    <main className="saas-shell finance-shell">
      <header className="topbar finance-topbar">
        <div>
          <span className="micro-label">Local Product</span>
          <h1>Finance Hub</h1>
          <p className="finance-subtitle">
            Painel financeiro local com leitura por cartao, concentracao por raiz e exploracao acionavel do ciclo.
          </p>
        </div>
        <div className="topbar-meta">
          <span>Arquivo: {dataset.meta.source_file}</span>
          <span>Fechamento: {dataset.meta.period_label}</span>
          <span>Vencimento: {summary.due_date}</span>
        </div>
      </header>

      <OpenFinancePanel
        sourceMode={sourceMode}
        connection={connection}
        syncState={syncState.phase === "error" && !syncState.error && connectTokenState.error ? { ...syncState, error: connectTokenState.error } : syncState}
        connectTokenState={connectTokenState}
        onOpenConnect={handleOpenConnect}
        onOpenReconnect={handleOpenReconnect}
        onRefresh={handleRefreshLive}
        onDisconnect={handleDisconnect}
        onUseDemo={handleUseDemo}
        onWidgetSuccess={handleWidgetSuccess}
        onWidgetClose={handleWidgetClose}
        onWidgetError={handleWidgetError}
      />

      {shellView === "home" ? (
        <HomeView
          summary={summary}
          installmentsCount={dataset.installments.length}
          overviewMetrics={overviewMetrics}
          cardOptions={cardOptions}
          topCategory={topCategory}
          topMerchant={topMerchant}
          topRoot={topRoot}
          money={money}
          pct={pct}
          shortCount={shortCount}
          activateView={activateView}
          cardHomeRef={cardHomeRef}
          rootMapRef={rootMapRef}
          explorerRef={explorerRef}
          handleCardSelect={handleCardSelect}
        />
      ) : null}

      <ProductNavigation
        shellView={shellView}
        activateView={activateView}
        cardHomeRef={cardHomeRef}
        summaryBandRef={summaryBandRef}
        explorerRef={explorerRef}
      />

      <ShellStatusBar
        shellView={shellView}
        selectedCard={selectedCard}
        filteredTotal={filteredTotal}
        filteredTransactionsCount={filteredTransactions.length}
        activeFilters={activeFilters}
        money={money}
        shortCount={shortCount}
        activateView={activateView}
        cardHomeRef={cardHomeRef}
        rootMapRef={rootMapRef}
        explorerRef={explorerRef}
      />

      {shellView === "carteira" ? (
        <WalletView
          sectionRef={cardHomeRef}
          cardOptions={cardOptions}
          selectedCard={selectedCard}
          summary={summary}
          activeCardData={activeCardData}
          activeCardSummaryNote={activeCardSummaryNote}
          cardPanelTab={cardPanelTab}
          setCardPanelTab={setCardPanelTab}
          handleCardSelect={handleCardSelect}
          activateView={activateView}
          cardHomeRef={cardHomeRef}
          rootMapRef={rootMapRef}
          explorerRef={explorerRef}
          cardScopedMerchantRows={cardScopedMerchantRows}
          cardScopedInstallments={cardScopedInstallments}
          cardScopedSubscriptions={cardScopedSubscriptions}
          activeCardAlerts={activeCardAlerts}
          openTransaction={openTransaction}
          handleViewChange={handleViewChange}
          setRootFilter={setRootFilter}
        />
      ) : null}

      {shellView === "insights" || shellView === "explorer" ? (
        <div className="finance-workspace">
          <FiltersPanel
            mobileFiltersOpen={mobileFiltersOpen}
            setMobileFiltersOpen={setMobileFiltersOpen}
            search={search}
            onSearchChange={handleSearchChange}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            categoryOptions={categoryOptions}
            rootFilter={rootFilter}
            setRootFilter={setRootFilter}
            rootOptions={rootOptions}
            installmentFilter={installmentFilter}
            setInstallmentFilter={setInstallmentFilter}
            activeFilters={activeFilters}
            clearAllFilters={clearAllFilters}
            filteredTotal={filteredTotal}
            filteredTransactionsCount={filteredTransactions.length}
            dataset={dataset}
            selectedCard={selectedCard}
            shellView={shellView}
            money={money}
            shortCount={shortCount}
          />

          <section className="finance-main">
            <div className="mobile-utility-bar">
              <button type="button" className="mobile-filter-trigger" onClick={() => setMobileFiltersOpen(true)}>
                Abrir filtros
              </button>
              <div className="mobile-filter-summary">
                <strong>{money(filteredTotal)}</strong>
                <span>{shortCount(filteredTransactions.length)} itens no recorte</span>
              </div>
            </div>

            {shellView === "insights" ? (
              <InsightsView
                summary={summary}
                installmentsCount={dataset.installments.length}
                topCategory={topCategory}
                topMerchant={topMerchant}
                topRoot={topRoot}
                rootRows={rootRows}
                rootDetails={rootDetails}
                expandedRoot={expandedRoot}
                openRoot={openRoot}
                toggleRoot={toggleRoot}
                openTransaction={openTransaction}
                showRootTransactions={showRootTransactions}
                setRootFilter={setRootFilter}
                categoryRows={categoryRows}
                dayRows={dayRows}
                money={money}
                pct={pct}
                shortCount={shortCount}
                summaryBandRef={summaryBandRef}
                rootMapRef={rootMapRef}
              />
            ) : null}

            {shellView === "explorer" ? (
              <ExplorerView
                sectionRef={explorerRef}
                view={view}
                handleViewChange={handleViewChange}
                sortConfig={sortConfig}
                handleSort={handleSort}
                viewRows={viewRows}
                openRoot={openRoot}
                openMerchant={openMerchant}
                openTransaction={openTransaction}
                money={money}
                pct={pct}
                shortCount={shortCount}
                cardBadgeTheme={cardBadgeTheme}
                channelBadgeTheme={channelBadgeTheme}
              />
            ) : null}
          </section>
        </div>
      ) : null}

      <BottomBankNav
        shellView={shellView}
        activateView={activateView}
        cardHomeRef={cardHomeRef}
        rootMapRef={rootMapRef}
        explorerRef={explorerRef}
      />

      {mobileFiltersOpen ? <button type="button" className="mobile-filter-backdrop" onClick={() => setMobileFiltersOpen(false)} /> : null}
      <DetailDrawer selected={selected} onClose={() => setSelected(null)} />
    </main>
  );
}
