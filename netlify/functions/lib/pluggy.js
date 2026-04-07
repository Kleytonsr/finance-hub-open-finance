const API_BASE = "https://api.pluggy.ai";

function getEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Variavel de ambiente ausente: ${name}`);
  }
  return value;
}

export async function getApiKey() {
  const response = await fetch(`${API_BASE}/auth`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clientId: getEnv("PLUGGY_CLIENT_ID"),
      clientSecret: getEnv("PLUGGY_CLIENT_SECRET"),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Falha ao autenticar no Pluggy: ${response.status} ${text}`);
  }

  const json = await response.json();
  return json.apiKey;
}

export async function pluggyRequest(path, { method = "GET", apiKey, body } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "X-API-KEY": apiKey,
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Pluggy ${method} ${path} falhou: ${response.status} ${text}`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export async function fetchPaged(path, apiKey) {
  const collected = [];
  let page = 1;
  let totalPages = 1;

  do {
    const separator = path.includes("?") ? "&" : "?";
    const payload = await pluggyRequest(`${path}${separator}page=${page}&pageSize=500`, { apiKey });
    const results = Array.isArray(payload?.results) ? payload.results : Array.isArray(payload) ? payload : [];

    collected.push(...results);
    totalPages = Number(payload?.totalPages || payload?.total_pages || 1);
    page += 1;
  } while (page <= totalPages);

  return collected;
}

export async function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function pollItem(apiKey, itemId, attempts = 8) {
  let item = await pluggyRequest(`/items/${itemId}`, { apiKey });
  const pendingStatuses = new Set(["CREATED", "UPDATING", "LOGIN_IN_PROGRESS", "WAITING_USER_INPUT", "WAITING_USER_ACTION"]);

  for (let index = 0; index < attempts && pendingStatuses.has(item.executionStatus); index += 1) {
    await wait(2000);
    item = await pluggyRequest(`/items/${itemId}`, { apiKey });
  }

  return item;
}
