import { fetchPaged, getApiKey, pluggyRequest, pollItem } from "./lib/pluggy.js";

export default async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method not allowed" }),
    };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
    if (!body.itemId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "itemId obrigatorio." }),
      };
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

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        item,
        accounts,
        transactions: transactionsByAccount.flat(),
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.message || "Falha ao sincronizar item no Pluggy.",
      }),
    };
  }
}
