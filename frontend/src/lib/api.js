/**
 * Thin API client — all fetch calls to the backend live here.
 * Using the Vite proxy, all /api/* requests go to localhost:3001.
 */

const BASE = '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }

  return res.json();
}

// ── Prompts ──────────────────────────────────────────────────────────
export const api = {
  prompts: {
    list: () => request('GET', '/prompts'),
    get: (id) => request('GET', `/prompts/${id}`),
    create: (data) => request('POST', '/prompts', data),
    update: (id, data) => request('PUT', `/prompts/${id}`, data),
    delete: (id) => request('DELETE', `/prompts/${id}`),
    duplicate: (id) => request('POST', `/prompts/${id}/duplicate`),
    render: (id, values) => request('POST', `/prompts/${id}/render`, { values }),
  },

  // ── Workflows ───────────────────────────────────────────────────────
  workflows: {
    list: () => request('GET', '/workflows'),
    get: (id) => request('GET', `/workflows/${id}`),
    create: (data) => request('POST', '/workflows', data),
    update: (id, data) => request('PUT', `/workflows/${id}`, data),
    delete: (id) => request('DELETE', `/workflows/${id}`),
  },
};
