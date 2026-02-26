// ─── BEREIA Local Storage ───────────────────────
// Persists user progress without login/server
// All data stays on the user's device only

const PREFIX = "bereia_";

function get(key) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(PREFIX + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed.value;
  } catch {
    return null;
  }
}

function set(key, value) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify({
      value,
      updatedAt: new Date().toISOString(),
    }));
  } catch {
    // localStorage full or unavailable — fail silently
  }
}

function remove(key) {
  if (typeof window === "undefined") return;
  localStorage.removeItem(PREFIX + key);
}

// ─── Specific helpers ────────────────────────────

// Vocational quiz result
export function saveQuizResult(result) {
  set("quiz_result", result);
}

export function getQuizResult() {
  return get("quiz_result");
}

export function clearQuizResult() {
  remove("quiz_result");
}

// Language preference
export function saveLang(lang) {
  set("lang", lang);
}

export function getSavedLang() {
  return get("lang");
}

// Search history (last 20)
export function addToHistory(query, lang) {
  const history = getHistory();
  // Don't duplicate consecutive
  if (history.length > 0 && history[0].query === query) return;
  history.unshift({ query, lang, date: new Date().toISOString() });
  // Keep last 20
  set("history", history.slice(0, 20));
}

export function getHistory() {
  return get("history") || [];
}

export function clearHistory() {
  remove("history");
}

// Favorite responses (save full response with query)
export function addFavorite(query, data) {
  const favs = getFavorites();
  // Don't duplicate
  if (favs.some((f) => f.query === query)) return;
  favs.unshift({ query, data, date: new Date().toISOString() });
  set("favorites", favs.slice(0, 50));
}

export function removeFavorite(query) {
  const favs = getFavorites().filter((f) => f.query !== query);
  set("favorites", favs);
}

export function getFavorites() {
  return get("favorites") || [];
}

export function isFavorite(query) {
  return getFavorites().some((f) => f.query === query);
}

// Clear all BEREIA data
export function clearAll() {
  if (typeof window === "undefined") return;
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
