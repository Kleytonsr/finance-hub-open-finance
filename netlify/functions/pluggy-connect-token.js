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
    const apiKey = await getApiKey();
    const payload = await pluggyRequest("/connect_token", {
      method: "POST",
      apiKey,
      body: {
        ...(body.itemId ? { itemId: body.itemId } : {}),
        ...(body.clientUserId ? { options: { clientUserId: body.clientUserId } } : {}),
      },
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken: payload.accessToken,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        error: error.message || "Falha ao gerar o connect token.",
      }),
    };
  }
}
