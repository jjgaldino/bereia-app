// ============================================
// CACHE SIMPLES EM MEMÓRIA
// Para produção futura, substituir por Redis/Upstash
// ============================================

const cache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 horas
const MAX_CACHE_SIZE = 500;

function normalizeQuery(query) {
  return query
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ")
    .replace(/[.,;:!?]/g, "");
}

export function getCached(query, lang) {
  const key = `${lang}:${normalizeQuery(query)}`;
  const entry = cache.get(key);

  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

export function setCache(query, lang, data) {
  const key = `${lang}:${normalizeQuery(query)}`;

  // Evita cache crescer demais
  if (cache.size >= MAX_CACHE_SIZE) {
    const firstKey = cache.keys().next().value;
    cache.delete(firstKey);
  }

  cache.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL,
  });
}
