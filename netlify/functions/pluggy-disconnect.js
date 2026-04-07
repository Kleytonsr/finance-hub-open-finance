import { getApiKey, pluggyRequest } from "./lib/pluggy.js";

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
    await pluggyRequest(`/items/${body.itemId}`, {
      method: "DELETE",
      apiKey,
    });

    return jsonResponse(200, { ok: true });
  } catch (error) {
    return jsonResponse(500, {
      error: error.message || "Falha ao desconectar item.",
    });
  }
}
