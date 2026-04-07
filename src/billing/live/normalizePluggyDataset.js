function toNumber(value) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatDate(isoDate, includeYear = false) {
  if (!isoDate) return includeYear ? "--/--/----" : "--/--";

  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return includeYear ? "--/--/----" : "--/--";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear());
  return includeYear ? `${day}/${month}/${year}` : `${day}/${month}`;
}

function formatIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function extractDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function detectInstallment(description) {
  const match = String(description || "").match(/(\d{1,2}\/\d{1,2})/);
  return match ? match[1] : null;
}

function classifyTransaction(description) {
  const upper = String(description || "").toUpperCase();

  if (upper.includes("UBER UBER *TRIP HELP.U") || upper.includes("UBER* TRIP") || upper.includes("DL*UBERRIDES") || upper.includes("DL *UBERRIDES")) {
    return ["Mobilidade", "Uber", "Corridas", description];
  }
  if (upper.includes("99APP") || upper.includes("99 RIDE")) {
    return ["Mobilidade", "99", "Corridas", description];
  }
  if (upper.includes("99FOOD") || upper.includes("ZAMP")) {
    return ["Apps de pedido e conveniencia", "99", "Delivery", description];
  }

  if (upper.includes("UBER *ONE MEMBERSHIP U")) return ["Assinaturas e apps", "Uber", "Uber One", description];
  if (upper.includes("IFD*IFOOD CLUB")) return ["Assinaturas e apps", "iFood", "iFood Club", description];
  if (upper.includes("APPLECOMBILL")) return ["Assinaturas e apps", "Apple", "Apple subscriptions", description];
  if (upper.includes("AMAZON PRIME CANAIS")) return ["Assinaturas e apps", "Amazon", "Prime Canais", description];
  if (upper.includes("AMAZONPRIMEBR")) return ["Assinaturas e apps", "Amazon", "Prime", description];
  if (upper.includes("AMAZON AD FREE FOR PRI")) return ["Assinaturas e apps", "Amazon", "Sem anuncios", description];
  if (upper.includes("OPENAI *CHATGPT SUBSCR")) return ["Assinaturas e apps", "ChatGPT", "Assinatura direta", description];
  if (upper.includes("EBANX_NORD")) return ["Assinaturas e apps", "NordVPN", "Assinatura direta", description];
  if (upper.includes("KIWIFY")) return ["Assinaturas e apps", "Kiwify", "Curso ou assinatura", description];
  if (upper.includes("TIM*TIM")) return ["Assinaturas e apps", "TIM", "Plano", description];
  if (upper.includes("HUBEDUCACIONALIMO")) return ["Assinaturas e apps", "Hub Educacional", "Curso ou assinatura", description];

  if (upper.startsWith("IFD*")) return ["Apps de pedido e conveniencia", "iFood", "Pedidos, mercado e farmacia", description];
  if (upper.includes("IFOOD")) return ["Apps de pedido e conveniencia", "iFood", "Pedidos", description];
  if (upper.includes("KEETA")) return ["Apps de pedido e conveniencia", "Keeta", "Pedidos", description];
  if (upper.includes("MCDONALD") || upper.includes("LIV UP") || upper.includes("PAES") || upper.includes("PALETA") || upper.includes("POINT SANTANA") || upper.includes("SUSHI") || upper.includes("BAR E")) {
    return ["Apps de pedido e conveniencia", "Pedidos diretos", "Pedidos avulsos", description];
  }

  if (upper.includes("ANDORINHA") || upper.includes("SONDA") || upper.includes("SATO SUPERMERCADO") || upper.includes("SUPERMERCADO VIOLETA") || upper.includes("REU FRUTAS")) {
    return ["Mercado e casa", "Mercado presencial", "Supermercados e feira", description];
  }
  if (upper.includes("DAKI")) return ["Mercado e casa", "Daki", "Mercado por app", description];
  if (upper.includes("HIDROSOLUCOES")) return ["Mercado e casa", "Casa e utilidades", "Casa e utilidades", description];
  if (upper.includes("GAS")) return ["Mercado e casa", "Casa e utilidades", "Gas", description];

  if (upper.includes("RAIA") || upper.includes("DROGARIA") || upper.includes("FARMAC")) return ["Saude", "Farmacias", "Saude e farmacia", description];
  if (upper.includes("ODONTOPREV")) return ["Saude", "OdontoPrev", "Plano", description];

  if (upper.includes("BARBER") || upper.includes("PERFUMARIA") || upper.includes("BELEZA")) return ["Cuidado pessoal", "Beleza e barbearia", "Cuidado pessoal", description];

  if (upper.includes("MERCADOLIVRE")) return ["Compras online", "Mercado Livre", "Marketplace", description];
  if (upper.includes("SHOPEE")) return ["Compras online", "Shopee", "Marketplace", description];

  if (upper.includes("EC *JPS") || upper.includes("CONNECTIONPOINT")) return ["Parcelados legados", "Parcelados antigos", "Parcelados anteriores", description];
  if (upper.includes("MERCADOCAR")) return ["Veiculo", "Mercadocar", "Veiculo", description];

  return ["Outros", "Outros", "Outros", description];
}

function inferChannel(description, category, group, subgroup) {
  const upper = String(description || "").toUpperCase();

  if (category === "Assinaturas e apps") {
    if (["Apple", "Amazon", "ChatGPT", "NordVPN", "Kiwify", "Hub Educacional"].includes(group)) return "Assinatura ou software";
    if (["iFood", "Uber"].includes(group) && ["iFood Club", "Uber One"].includes(subgroup)) return "Assinatura no app";
    return "Servico recorrente";
  }

  if (["Uber", "99", "iFood", "Keeta"].includes(group)) return "App";
  if (upper.includes("MERCADOLIVRE") || upper.includes("SHOPEE") || upper.includes("ECOMMERCE")) return "Online";
  if (["Mercado e casa", "Saude", "Cuidado pessoal", "Veiculo"].includes(category)) return "Provavel presencial";
  return "Nao identificavel";
}

function getAccountLabel(account, index) {
  const last4 = extractDigits(account.number).slice(-4);
  const isCreditCard = account.type === "CREDIT" || account.subtype === "CREDIT_CARD";

  if (last4) {
    return isCreditCard ? `final ${last4}` : `conta ${last4}`;
  }

  return isCreditCard ? `cartao ${index + 1}` : `conta ${index + 1}`;
}

function getAccountHolder(account) {
  return account.owner || account.marketingName || account.name || "Nao identificado";
}

function getCreditLimit(account) {
  const direct = toNumber(account.creditData?.creditLimit);
  if (direct > 0) return direct;

  const disaggregated = account.creditData?.disaggregatedCreditLimits || [];
  return disaggregated.reduce((sum, item) => sum + toNumber(item.limitAmount), 0);
}

function getAvailableCredit(account) {
  const direct = toNumber(account.creditData?.availableCreditLimit);
  if (direct > 0) return direct;

  const disaggregated = account.creditData?.disaggregatedCreditLimits || [];
  return disaggregated.reduce((sum, item) => sum + toNumber(item.availableAmount), 0);
}

function shouldIncludeTransaction(transaction, account) {
  const amount = toNumber(transaction.amount);
  const direction = `${transaction.type || ""} ${transaction.creditDebitType || ""}`.toUpperCase();

  if (amount < 0) return true;
  if (direction.includes("DEBIT")) return true;
  if ((account.type === "CREDIT" || account.subtype === "CREDIT_CARD") && amount > 0) return true;
  return false;
}

function aggregateTopRoots(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    totals.set(transaction.group, (totals.get(transaction.group) || 0) + transaction.amount);
  });

  return [...totals.entries()]
    .sort((left, right) => right[1] - left[1])
    .slice(0, 4)
    .map(([name, total]) => ({ name, total: Number(total.toFixed(2)) }));
}

function buildSummary(accounts, transactions, creditAccounts) {
  const totalSpent = transactions.reduce((sum, item) => sum + item.amount, 0);
  const installmentTotal = transactions.filter((item) => item.is_installment).reduce((sum, item) => sum + item.amount, 0);
  const recurringTotal = transactions
    .filter((item) => item.category === "Assinaturas e apps" || item.group === "OdontoPrev")
    .reduce((sum, item) => sum + item.amount, 0);

  const totalLimit = creditAccounts.reduce((sum, account) => sum + getCreditLimit(account), 0);
  const totalAvailable = creditAccounts.reduce((sum, account) => sum + getAvailableCredit(account), 0);
  const usedLimit = totalLimit > 0 ? Math.max(totalLimit - totalAvailable, 0) : 0;
  const creditUsagePct = totalLimit > 0 ? (usedLimit / totalLimit) * 100 : 0;
  const dueDates = creditAccounts.map((account) => account.creditData?.balanceDueDate).filter(Boolean).sort();
  const minimumPayment = creditAccounts.reduce((sum, account) => sum + toNumber(account.creditData?.minimumPayment), 0);
  const currentBalances = creditAccounts.reduce((sum, account) => sum + Math.abs(toNumber(account.balance)), 0);
  const internationalTotal = transactions
    .filter((item) => String(item.currencyCode || "BRL").toUpperCase() !== "BRL")
    .reduce((sum, item) => sum + item.amount, 0);

  return {
    total_bill: Number(totalSpent.toFixed(2)),
    due_date: dueDates[0] ? formatDate(dueDates[0], true) : "--/--/----",
    minimum_payment: Number(minimumPayment.toFixed(2)),
    credit_limit_total: Number(totalLimit.toFixed(2)),
    credit_limit_available: Number(totalAvailable.toFixed(2)),
    credit_limit_used: Number(usedLimit.toFixed(2)),
    next_bill_commitment: Number(currentBalances.toFixed(2)),
    later_bills_commitment: 0,
    future_bills_total: Number(currentBalances.toFixed(2)),
    international_total: Number(internationalTotal.toFixed(2)),
    credit_usage_pct: Number(creditUsagePct.toFixed(2)),
    ticket_mean: transactions.length ? Number((totalSpent / transactions.length).toFixed(2)) : 0,
    transaction_count: transactions.length,
    installments_current_total: Number(installmentTotal.toFixed(2)),
    recurring_observed_total: Number(recurringTotal.toFixed(2)),
    cancelled_apple_total: 0,
    projected_without_cancelled_apple: Number(totalSpent.toFixed(2)),
    possible_direct_duplicate_total: 0,
    projected_without_cancelled_apple_and_direct_duplicates: Number(totalSpent.toFixed(2)),
  };
}

export default function normalizePluggyDataset({ item, accounts = [], transactions = [] }) {
  const accountLookup = new Map();
  const normalizedAccounts = accounts.map((account, index) => {
    const normalized = {
      ...account,
      label: getAccountLabel(account, index),
      holder: getAccountHolder(account),
    };
    accountLookup.set(account.id, normalized);
    return normalized;
  });

  const lookbackDate = new Date();
  lookbackDate.setDate(lookbackDate.getDate() - 45);

  const normalizedTransactions = transactions
    .map((transaction, index) => {
      const account = accountLookup.get(transaction.accountId);
      if (!account || !shouldIncludeTransaction(transaction, account)) return null;

      const dateValue = transaction.date || transaction.dateTime || transaction.createdAt;
      const txDate = new Date(dateValue);
      if (Number.isNaN(txDate.getTime()) || txDate < lookbackDate) return null;

      const description = transaction.description || transaction.merchant?.name || transaction.providerCode || `Transacao ${index + 1}`;
      const [category, group, subgroup, merchant] = classifyTransaction(description);
      const installmentTag = detectInstallment(description);

      return {
        id: transaction.id || `${account.id}-${index + 1}`,
        date: formatDate(dateValue),
        sort_key: (txDate.getDate() * 100) + (txDate.getMonth() + 1),
        description,
        merchant,
        category,
        group,
        subgroup,
        channel: inferChannel(description, category, group, subgroup),
        card_last4: account.label,
        card_holder: account.holder,
        amount: Number(Math.abs(toNumber(transaction.amount)).toFixed(2)),
        installment_tag: installmentTag,
        is_installment: Boolean(installmentTag),
        currencyCode: transaction.currencyCode || "BRL",
        accountId: account.id,
      };
    })
    .filter(Boolean)
    .sort((left, right) => right.sort_key - left.sort_key || right.amount - left.amount);

  const creditAccounts = normalizedAccounts.filter((account) => account.type === "CREDIT" || account.subtype === "CREDIT_CARD");
  const cardsBase = creditAccounts.length ? creditAccounts : normalizedAccounts;

  const cards = cardsBase.map((account) => {
    const accountTransactions = normalizedTransactions.filter((transaction) => transaction.accountId === account.id);
    return {
      label: account.label,
      holder: account.holder,
      official_total: Number(Math.abs(toNumber(account.balance)).toFixed(2)),
      detected_total: Number(accountTransactions.reduce((sum, item) => sum + item.amount, 0).toFixed(2)),
      transaction_count: accountTransactions.length,
      current_installments_total: Number(accountTransactions.filter((item) => item.is_installment).reduce((sum, item) => sum + item.amount, 0).toFixed(2)),
      future_installments_estimated: 0,
      top_roots: aggregateTopRoots(accountTransactions),
    };
  });

  const summary = buildSummary(normalizedAccounts, normalizedTransactions, creditAccounts);

  return {
    meta: {
      title: "Finance Hub conectado",
      period_label: `Ultimos 45 dias · ${item.connector?.name || "Conta conectada"}`,
      analysis_date: formatIsoDate(new Date()),
      source_file: item.connector?.name ? `Pluggy / ${item.connector.name}` : "Pluggy / Open Finance",
    },
    summary,
    cards,
    installments: normalizedTransactions.filter((item) => item.is_installment),
    transactions: normalizedTransactions,
    export_links: null,
    connection: {
      itemId: item.id,
      connectorName: item.connector?.name || "Instituicao conectada",
      status: item.status || "UNKNOWN",
      executionStatus: item.executionStatus || "UNKNOWN",
      updatedAt: item.updatedAt || item.createdAt || new Date().toISOString(),
      createdAt: item.createdAt || new Date().toISOString(),
    },
  };
}
