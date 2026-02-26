// ============================================
// BEREIA ANALYTICS ENGINE — Upstash Redis
// Dados persistem entre deploys e cold starts
// Heartbeats ficam em memória (tempo real, ok perder)
// ============================================

import { Redis } from "@upstash/redis";

// ─── REDIS CLIENT ───
let redis = null;
function getRedis() {
  if (redis) return redis;
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null;
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });
  return redis;
}

// ─── CONFIG ───
const ONLINE_THRESHOLD = 3 * 60 * 1000;
const COST_PER_1K_INPUT = 0.00015;
const COST_PER_1K_OUTPUT = 0.0006;

// ─── IN-MEMORY (apenas heartbeats) ───
const heartbeats = new Map();

function today() {
  return new Date().toISOString().split("T")[0];
}

function parseGeo(headers) {
  const decodeHeader = (val) => { try { return decodeURIComponent(val || "??"); } catch { return val || "??"; } };
  return {
    country: headers.get("x-vercel-ip-country") || "??",
    region: decodeHeader(headers.get("x-vercel-ip-country-region")),
    city: decodeHeader(headers.get("x-vercel-ip-city")),
    lat: headers.get("x-vercel-ip-latitude") || null,
    lon: headers.get("x-vercel-ip-longitude") || null,
  };
}

// ─── TRACK VISIT ───
export async function trackVisit(headers, path = "/", lang = "pt-BR") {
  const r = getRedis();
  if (!r) return;

  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const geo = parseGeo(headers);
  const day = today();
  const hour = new Date().getHours().toString();

  heartbeats.set(ip, Date.now());

  const pipe = r.pipeline();
  pipe.incr(`bereia:visits:${day}`);
  pipe.sadd(`bereia:ips:${day}`, ip);
  pipe.hincrby("bereia:totals", "visits", 1);
  pipe.hincrby(`bereia:hourly:${day}`, hour, 1);
  if (geo.country !== "??") pipe.zincrby("bereia:countries", 1, geo.country);
  if (geo.city !== "??") pipe.zincrby("bereia:cities", 1, `${geo.city}, ${geo.region} (${geo.country})`);
  if (geo.lat && geo.lon) {
    pipe.lpush("bereia:geopoints", JSON.stringify({ lat: parseFloat(geo.lat), lon: parseFloat(geo.lon), city: geo.city, country: geo.country }));
    pipe.ltrim("bereia:geopoints", 0, 299);
  }
  pipe.sadd("bereia:all_ips", ip);

  await pipe.exec().catch(e => console.error("Analytics track error:", e));
}

// ─── TRACK HEARTBEAT ───
export function trackHeartbeat(headers) {
  const ip = headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  heartbeats.set(ip, Date.now());
}

// ─── TRACK SEARCH ───
export async function trackSearch({ query, lang, ip, cached, usage, response_ms }) {
  const r = getRedis();
  if (!r) return;

  const tokens_in = usage?.prompt_tokens || 0;
  const tokens_out = usage?.completion_tokens || 0;
  const cost = cached ? 0 : ((tokens_in / 1000) * COST_PER_1K_INPUT) + ((tokens_out / 1000) * COST_PER_1K_OUTPUT);
  const day = today();

  const pipe = r.pipeline();
  pipe.incr(`bereia:searches:${day}`);
  pipe.hincrby("bereia:totals", "searches", 1);
  if (cached) pipe.hincrby("bereia:totals", "cached", 1);
  pipe.hincrbyfloat("bereia:totals", "cost", cost);
  pipe.hincrby("bereia:totals", "tokens_in", tokens_in);
  pipe.hincrby("bereia:totals", "tokens_out", tokens_out);
  if (!cached && response_ms > 0) {
    pipe.hincrby("bereia:totals", "avg_ms_sum", response_ms);
    pipe.hincrby("bereia:totals", "avg_ms_count", 1);
  }
  pipe.hincrbyfloat("bereia:daycost", day, cost);
  pipe.zincrby("bereia:terms", 1, query.substring(0, 200).toLowerCase().trim());
  pipe.hincrby("bereia:langs", lang, 1);
  pipe.lpush("bereia:recent", JSON.stringify({
    time: new Date().toISOString(),
    query: query.substring(0, 200),
    lang, cached: !!cached,
    cost: cost.toFixed(6),
    ms: response_ms || 0,
  }));
  pipe.ltrim("bereia:recent", 0, 99);

  await pipe.exec().catch(e => console.error("Analytics search error:", e));
}

// ─── GET ALL ANALYTICS ───
export async function getAnalytics() {
  const r = getRedis();
  if (!r) {
    return { error: "Redis não configurado. Adicione UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN nas variáveis de ambiente do Vercel.", _setup: true };
  }

  const now = Date.now();
  const day = today();

  // Online (in-memory)
  let onlineCount = 0;
  for (const [, lastSeen] of heartbeats) {
    if (now - lastSeen < ONLINE_THRESHOLD) onlineCount++;
  }

  // Fetch from Redis
  const pipe = r.pipeline();
  pipe.hgetall("bereia:totals");                    // 0
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now - i * 86400000).toISOString().split("T")[0];
    days.push(d);
    pipe.get(`bereia:visits:${d}`);                  // 1..60 (2 per day)
    pipe.get(`bereia:searches:${d}`);
  }
  pipe.scard("bereia:all_ips");                      // 61
  pipe.scard(`bereia:ips:${day}`);                   // 62
  pipe.zrange("bereia:terms", 0, 19, { rev: true, withScores: true });     // 63
  pipe.zrange("bereia:countries", 0, 14, { rev: true, withScores: true }); // 64
  pipe.zrange("bereia:cities", 0, 14, { rev: true, withScores: true });    // 65
  pipe.lrange("bereia:geopoints", 0, 199);          // 66
  pipe.lrange("bereia:recent", 0, 49);              // 67
  pipe.hgetall("bereia:langs");                      // 68
  pipe.hgetall(`bereia:hourly:${day}`);              // 69
  pipe.hget("bereia:daycost", day);                  // 70

  const results = await pipe.exec();

  let idx = 0;
  const totals = results[idx++] || {};

  const visitsByDay = {};
  const searchesByDay = {};
  for (const d of days) {
    visitsByDay[d] = parseInt(results[idx++]) || 0;
    searchesByDay[d] = parseInt(results[idx++]) || 0;
  }

  const uniqueVisitors = parseInt(results[idx++]) || 0;
  const todayUniqueIps = parseInt(results[idx++]) || 0;

  // Sorted sets: Upstash returns [{member,score},...] or flat array depending on version
  function parseSortedSet(raw) {
    if (!raw || !Array.isArray(raw)) return [];
    // Check if it's [{member,score},...] format
    if (raw.length > 0 && typeof raw[0] === "object" && raw[0].member !== undefined) {
      return raw.map(r => ({ key: r.member, val: parseInt(r.score) || 0 }));
    }
    // Flat array: [member, score, member, score, ...]
    const out = [];
    for (let i = 0; i < raw.length; i += 2) {
      out.push({ key: raw[i], val: parseInt(raw[i + 1]) || 0 });
    }
    return out;
  }

  const topTerms = parseSortedSet(results[idx++]).map(r => ({ term: r.key, count: r.val }));
  const topCountries = parseSortedSet(results[idx++]).map(r => ({ country: r.key, visits: r.val }));
  const topCities = parseSortedSet(results[idx++]).map(r => ({ city: r.key, visits: r.val }));

  const geoPointsRaw = results[idx++] || [];
  const geoPoints = geoPointsRaw.map(p => {
    try { return typeof p === "string" ? JSON.parse(p) : p; } catch { return null; }
  }).filter(Boolean);

  const recentRaw = results[idx++] || [];
  const recentSearches = recentRaw.map(s => {
    try { return typeof s === "string" ? JSON.parse(s) : s; } catch { return null; }
  }).filter(Boolean);

  const langs = results[idx++] || {};

  const hourlyRaw = results[idx++] || {};
  const hourly = Array(24).fill(0);
  Object.entries(hourlyRaw).forEach(([h, c]) => { hourly[parseInt(h)] = parseInt(c) || 0; });

  const todayCost = parseFloat(results[idx++]) || 0;

  // Computed
  const totalSearches = parseInt(totals.searches) || 0;
  const cachedCount = parseInt(totals.cached) || 0;
  const totalCost = parseFloat(totals.cost) || 0;
  const avgMsSum = parseInt(totals.avg_ms_sum) || 0;
  const avgMsCount = parseInt(totals.avg_ms_count) || 0;

  return {
    realtime: { online_now: onlineCount, today_unique_ips: todayUniqueIps },
    overview: {
      total_visits: parseInt(totals.visits) || 0,
      total_searches: totalSearches,
      unique_visitors: uniqueVisitors,
      cached_searches: cachedCount,
      cache_hit_rate: totalSearches ? ((cachedCount / totalSearches) * 100).toFixed(1) : "0.0",
      avg_response_ms: avgMsCount > 0 ? Math.round(avgMsSum / avgMsCount) : 0,
    },
    costs: {
      total_cost_usd: totalCost.toFixed(6),
      today_cost_usd: todayCost.toFixed(6),
      total_tokens_in: parseInt(totals.tokens_in) || 0,
      total_tokens_out: parseInt(totals.tokens_out) || 0,
      model: "gpt-4o-mini",
      rate_input: `$${COST_PER_1K_INPUT}/1K`,
      rate_output: `$${COST_PER_1K_OUTPUT}/1K`,
    },
    charts: { visits_by_day: visitsByDay, searches_by_day: searchesByDay, hourly_distribution: hourly },
    top_terms: topTerms,
    languages: langs,
    geo: { countries: topCountries, cities: topCities, points: geoPoints },
    recent_searches: recentSearches,
    server_uptime_ms: process.uptime() * 1000,
  };
}
