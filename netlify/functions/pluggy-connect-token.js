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
    const apiKey = await getApiKey();
    const payload = await pluggyRequest("/connect_token", {
      method: "POST",
      apiKey,
      body: {
        ...(body.itemId ? { itemId: body.itemId } : {}),
        ...(body.clientUserId ? { options: { clientUserId: body.clientUserId } } : {}),
      },
    });

    return jsonResponse(200, {
      accessToken: payload.accessToken,
    });
  } catch (error) {
    return jsonResponse(500, {
      error: error.message || "Falha ao gerar o connect token.",
    });
  }
}
