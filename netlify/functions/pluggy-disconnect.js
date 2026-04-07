import { getApiKey, pluggyRequest } from "./lib/pluggy.js";

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
    await pluggyRequest(`/items/${body.itemId}`, {
      method: "DELETE",
      apiKey,
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ok: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.message || "Falha ao desconectar item.",
      }),
    };
  }
}
