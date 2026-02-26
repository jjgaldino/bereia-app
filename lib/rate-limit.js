// ============================================
// RATE LIMITER — Preparado mas DESATIVADO
// Para ativar: mude RATE_LIMIT_ENABLED para true
// ============================================

const RATE_LIMIT_ENABLED = false; // ← Mude para true quando quiser ativar
const MAX_REQUESTS_PER_DAY = 50; // consultas por IP por dia
const requestCounts = new Map();

// Limpa contadores à meia-noite
setInterval(() => {
  requestCounts.clear();
}, 24 * 60 * 60 * 1000);

export function checkRateLimit(ip) {
  if (!RATE_LIMIT_ENABLED) {
    return { allowed: true, remaining: Infinity };
  }

  const now = Date.now();
  const key = ip || "unknown";

  if (!requestCounts.has(key)) {
    requestCounts.set(key, { count: 0, resetAt: now + 24 * 60 * 60 * 1000 });
  }

  const entry = requestCounts.get(key);

  if (now > entry.resetAt) {
    entry.count = 0;
    entry.resetAt = now + 24 * 60 * 60 * 1000;
  }

  entry.count++;

  if (entry.count > MAX_REQUESTS_PER_DAY) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  return {
    allowed: true,
    remaining: MAX_REQUESTS_PER_DAY - entry.count,
  };
}
