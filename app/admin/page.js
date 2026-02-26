"use client";

import { useState, useEffect, useCallback } from "react";

// ─── SIMPLE BAR CHART ───
function BarChart({ data, label, color = "#5d4037", height = 120 }) {
  const entries = Object.entries(data);
  const max = Math.max(...entries.map(([, v]) => v), 1);
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">{label}</p>
      <div className="flex items-end gap-[2px]" style={{ height }}>
        {entries.map(([key, val]) => (
          <div key={key} className="flex-1 group relative flex flex-col items-center justify-end">
            <div
              className="w-full rounded-t transition-all hover:opacity-80"
              style={{ height: `${Math.max((val / max) * 100, 2)}%`, backgroundColor: color, minHeight: val > 0 ? 4 : 1 }}
            />
            <div className="hidden group-hover:block absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              {key.slice(5)}: {val}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-gray-400">{entries[0]?.[0]?.slice(5)}</span>
        <span className="text-[9px] text-gray-400">{entries[entries.length - 1]?.[0]?.slice(5)}</span>
      </div>
    </div>
  );
}

// ─── HOURLY CHART ───
function HourlyChart({ data }) {
  const max = Math.max(...data, 1);
  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">Visitas por Hora (últimas 24h)</p>
      <div className="flex items-end gap-[2px]" style={{ height: 80 }}>
        {data.map((val, i) => (
          <div key={i} className="flex-1 group relative flex flex-col items-center justify-end">
            <div
              className="w-full rounded-t transition-all hover:opacity-80 bg-indigo-500"
              style={{ height: `${Math.max((val / max) * 100, 2)}%`, minHeight: val > 0 ? 3 : 1 }}
            />
            <div className="hidden group-hover:block absolute -top-8 bg-gray-900 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap z-10">
              {String(i).padStart(2, "0")}h: {val}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[9px] text-gray-400">00h</span>
        <span className="text-[9px] text-gray-400">12h</span>
        <span className="text-[9px] text-gray-400">23h</span>
      </div>
    </div>
  );
}

// ─── GEO MAP — Dark theme with glowing dots ───
function GeoMap({ points }) {
  if (!points?.length) return <p className="text-xs text-gray-400 italic">Aguardando dados de geolocalização...</p>;
  const w = 1000, h = 460;
  const project = (lat, lon) => [((lon + 180) / 360) * w, ((90 - lat) / 180) * h];

  // Aggregate nearby points
  const seen = new Map();
  points.forEach(p => {
    const k = `${(p.lat).toFixed(1)}:${(p.lon).toFixed(1)}`;
    const prev = seen.get(k);
    seen.set(k, { ...p, count: (prev?.count || 0) + 1 });
  });
  const unique = [...seen.values()];

  // Create dot grid that roughly represents landmass
  // Using a coarse grid where each cell is ~10° lat/lon
  // Pre-computed land coordinates at ~5° grid (lat,lon pairs for land cells)
  const L = [
    // N.America
    [72,-165],[72,-155],[72,-145],[72,-135],[72,-125],[72,-115],[72,-105],[72,-95],[72,-85],[72,-75],[72,-65],
    [68,-168],[68,-158],[68,-148],[68,-138],[68,-128],[68,-118],[68,-108],[68,-98],[68,-88],[68,-78],[68,-68],[68,-58],
    [64,-168],[64,-158],[64,-148],[64,-138],[64,-128],[64,-118],[64,-108],[64,-98],[64,-88],[64,-78],[64,-68],[64,-58],
    [60,-162],[60,-152],[60,-142],[60,-132],[60,-122],[60,-112],[60,-102],[60,-92],[60,-82],[60,-72],[60,-62],
    [56,-132],[56,-122],[56,-112],[56,-102],[56,-92],[56,-82],[56,-72],[56,-62],
    [52,-128],[52,-118],[52,-108],[52,-98],[52,-88],[52,-78],[52,-68],[52,-58],
    [48,-125],[48,-118],[48,-108],[48,-98],[48,-88],[48,-78],[48,-68],[48,-58],
    [44,-124],[44,-118],[44,-108],[44,-98],[44,-88],[44,-78],[44,-68],
    [40,-124],[40,-118],[40,-108],[40,-98],[40,-88],[40,-78],
    [36,-122],[36,-115],[36,-108],[36,-98],[36,-88],[36,-78],
    [32,-117],[32,-110],[32,-102],[32,-95],[32,-88],[32,-82],
    [28,-112],[28,-105],[28,-98],[28,-92],[28,-85],[28,-80],
    [24,-108],[24,-102],[24,-95],[24,-88],[24,-82],
    [20,-105],[20,-100],[20,-95],[20,-90],[20,-87],
    [16,-98],[16,-92],[16,-88],[12,-85],
    // Caribbean
    [20,-76],[18,-72],[18,-66],
    // S.America
    [10,-72],[10,-68],[10,-64],[8,-72],[8,-68],[8,-62],
    [4,-77],[4,-72],[4,-68],[4,-62],[4,-55],[4,-52],
    [0,-78],[0,-72],[0,-68],[0,-62],[0,-55],[0,-52],[0,-50],
    [-4,-78],[-4,-72],[-4,-68],[-4,-62],[-4,-55],[-4,-50],[-4,-45],[-4,-40],[-4,-36],
    [-8,-76],[-8,-72],[-8,-65],[-8,-58],[-8,-52],[-8,-45],[-8,-38],[-8,-35],
    [-12,-76],[-12,-70],[-12,-65],[-12,-58],[-12,-52],[-12,-45],[-12,-40],
    [-16,-72],[-16,-68],[-16,-62],[-16,-55],[-16,-48],[-16,-42],
    [-20,-68],[-20,-62],[-20,-55],[-20,-48],[-20,-42],
    [-24,-68],[-24,-62],[-24,-55],[-24,-48],[-24,-45],
    [-28,-66],[-28,-60],[-28,-55],[-28,-50],
    [-32,-70],[-32,-65],[-32,-58],[-32,-52],
    [-36,-72],[-36,-68],[-36,-60],[-36,-55],
    [-40,-72],[-40,-68],[-40,-62],[-44,-72],[-44,-68],
    [-48,-74],[-48,-70],[-52,-70],[-52,-68],[-55,-68],
    // Europe
    [68,15],[68,25],[68,35],
    [64,6],[64,12],[64,18],[64,25],[64,30],
    [60,5],[60,10],[60,18],[60,25],[60,30],
    [56,-8],[56,-2],[56,5],[56,10],[56,15],[56,22],[56,30],[56,38],
    [52,-10],[52,-5],[52,2],[52,8],[52,14],[52,20],[52,28],[52,36],
    [48,-5],[48,2],[48,8],[48,14],[48,20],[48,28],[48,36],
    [44,0],[44,6],[44,12],[44,18],[44,24],[44,30],
    [40,-8],[40,0],[40,8],[40,15],[40,22],[40,28],
    [36,-8],[36,0],[36,12],[36,22],[36,28],
    // Africa
    [32,-5],[32,2],[32,8],[32,15],[32,25],[32,32],
    [28,-14],[28,-8],[28,0],[28,8],[28,15],[28,25],[28,32],
    [24,-16],[24,-10],[24,-4],[24,2],[24,8],[24,15],[24,25],[24,32],
    [20,-16],[20,-10],[20,-4],[20,2],[20,8],[20,15],[20,22],[20,30],[20,36],[20,42],
    [16,-16],[16,-10],[16,-4],[16,2],[16,8],[16,15],[16,25],[16,32],[16,38],[16,44],
    [12,-15],[12,-8],[12,-2],[12,5],[12,12],[12,20],[12,28],[12,35],[12,42],[12,48],
    [8,-12],[8,-5],[8,2],[8,8],[8,15],[8,25],[8,32],[8,38],[8,45],
    [4,-6],[4,5],[4,10],[4,18],[4,25],[4,32],[4,38],[4,42],
    [0,12],[0,18],[0,25],[0,32],[0,38],[0,42],
    [-4,12],[-4,18],[-4,25],[-4,32],[-4,38],
    [-8,14],[-8,22],[-8,28],[-8,34],[-8,40],
    [-12,18],[-12,25],[-12,32],[-12,38],[-12,45],
    [-16,18],[-16,25],[-16,32],[-16,38],[-16,45],
    [-20,22],[-20,28],[-20,35],[-20,42],[-20,48],
    [-24,22],[-24,28],[-24,35],[-24,45],
    [-28,18],[-28,25],[-28,30],
    [-32,18],[-32,25],[-32,30],
    // Mid East + Central Asia
    [36,36],[36,42],[36,48],[36,55],[36,62],[36,68],[36,72],
    [32,36],[32,42],[32,48],[32,55],[32,62],[32,68],[32,75],
    [28,36],[28,42],[28,48],[28,55],[28,62],[28,68],[28,75],[28,82],[28,88],
    // East/South/SE Asia
    [48,42],[48,52],[48,62],[48,72],[48,82],[48,88],[48,95],[48,105],[48,115],[48,125],[48,132],[48,138],
    [44,36],[44,42],[44,52],[44,62],[44,72],[44,82],[44,92],[44,105],[44,115],[44,125],[44,132],
    [40,32],[40,42],[40,52],[40,62],[40,72],[40,82],[40,92],[40,102],[40,112],[40,118],[40,125],
    [36,78],[36,85],[36,92],[36,100],[36,108],[36,115],[36,122],[36,128],[36,135],[36,140],
    [32,78],[32,85],[32,92],[32,100],[32,108],[32,115],[32,120],[32,130],
    [28,78],[28,85],[28,92],[28,98],[28,105],[28,112],[28,118],
    [24,55],[24,62],[24,68],[24,75],[24,82],[24,88],[24,95],[24,102],[24,108],
    [20,72],[20,78],[20,85],[20,92],[20,98],[20,105],[20,108],
    [16,75],[16,80],[16,98],[16,102],[16,108],
    [12,76],[12,80],[12,100],[12,105],[12,108],
    [8,78],[8,80],[8,100],[8,108],[8,115],
    [4,98],[4,102],[4,108],[4,115],
    [0,102],[0,108],[0,115],[0,120],[0,128],[0,135],
    [-4,105],[-4,110],[-4,118],[-4,125],[-4,132],[-4,138],
    [-8,108],[-8,115],[-8,122],[-8,130],[-8,138],[-8,142],
    // Australia
    [-12,130],[-12,135],[-12,142],
    [-16,122],[-16,128],[-16,135],[-16,142],[-16,145],
    [-20,118],[-20,125],[-20,132],[-20,138],[-20,145],[-20,148],
    [-24,115],[-24,122],[-24,128],[-24,135],[-24,142],[-24,148],[-24,152],
    [-28,115],[-28,122],[-28,128],[-28,135],[-28,142],[-28,148],[-28,152],
    [-32,118],[-32,125],[-32,135],[-32,142],[-32,148],[-32,152],
    [-36,140],[-36,145],[-36,148],
    // NZ
    [-38,175],[-42,172],[-44,170],
    // Japan
    [36,136],[36,140],[32,131],
  ];
  const landDots = L.map(([lat, lon]) => project(lat, lon));

  return (
    <div>
      <p className="text-xs text-gray-500 mb-2 font-medium">Mapa de Visitantes</p>
      <div className="rounded-xl overflow-hidden border border-gray-700">
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{ background: "#0f172a" }}>
          {/* Land mass as dot matrix */}
          {landDots.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.5" fill="#334155" />
          ))}
          {/* Visitor points with glow */}
          {unique.map((p, i) => {
            const [x, y] = project(p.lat, p.lon);
            const r = Math.min(3 + p.count, 10);
            const city = p.city ? (p.city.includes("%") ? decodeURIComponent(p.city) : p.city) : "?";
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={r * 4} fill="#f97316" fillOpacity="0.06">
                  <animate attributeName="fillOpacity" values="0.06;0.12;0.06" dur="2.5s" repeatCount="indefinite" />
                </circle>
                <circle cx={x} cy={y} r={r * 2} fill="#f97316" fillOpacity="0.15" />
                <circle cx={x} cy={y} r={r} fill="#fb923c" fillOpacity="0.6" />
                <circle cx={x} cy={y} r={r * 0.4} fill="#fde68a" fillOpacity="0.9" />
                <title>{city}, {p.country} · {p.count} visita(s)</title>
              </g>
            );
          })}
        </svg>
      </div>
      <p className="text-[9px] text-gray-400 mt-1 text-right">{unique.length} local(is) · {points.length} visita(s)</p>
    </div>
  );
}

// ─── STAT CARD ───
function Stat({ label, value, sub, color = "text-gray-900", icon }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex items-center gap-2 mb-1">
        {icon && <span className="text-lg">{icon}</span>}
        <p className="text-[11px] text-gray-500 font-medium uppercase tracking-wider">{label}</p>
      </div>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── MAIN DASHBOARD ───
export default function AdminDashboard() {
  const [key, setKey] = useState("");
  const [authed, setAuthed] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchData = useCallback(async (adminKey) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/analytics?key=${encodeURIComponent(adminKey || key)}`);
      if (!res.ok) {
        if (res.status === 401) { setAuthed(false); setError("Chave inválida"); return; }
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json._setup) {
        setError(json.error);
        setAuthed(true);
        setData(null);
        return;
      }
      setData(json);
      setAuthed(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [key]);

  // Auto refresh every 30s
  useEffect(() => {
    if (!authed || !autoRefresh) return;
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [authed, autoRefresh, fetchData]);

  // Check URL param for key
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const k = params.get("key");
    if (k) {
      setKey(k);
      fetchData(k);
    }
  }, []);

  // ─── LOGIN ───
  if (!authed) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-3xl mb-3">🔒</div>
          <h1 className="text-xl font-bold text-gray-900 mb-1">BEREIA Admin</h1>
          <p className="text-sm text-gray-500 mb-6">Dashboard de Analytics</p>
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchData()}
            placeholder="Chave de acesso"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={() => fetchData()}
            disabled={loading || !key}
            className="w-full py-3 bg-gray-900 text-white rounded-xl font-semibold text-sm disabled:opacity-50 active:scale-95 transition-transform"
          >
            {loading ? "Verificando..." : "Acessar"}
          </button>
          {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
          <a href="https://bereiaestudos.com.br" className="block mt-6 text-xs text-gray-400 underline">← Voltar ao BEREIA</a>
        </div>
      </div>
    );
  }

  // ─── DASHBOARD ───
  const d = data;
  const uptime = d ? `${Math.floor(d.server_uptime_ms / 3600000)}h ${Math.floor((d.server_uptime_ms % 3600000) / 60000)}m` : "—";

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg">📊</span>
            <div>
              <h1 className="text-sm font-bold text-gray-900">BEREIA Admin</h1>
              <p className="text-[10px] text-gray-400">Dashboard de Analytics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 text-[11px] text-gray-500">
              <input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} className="rounded" />
              Auto (30s)
            </label>
            <button onClick={() => fetchData()} className="px-3 py-1.5 bg-gray-100 rounded-lg text-xs font-medium text-gray-700 active:bg-gray-200">
              {loading ? "..." : "↻ Atualizar"}
            </button>
            <a href="https://bereiaestudos.com.br" className="text-[11px] text-gray-400 underline">← BEREIA</a>
          </div>
        </div>
      </header>

      {!d ? (
        <div className="flex items-center justify-center h-64 px-4">
          {error ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 max-w-lg text-center">
              <p className="text-2xl mb-2">⚠️</p>
              <p className="text-sm text-amber-800 font-medium mb-3">{error}</p>
              <div className="text-xs text-amber-700 text-left bg-amber-100 rounded-lg p-4 font-mono">
                <p className="font-bold mb-2">Setup em 3 passos:</p>
                <p>1. Crie uma conta em <a href="https://upstash.com" target="_blank" className="underline">upstash.com</a></p>
                <p>2. Crie um banco Redis (gratuito)</p>
                <p>3. Adicione no Vercel:</p>
                <p className="mt-1 pl-3">UPSTASH_REDIS_REST_URL=...</p>
                <p className="pl-3">UPSTASH_REDIS_REST_TOKEN=...</p>
              </div>
            </div>
          ) : (
            <p className="text-gray-400">Carregando...</p>
          )}
        </div>
      ) : (
        <main className="max-w-6xl mx-auto p-4 space-y-6">

          {/* ─── REALTIME + OVERVIEW ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            <Stat icon="🟢" label="Online agora" value={d.realtime.online_now} color="text-green-600" />
            <Stat icon="👁" label="Visitas totais" value={d.overview.total_visits.toLocaleString()} />
            <Stat icon="👤" label="Visitantes únicos" value={d.overview.unique_visitors.toLocaleString()} />
            <Stat icon="🔍" label="Buscas totais" value={d.overview.total_searches.toLocaleString()} />
            <Stat icon="💾" label="Cache hit rate" value={`${d.overview.cache_hit_rate}%`} sub={`${d.overview.cached_searches} em cache`} />
            <Stat icon="⚡" label="Tempo médio" value={`${d.overview.avg_response_ms}ms`} sub="resposta API" />
          </div>

          {/* ─── API COSTS ─── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Stat icon="💰" label="Custo total" value={`$${d.costs.total_cost_usd}`} color="text-amber-700" sub={d.costs.model} />
            <Stat icon="📅" label="Custo hoje" value={`$${d.costs.today_cost_usd}`} color="text-amber-600" />
            <Stat icon="📥" label="Tokens input" value={d.costs.total_tokens_in.toLocaleString()} sub={d.costs.rate_input} />
            <Stat icon="📤" label="Tokens output" value={d.costs.total_tokens_out.toLocaleString()} sub={d.costs.rate_output} />
          </div>

          {/* ─── CHARTS ROW ─── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <BarChart data={d.charts.visits_by_day} label="Visitas por Dia (30 dias)" color="#6366f1" height={100} />
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <BarChart data={d.charts.searches_by_day} label="Buscas por Dia (30 dias)" color="#f59e0b" height={100} />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <HourlyChart data={d.charts.hourly_distribution} />
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-2 font-medium">Idiomas das Buscas</p>
              <div className="space-y-2">
                {Object.entries(d.languages).map(([lang, count]) => {
                  const total = Object.values(d.languages).reduce((s, v) => s + v, 0);
                  const pct = total ? ((count / total) * 100).toFixed(1) : 0;
                  return (
                    <div key={lang} className="flex items-center gap-2">
                      <span className="text-xs font-mono w-12 text-gray-600">{lang}</span>
                      <div className="flex-1 bg-gray-100 rounded-full h-4 overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-gray-500 w-16 text-right">{count} ({pct}%)</span>
                    </div>
                  );
                })}
                {Object.keys(d.languages).length === 0 && <p className="text-xs text-gray-400 italic">Sem dados ainda</p>}
              </div>
            </div>
          </div>

          {/* ─── GEO ─── */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="md:col-span-2 bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <GeoMap points={d.geo.points} />
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-3 font-medium">Top Países</p>
              <div className="space-y-1.5 mb-4">
                {d.geo.countries.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-xs text-gray-700">{c.country}</span>
                    <span className="text-xs font-bold text-gray-900">{c.visits}</span>
                  </div>
                ))}
                {d.geo.countries.length === 0 && <p className="text-xs text-gray-400 italic">Sem dados</p>}
              </div>
              <p className="text-xs text-gray-500 mb-3 font-medium border-t pt-3">Top Cidades</p>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {d.geo.cities.map((c, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-600 truncate mr-2">{c.city}</span>
                    <span className="text-[11px] font-bold text-gray-800 shrink-0">{c.visits}</span>
                  </div>
                ))}
                {d.geo.cities.length === 0 && <p className="text-xs text-gray-400 italic">Sem dados</p>}
              </div>
            </div>
          </div>

          {/* ─── TOP TERMS + RECENT SEARCHES ─── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-3 font-medium">🔥 Termos Mais Buscados</p>
              <div className="space-y-1.5">
                {d.top_terms.map((t, i) => {
                  const maxCount = d.top_terms[0]?.count || 1;
                  return (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400 w-5 text-right font-mono">#{i + 1}</span>
                      <div className="flex-1 relative">
                        <div className="bg-gray-100 rounded h-6 overflow-hidden">
                          <div className="h-full bg-amber-100 rounded transition-all" style={{ width: `${(t.count / maxCount) * 100}%` }} />
                        </div>
                        <span className="absolute inset-0 flex items-center px-2 text-[11px] text-gray-700 truncate">{t.term}</span>
                      </div>
                      <span className="text-[11px] font-bold text-gray-600 w-8 text-right">{t.count}</span>
                    </div>
                  );
                })}
                {d.top_terms.length === 0 && <p className="text-xs text-gray-400 italic">Sem buscas ainda</p>}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
              <p className="text-xs text-gray-500 mb-3 font-medium">🕐 Buscas Recentes</p>
              <div className="space-y-1 max-h-[400px] overflow-y-auto">
                {d.recent_searches.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-gray-50 last:border-0">
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-gray-800 truncate font-medium">{s.query}</p>
                      <p className="text-[10px] text-gray-400">
                        {new Date(s.time).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        {" · "}{s.lang}
                        {s.cached ? " · 💾 cache" : ` · ${s.ms}ms · $${s.cost}`}
                      </p>
                    </div>
                  </div>
                ))}
                {d.recent_searches.length === 0 && <p className="text-xs text-gray-400 italic">Sem buscas ainda</p>}
              </div>
            </div>
          </div>

          {/* ─── SERVER INFO ─── */}
          <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
            <p className="text-xs text-gray-500 mb-2 font-medium">🖥️ Servidor</p>
            <div className="flex flex-wrap gap-4 text-[11px] text-gray-600">
              <span>Uptime: <strong>{uptime}</strong></span>
              <span>Modelo: <strong>{d.costs.model}</strong></span>
              <span>Cache: <strong>{d.overview.cached_searches} hits</strong></span>
              <span>Hit rate: <strong>{d.overview.cache_hit_rate}%</strong></span>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] text-gray-400 pb-8">
            BEREIA Admin Dashboard · bereiaestudos.com.br · Dados em memória (resetam com deploy)
          </p>
        </main>
      )}
    </div>
  );
}
