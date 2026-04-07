import { fetchPaged, getApiKey, pluggyRequest, pollItem } from "./lib/pluggy.js";

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export default async function handler(request) {
  if (request.method !== "POST") {
    return jsonResponse(405, { error: "Method not allowed" });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.itemId) {
      return jsonResponse(400, { error: "itemId obrigatorio." });
    }

    const apiKey = await getApiKey();

    if (body.refresh) {
      await pluggyRequest(`/items/${body.itemId}`, {
        method: "PATCH",
        apiKey,
        body: {},
      });
    }

    const item = await pollItem(apiKey, body.itemId, body.refresh ? 10 : 4);
    const accounts = await fetchPaged(`/accounts?itemId=${encodeURIComponent(body.itemId)}`, apiKey);

    const transactionsByAccount = await Promise.all(
      accounts.map(async (account) => {
        const transactions = await fetchPaged(`/transactions?accountId=${encodeURIComponent(account.id)}`, apiKey);
        return transactions;
      }),
    );

    return jsonResponse(200, {
      item,
      accounts,
      transactions: transactionsByAccount.flat(),
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error.message || "Falha ao sincronizar item no Pluggy.",
    });
  }
}
