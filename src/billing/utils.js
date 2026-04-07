const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

const numberFormatter = new Intl.NumberFormat("pt-BR");

export function money(value) {
  return currencyFormatter.format(Number(value || 0));
}

export function pct(value) {
  return `${Number(value || 0).toFixed(2).replace(".", ",")}%`;
}

export function shortCount(value) {
  return numberFormatter.format(Number(value || 0));
}

export function toneForName(name) {
  if (["Apps de pedido e conveniencia", "iFood", "Keeta", "Pedidos diretos"].includes(name)) return "warning";
  if (["Mobilidade", "Uber", "99"].includes(name)) return "info";
  if (["Assinaturas e apps", "Apple", "Amazon", "ChatGPT", "NordVPN"].includes(name)) return "danger";
  if (["Cuidado pessoal", "Beleza e barbearia"].includes(name)) return "success";
  return "neutral";
}

export function barTone(name) {
  const tone = toneForName(name);
  return `rank-${tone}`;
}

export function cardTheme(label) {
  if (label.includes("4934")) return "card-theme-ocean";
  if (label.includes("2592")) return "card-theme-ember";
  if (label.includes("5260")) return "card-theme-forest";
  if (label.includes("1304")) return "card-theme-violet";
  return "card-theme-neutral";
}

export function cardBadgeTheme(label) {
  if (label.includes("4934")) return "context-badge-ocean";
  if (label.includes("2592")) return "context-badge-ember";
  if (label.includes("5260")) return "context-badge-forest";
  if (label.includes("1304")) return "context-badge-violet";
  return "context-badge-neutral";
}

export function channelBadgeTheme(channel) {
  if (channel.includes("Online")) return "context-badge-info";
  if (channel.includes("App")) return "context-badge-warning";
  if (channel.includes("Assinatura")) return "context-badge-danger";
  if (channel.includes("presencial")) return "context-badge-success";
  return "context-badge-neutral";
}

export function sortRows(rows, key, direction) {
  const factor = direction === "asc" ? 1 : -1;
  return [...rows].sort((left, right) => {
    const leftValue = left[key];
    const rightValue = right[key];

    if (typeof leftValue === "number" && typeof rightValue === "number") {
      return (leftValue - rightValue) * factor;
    }

    return String(leftValue).localeCompare(String(rightValue), "pt-BR") * factor;
  });
}
