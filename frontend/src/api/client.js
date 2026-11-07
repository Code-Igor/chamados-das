/** Centraliza as requisições e os erros da API Spring Boot. */
const API_BASE = import.meta.env.DEV ? '/api' : '';

export async function request(path, { method = 'GET', body, ...rest } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      method,
      ...rest,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...rest.headers,
      },
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    });
  } catch (error) {
    throw new Error('Não foi possível conectar ao backend. Verifique se o Spring Boot está executando na porta 8080.');
  }

  if (response.status === 204) return null;
  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = raw; }
  }

  if (!response.ok) {
    const detalhes = Array.isArray(data?.detalhes) && data.detalhes.length
      ? `: ${data.detalhes.join('; ')}`
      : '';
    const erro = (data && typeof data === 'object' && (data.erro || data.message))
      || (typeof data === 'string' ? data : null)
      || `Erro HTTP ${response.status}`;
    throw new Error(`${erro}${detalhes}`);
  }
  return data;
}

export function queryString(filters = {}) {
  const query = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== '' && value !== undefined && value !== null) query.set(key, String(value));
  });
  const result = query.toString();
  return result ? `?${result}` : '';
}
