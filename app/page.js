"use client";

import { useState, useEffect, useCallback } from "react";
import { translations } from "@/lib/i18n";
import { curiosities } from "@/lib/curiosities";
import { quizQuestions, profiles } from "@/lib/quiz-data";
import { saveQuizResult, getQuizResult, clearQuizResult, saveLang, getSavedLang, addToHistory, getHistory, clearHistory } from "@/lib/storage";

// ─── SVG ICONS (replace emojis) ─────────────────
const Icon = ({ d, size = 18, color = "#5d4037", fill = "none" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);

const Icons = {
  book: (p) => <Icon {...p} d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20M8 7h6M8 11h4" />,
  scroll: (p) => <Icon {...p} d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4M19 17V5a2 2 0 0 0-2-2H4" />,
  search: (p) => (<svg width={p?.size||18} height={p?.size||18} viewBox="0 0 24 24" fill="none" stroke={p?.color||"#5d4037"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>),
  seedling: (p) => <Icon {...p} d="M12 22V10M6 13c0-3.5 2.7-6 6-6M18 5c0 3.5-2.7 6-6 6" />,
  chat: (p) => <Icon {...p} d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />,
  temple: (p) => <Icon {...p} d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6" />,
  library: (p) => <Icon {...p} d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H8M18 2h2v20H6.5a2.5 2.5 0 0 1 0-5H20M12 2v20" />,
  users: (p) => <Icon {...p} d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />,
  key: (p) => <Icon {...p} d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />,
  link: (p) => <Icon {...p} d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />,
  bulb: (p) => <Icon {...p} d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5M9 18h6M10 22h4" />,
  warning: (p) => <Icon {...p} color={p?.color||"#e65100"} d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3M12 9v4M12 17h.01" />,
  hands: (p) => <Icon {...p} d="M18 11V6a2 2 0 0 0-4 0M14 10V4a2 2 0 0 0-4 0v2M10 10.5V6a2 2 0 0 0-4 0v8M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-5.9-2.7L3.3 16c-.8-1.1-.3-2.5.9-2.9a2 2 0 0 1 2.5.9L8 16" />,
  compass: (p) => (<svg width={p?.size||18} height={p?.size||18} viewBox="0 0 24 24" fill="none" stroke={p?.color||"#5d4037"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="#5d403722" stroke={p?.color||"#5d4037"}/></svg>),
  question: (p) => (<svg width={p?.size||18} height={p?.size||18} viewBox="0 0 24 24" fill="none" stroke={p?.color||"#5d4037"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>),
  arrow: (p) => <Icon {...p} d="M5 12h14m-7-7 7 7-7 7" />,
};

// ─── COMPONENTS ──────────────────────────────────

function ResponseTypeBadge({ type, confidence, t, lang }) {
  const [showTip, setShowTip] = useState(false);
  const isPt = lang === "pt-BR";

  const config = {
    life_situation: {
      label: isPt ? "Resposta pastoral" : "Pastoral response",
      color: "bg-amber-50 text-amber-800 border-amber-200",
      icon: <Icons.hands size={13} color="#92400e" />,
      tip: isPt
        ? "Esta é uma situação sensível. O BEREIA oferece acolhimento bíblico com contexto e cuidado, mas não substitui aconselhamento pastoral ou profissional."
        : "This is a sensitive situation. BEREIA offers biblical care with context, but does not replace pastoral or professional counseling.",
    },
    reference: {
      label: isPt ? "Exegese textual" : "Textual exegesis",
      color: "bg-blue-50 text-blue-800 border-blue-200",
      icon: <Icons.scroll size={13} color="#1e40af" />,
      tip: isPt
        ? "Análise direta do texto bíblico com contexto histórico, literário e termos originais."
        : "Direct analysis of the biblical text with historical, literary context and original terms.",
    },
    question: {
      label: isPt
        ? (confidence === "high" ? "Consenso bíblico" : "Tema com diferentes leituras")
        : (confidence === "high" ? "Biblical consensus" : "Topic with different readings"),
      color: confidence === "high"
        ? "bg-green-50 text-green-800 border-green-200"
        : "bg-purple-50 text-purple-800 border-purple-200",
      icon: confidence === "high"
        ? <Icons.search size={13} color="#166534" />
        : <Icons.search size={13} color="#6b21a8" />,
      tip: isPt
        ? (confidence === "high"
          ? "Este tema tem amplo consenso na interpretação cristã. Confira as leituras para ver nuances."
          : "Este tema permite diferentes leituras bíblicas. A aba 'Leituras do Texto' apresenta as principais interpretações.")
        : (confidence === "high"
          ? "This topic has broad biblical consensus. Check the readings tab for nuances."
          : "This topic allows different biblical readings. The 'Readings' tab shows the main interpretations."),
    },
    excerpt: {
      label: isPt ? "Análise de trecho" : "Passage analysis",
      color: "bg-indigo-50 text-indigo-800 border-indigo-200",
      icon: <Icons.book size={13} color="#3730a3" />,
      tip: isPt
        ? "Identificamos o trecho bíblico e analisamos com contexto completo, como se fosse uma referência direta."
        : "We identified the biblical passage and analyzed it with full context, as a direct reference.",
    },
  };

  const c = config[type] || config.question;

  return (
    <div className="relative">
      <button
        onClick={() => setShowTip(!showTip)}
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all active:scale-95 ${c.color}`}
      >
        {c.icon}
        {c.label}
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`ml-0.5 transition-transform ${showTip ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
      </button>
      {showTip && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 rounded-xl bg-white border border-bereia-300/50 shadow-lg shadow-bereia-950/10 z-10 animate-fade-in" style={{ minWidth: "260px", maxWidth: "calc(100vw - 48px)" }}>
          <p className="text-[12px] leading-relaxed text-bereia-800">{c.tip}</p>
          <button onClick={() => setShowTip(false)} className="mt-2 text-[11px] text-bereia-500 underline underline-offset-2">
            {isPt ? "Entendi" : "Got it"}
          </button>
        </div>
      )}
    </div>
  );
}

function Section({ icon, title, children }) {
  return (
    <div className="mb-5 animate-fade-in">
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-bereia-600 mb-2 flex items-center gap-2">
        {icon} {title}
      </h3>
      {children}
    </div>
  );
}

function KeyTerm({ term, original, meaning }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      onClick={() => setOpen(!open)}
      className={`p-3 rounded-xl cursor-pointer border transition-all mb-2 active:scale-[0.98] ${
        open ? "bg-bereia-100 border-bereia-400" : "bg-bereia-50 border-bereia-300/50"
      }`}
    >
      <div className="flex justify-between items-center gap-2">
        <div className="min-w-0">
          <span className="font-bold text-bereia-950 text-[13px]">{term}</span>
          {original && <span className="ml-1.5 text-[11px] text-bereia-600 italic font-serif">{original}</span>}
        </div>
        <span className={`text-[10px] text-bereia-500 transition-transform shrink-0 ${open ? "rotate-180" : ""}`}>▼</span>
      </div>
      {open && <p className="mt-2 text-[13px] leading-relaxed text-bereia-800 animate-fade-in">{meaning}</p>}
    </div>
  );
}

function PerspectiveCard({ tradition, reading, basis, index }) {
  const accents = ["border-l-blue-700", "border-l-purple-800", "border-l-teal-700", "border-l-orange-800"];
  const labels = ["text-blue-700", "text-purple-800", "text-teal-700", "text-orange-800"];
  return (
    <div className={`p-3.5 rounded-xl bg-white border border-gray-200 mb-2 border-l-4 ${accents[index % 4]}`}>
      <div className={`text-[11px] font-bold uppercase tracking-wide mb-1.5 ${labels[index % 4]}`}>{tradition}</div>
      <p className="text-[13px] leading-relaxed text-gray-700">{reading}</p>
      <p className="text-[11px] text-gray-500 mt-1.5 italic">Base: {basis}</p>
    </div>
  );
}

function CuriosityCard({ curiosity, t }) {
  const [flipped, setFlipped] = useState(false);
  return (
    <div onClick={() => setFlipped(!flipped)} className="cursor-pointer mb-4 active:scale-[0.99] transition-transform">
      <div className={`rounded-2xl border border-amber-200 p-4 transition-all ${
        flipped ? "bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-100/50" : "bg-gradient-to-br from-amber-50 to-yellow-50"
      }`}>
        <div className="flex items-center gap-2.5 mb-1.5">
          <span className="text-2xl">{curiosity.emoji}</span>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest text-orange-700">{t.sections.curiosity}</div>
            <div className="text-[9px] text-orange-600">{flipped ? t.sections.curiosityClose : t.sections.curiosityTap}</div>
          </div>
        </div>
        {flipped ? (
          <div className="animate-fade-in">
            <p className="text-[13px] leading-relaxed text-bereia-900 font-serif">{curiosity.fact}</p>
            <p className="text-[10px] text-bereia-500 mt-2 italic">{t.sections.source}: {curiosity.source_context || curiosity.source}</p>
          </div>
        ) : (
          <div className="h-8 flex items-center justify-center">
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse3" style={{ animationDelay: `${i * 0.2}s` }} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ErrorCard({ t, onRetry }) {
  return (
    <div className="max-w-lg mx-auto mt-8 px-4 text-center animate-fade-slide-up">
      <div className="bg-white rounded-2xl p-6 border border-red-100">
        <div className="text-3xl mb-3">😔</div>
        <h3 className="text-base font-bold text-bereia-950 mb-1">{t.error.title}</h3>
        <p className="text-[13px] text-bereia-600 mb-4">{t.error.desc}</p>
        <button onClick={onRetry} className="px-5 py-2.5 rounded-xl bg-bereia-800 text-white font-semibold text-[13px] active:scale-95 transition-transform">
          {t.error.retry}
        </button>
      </div>
    </div>
  );
}

// ─── LOADING ─────────────────────────────────────

function LoadingState({ t }) {
  return (
    <div className="max-w-lg mx-auto mt-12 text-center animate-fade-in px-4">
      <div className="relative w-12 h-12 mx-auto mb-4">
        <svg width="48" height="48" viewBox="0 0 48 48" className="animate-pulse">
          <path d="M8 40V12a4 4 0 0 1 4-4h10v32H12a4 4 0 0 1-4-4z" fill="#d7ccc8" stroke="#8d6e63" strokeWidth="1.5"/>
          <path d="M22 8h14a4 4 0 0 1 4 4v24a4 4 0 0 1-4 4H22V8z" fill="#efebe9" stroke="#8d6e63" strokeWidth="1.5"/>
          <path d="M26 16h6M26 22h8M26 28h5" stroke="#a1887f" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
      </div>
      <p className="text-[13px] text-bereia-600 font-medium">{t.search.loading}</p>
    </div>
  );
}

// ─── QUIZ ────────────────────────────────────────

function VocationalQuiz({ lang, t, onClose }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const questions = quizQuestions[lang];
  const profileData = profiles[lang];

  // Restore saved result on mount
  useEffect(() => {
    const saved = getQuizResult();
    if (saved) {
      // Rebuild result from saved profile keys using current language profiles
      const primary = profileData[saved.primaryKey];
      const secondary = saved.secondaryKey ? profileData[saved.secondaryKey] : null;
      if (primary) {
        setResult({ primary, secondary, primaryKey: saved.primaryKey });
      }
    }
  }, [lang, profileData]);

  const handleAnswer = (option) => {
    const newAnswers = [...answers, option.profiles];
    setAnswers(newAnswers);
    if (step + 1 >= questions.length) {
      const scores = {};
      newAnswers.flat().forEach((p) => { scores[p] = (scores[p] || 0) + 1; });
      const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
      const primaryKey = sorted[0][0];
      const secondaryKey = sorted[1] ? sorted[1][0] : null;
      const res = { primary: profileData[primaryKey], secondary: secondaryKey ? profileData[secondaryKey] : null, primaryKey };
      setResult(res);
      // Save to localStorage (just the keys, not full objects — so language switch works)
      saveQuizResult({ primaryKey, secondaryKey });
    } else {
      setStep(step + 1);
    }
  };

  const handleRedo = () => {
    setStep(0);
    setAnswers([]);
    setResult(null);
    clearQuizResult();
  };

  const progress = ((step + (result ? 1 : 0)) / questions.length) * 100;

  // ─── RESULT ───
  if (result) {
    const p = result.primary;
    const isPt = lang === "pt-BR";

    const pdfUrl = `/pdfs/${result.primaryKey}.pdf`;

    return (
      <div className="animate-fade-slide-up">
        <div className="rounded-2xl p-6 text-center text-white mb-5" style={{ background: `linear-gradient(135deg, ${p.color}ee, ${p.color}99)` }}>
          <div className="text-4xl mb-2">{p.emoji}</div>
          <h2 className="text-xl font-bold font-serif mb-1.5">{p.name}</h2>
          <p className="text-[13px] leading-relaxed opacity-90 max-w-sm mx-auto">{p.description}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bereia-300/50 mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{ color: p.color }}>{t.quiz.recommendedBooks}</h3>
          {p.books.map((b, i) => (
            <div key={i} className="p-3 rounded-xl bg-bereia-100 mb-2 border-l-[3px]" style={{ borderColor: p.color }}>
              <div className="text-[13px] font-bold text-bereia-950 mb-0.5">{b.book}</div>
              <div className="text-[12px] text-bereia-800 leading-relaxed">{b.why}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bereia-300/50 mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-bereia-600 mb-2">{t.quiz.readingPlan}</h3>
          <p className="text-[13px] leading-relaxed text-bereia-900 font-serif">{p.plan}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-bereia-300/50 mb-3">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-bereia-600 mb-2">{t.quiz.howToUse}</h3>
          <p className="text-[13px] leading-relaxed text-bereia-900">{p.style}</p>
        </div>

        {result.secondary && (
          <div className="bg-bereia-100 rounded-xl p-3 border border-bereia-300/50 mb-4">
            <p className="text-[11px] text-bereia-600 font-semibold mb-0.5">{t.quiz.secondaryProfile}: {result.secondary.emoji} {result.secondary.name}</p>
            <p className="text-[12px] text-bereia-800 leading-relaxed">{result.secondary.description}</p>
          </div>
        )}

        {/* PDF Download */}
        <a
          href={pdfUrl}
          download={`BEREIA_Plano_${p.name.replace(/\s+/g, "_")}.pdf`}
          className="w-full py-3 rounded-xl border-2 border-bereia-800 bg-white text-bereia-800 font-semibold text-[13px] active:scale-95 transition-transform min-h-[48px] mb-3 flex items-center justify-center gap-2"
        >
          <Icons.book size={16} color="#5d4037" />
          {isPt ? "Baixar Meu Plano (PDF)" : "Download My Plan (PDF)"}
        </a>

        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl text-white font-semibold text-[13px] active:scale-95 transition-transform min-h-[48px]" style={{ background: p.color }}>
            {t.quiz.startStudy}
          </button>
          <button onClick={handleRedo} className="py-3 px-4 rounded-xl border border-bereia-400 bg-white text-bereia-800 font-medium text-[13px] active:scale-95 transition-transform min-h-[48px]">
            {t.quiz.redo}
          </button>
        </div>
      </div>
    );
  }

  // ─── QUESTIONS ───
  const q = questions[step];
  return (
    <div className="animate-fade-slide-up">
      <div className="mb-5">
        <div className="flex justify-between mb-1.5">
          <span className="text-[11px] text-bereia-600 font-semibold">{t.quiz.questionOf.replace("{current}", step + 1).replace("{total}", questions.length)}</span>
          <span className="text-[11px] text-bereia-500">{Math.round(progress)}%</span>
        </div>
        <div className="h-1 bg-bereia-300 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-bereia-600 to-bereia-800 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h3 className="text-base font-semibold text-bereia-950 font-serif mb-4 leading-relaxed">{q.question}</h3>

      {q.options.map((opt, i) => (
        <button
          key={i}
          onClick={() => handleAnswer(opt)}
          className="block w-full p-3.5 mb-2 rounded-xl border border-bereia-300/50 bg-white text-left text-[13px] text-bereia-950 active:bg-bereia-100 active:scale-[0.98] transition-all leading-relaxed min-h-[48px]"
        >
          {opt.text}
        </button>
      ))}

      {step > 0 && (
        <button onClick={() => { setStep(step - 1); setAnswers(answers.slice(0, -1)); }} className="mt-1 px-3 py-2 text-bereia-500 text-[12px] active:text-bereia-700 min-h-[44px]">
          {t.quiz.back}
        </button>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────

export default function BereiaApp() {
  const [lang, setLang] = useState("pt-BR");
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState("context");
  const [view, setView] = useState("study");
  const [randomCuriosity, setRandomCuriosity] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  const t = translations[lang];

  // Restore saved language on mount
  useEffect(() => {
    const savedLang = getSavedLang();
    if (savedLang && (savedLang === "pt-BR" || savedLang === "en")) {
      setLang(savedLang);
    }
    setHistory(getHistory());
  }, []);

  // Analytics: track page view + heartbeat
  useEffect(() => {
    const track = (type) => fetch("/api/analytics/track", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ type, path: "/", lang }) }).catch(() => {});
    track("pageview");
    const hb = setInterval(() => track("heartbeat"), 60000);
    return () => clearInterval(hb);
  }, []);

  // Save language on change
  const handleLangSwitch = () => {
    const newLang = lang === "pt-BR" ? "en" : "pt-BR";
    setLang(newLang);
    saveLang(newLang);
  };

  useEffect(() => {
    const bank = curiosities[lang];
    setRandomCuriosity(bank[Math.floor(Math.random() * bank.length)]);
  }, [lang]);

  const handleSubmit = useCallback(async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    setData(null);
    setError(false);
    setActiveTab("context");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input.trim(), lang }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
      // Save to history
      addToHistory(input.trim(), lang);
      setHistory(getHistory());
    } catch (err) {
      console.error("Fetch error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [input, lang, loading]);

  // Helper: trigger a new search for any reference
  const searchRef = useCallback((ref) => {
    setInput(ref);
    setData(null);
    setActiveTab("context");
    setLoading(true);
    setError(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    fetch("/api/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: ref, lang }) })
      .then(res => res.json())
      .then(json => { if (json.error) throw new Error(json.error); setData(json); addToHistory(ref, lang); setHistory(getHistory()); })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [lang]);

  // Regex to detect Bible references like "Gn 1:1", "Salmo 23", "1 João 3:16-18", "Mateus 5:3-12", etc.
  const refPattern = /\b((?:1|2|3|I|II|III)\s*)?(?:Gênesis|Genesis|Gn|Êxodo|Exodo|Ex|Levítico|Levitico|Lv|Números|Numeros|Nm|Deuteronômio|Deuteronomio|Dt|Josué|Josue|Js|Juízes|Juizes|Jz|Rute|Rt|Samuel|Sm|Reis|Rs|Crônicas|Cronicas|Cr|Esdras|Ed|Neemias|Ne|Ester|Et|Jó|Job|Salmos?|Sl|Provérbios|Proverbios|Pv|Eclesiastes|Ec|Cantares|Ct|Isaías|Isaias|Is|Jeremias|Jr|Lamentações|Lm|Ezequiel|Ez|Daniel|Dn|Oséias|Oseias|Os|Joel|Jl|Amós|Amos|Am|Obadias|Ob|Jonas|Jn|Miquéias|Miqueias|Mq|Naum|Na|Habacuque|Hc|Sofonias|Sf|Ageu|Ag|Zacarias|Zc|Malaquias|Ml|Mateus|Mt|Marcos|Mc|Lucas|Lc|João|Joao|Jo|Atos|At|Romanos|Rm|Coríntios|Corintios|Co|Gálatas|Galatas|Gl|Efésios|Efesios|Ef|Filipenses|Fp|Colossenses|Cl|Tessalonicenses|Ts|Timóteo|Timoteo|Tm|Tito|Tt|Filemom|Fm|Hebreus|Hb|Tiago|Tg|Pedro|Pe|Judas|Jd|Apocalipse|Ap|Genesis|Exodus|Leviticus|Numbers|Deuteronomy|Joshua|Judges|Ruth|Kings|Chronicles|Ezra|Nehemiah|Esther|Psalms?|Proverbs|Ecclesiastes|Song\sof\sSolomon|Isaiah|Jeremiah|Lamentations|Ezekiel|Hosea|Amos|Obadiah|Jonah|Micah|Nahum|Habakkuk|Zephaniah|Haggai|Zechariah|Malachi|Matthew|Mark|Luke|John|Acts|Romans|Corinthians|Galatians|Ephesians|Philippians|Colossians|Thessalonians|Timothy|Titus|Philemon|Hebrews|James|Peter|Jude|Revelation)\s+\d+(?:[:.]\d+(?:\s*[-–]\s*\d+)?)?\b/gi;

  // Render text with clickable Bible references
  const TextWithRefs = ({ text, className = "" }) => {
    if (!text) return null;
    const parts = [];
    let lastIndex = 0;
    let match;
    const regex = new RegExp(refPattern.source, "gi");
    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) parts.push({ type: "text", value: text.slice(lastIndex, match.index) });
      parts.push({ type: "ref", value: match[0] });
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) parts.push({ type: "text", value: text.slice(lastIndex) });
    if (parts.length === 0) return <span className={className}>{text}</span>;
    return (
      <span className={className}>
        {parts.map((p, i) => p.type === "ref" ? (
          <button key={i} onClick={() => searchRef(p.value)} className="text-blue-700 underline underline-offset-2 font-semibold active:text-blue-900 cursor-pointer">{p.value}</button>
        ) : (
          <span key={i}>{p.value}</span>
        ))}
      </span>
    );
  };

  const r = data?.response;
  const m = data?.meta;
  // Bible text comes directly from the AI response now — no external API needed
  const bibleText = r?.bible_text || null;

  const tabs = [
    { id: "context", label: t.tabs.context, Ic: Icons.scroll },
    { id: "perspectives", label: t.tabs.perspectives, Ic: Icons.search },
    { id: "application", label: t.tabs.application, Ic: Icons.seedling },
    { id: "reflection", label: t.tabs.reflection, Ic: Icons.chat },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] pb-16">

      {/* ─── HEADER ─── */}
      <header className="pt-6 pb-3 px-4 text-center animate-fade-slide-up safe-top">
        <div className="inline-flex items-center gap-2 mb-1">
          <img src="/logo.png" alt="BEREIA" className="h-12 w-auto" />
          <h1 className="text-2xl font-bold text-bereia-950 font-serif tracking-tight">BEREIA</h1>
        </div>
        <p className="text-[10px] text-bereia-600 uppercase tracking-[0.15em] font-medium">{t.meta.subtitle}</p>
        <p className="text-[10px] text-bereia-500 mt-0.5 italic font-serif">{t.meta.tagline}</p>
        <button onClick={handleLangSwitch} className="mt-2 text-[11px] text-bereia-600 underline underline-offset-2 min-h-[36px] inline-flex items-center">
          {t.lang.switch}
        </button>
      </header>

      {/* ─── NAV ─── */}
      <div className="max-w-lg mx-auto mb-4 px-4 flex gap-2 animate-fade-slide-up">
        {[
          { key: "study", label: t.nav.study },
          { key: "quiz", label: t.nav.quiz },
        ].map((n) => (
          <button
            key={n.key}
            onClick={() => setView(n.key)}
            className={`flex-1 py-2.5 rounded-xl font-semibold text-[12px] transition-all active:scale-95 min-h-[44px] ${
              view === n.key
                ? "bg-bereia-800 text-white"
                : "bg-white text-bereia-800 border border-bereia-400"
            }`}
          >
            {n.label}
          </button>
        ))}
      </div>

      {/* ─── QUIZ VIEW ─── */}
      {view === "quiz" && (
        <div className="max-w-lg mx-auto mb-16 px-4 animate-fade-slide-up">
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-bereia-950/5 border border-bereia-300/50">
            <div className="text-center mb-5">
              <div className="flex justify-center">{Icons.compass({ size: 32, color: "#5d4037" })}</div>
              <h2 className="text-lg font-bold text-bereia-950 font-serif mt-2 mb-1">{t.quiz.title}</h2>
              <p className="text-[12px] text-bereia-600 leading-relaxed">{t.quiz.desc}</p>
            </div>
            <VocationalQuiz lang={lang} t={t} onClose={() => setView("study")} />
          </div>
        </div>
      )}

      {/* ─── STUDY VIEW ─── */}
      {view === "study" && (
        <>
          {/* Search bar */}
          <div className="max-w-lg mx-auto px-4 animate-fade-slide-up">
            <div className="bg-white rounded-2xl shadow-lg shadow-bereia-950/5 p-1.5 flex gap-1 border border-bereia-300/50">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                placeholder={t.search.placeholder}
                className="flex-1 min-w-0 border-none px-3 py-3 text-[14px] text-bereia-950 rounded-xl bg-transparent placeholder:text-bereia-500 focus:outline-none"
                enterKeyHint="search"
                autoComplete="off"
              />
              {input && (
                <button
                  onClick={() => { setInput(""); setData(null); setError(false); }}
                  className="px-2 text-bereia-400 active:text-bereia-700 self-center text-lg"
                  aria-label="Limpar"
                >
                  ✕
                </button>
              )}
              <button
                onClick={handleSubmit}
                disabled={loading || !input.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-br from-bereia-800 to-bereia-700 text-white text-[13px] font-semibold disabled:opacity-40 active:scale-95 transition-transform shrink-0 min-h-[44px]"
              >
                {loading ? "..." : t.search.button}
              </button>
            </div>

            {/* Quick examples */}
            {!data && !loading && !error && (
              <div className="mt-3 animate-fade-slide-up">
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {t.examples.map((ex, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(ex)}
                      className="px-3 py-1.5 rounded-full border border-bereia-400 bg-bereia-50 text-bereia-700 text-[11px] active:bg-bereia-200 transition-colors min-h-[32px]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                {/* Search history */}
                {history.length > 0 && (
                  <div className="mt-4">
                    <button
                      onClick={() => setShowHistory(!showHistory)}
                      className="text-[11px] text-bereia-500 flex items-center gap-1 mx-auto min-h-[32px]"
                    >
                      <Icons.book size={12} color="#8d6e63" />
                      {lang === "pt-BR" ? `Últimas consultas (${history.length})` : `Recent searches (${history.length})`}
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#8d6e63" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${showHistory ? "rotate-180" : ""}`}><path d="m6 9 6 6 6-6"/></svg>
                    </button>
                    {showHistory && (
                      <div className="mt-2 animate-fade-in space-y-1">
                        {history.slice(0, 8).map((h, i) => (
                          <button
                            key={i}
                            onClick={() => setInput(h.query)}
                            className="block w-full text-left px-3 py-2 rounded-lg bg-white border border-bereia-300/50 text-[12px] text-bereia-800 active:bg-bereia-100 transition-colors"
                          >
                            {h.query}
                          </button>
                        ))}
                        <button
                          onClick={() => { clearHistory(); setHistory([]); setShowHistory(false); }}
                          className="text-[10px] text-bereia-400 underline underline-offset-2 mx-auto block mt-2 min-h-[32px]"
                        >
                          {lang === "pt-BR" ? "Limpar histórico" : "Clear history"}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Loading */}
          {loading && <LoadingState t={t} />}

          {/* Error */}
          {error && <ErrorCard t={t} onRetry={handleSubmit} />}

          {/* ─── RESULTS ─── */}
          {data && r && (
            <div className="max-w-lg mx-auto mt-5 px-4 animate-fade-slide-up">

              {/* Response type badge */}
              <div className="flex gap-1.5 flex-wrap mb-3 items-start">
                <ResponseTypeBadge type={m.type} confidence={m.confidence} t={t} lang={lang} />
                {m.reference && (
                  <span className="px-2 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">{m.reference}</span>
                )}
              </div>

              {/* Summary */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-bereia-300/50 mb-4">
                <h2 className="text-lg font-bold text-bereia-950 font-serif mb-1 leading-snug">{m.theme}</h2>
                <p className="text-[13px] leading-relaxed text-bereia-900 font-serif"><TextWithRefs text={r.summary} /></p>
              </div>

              {/* Bible Text — only when reference exists */}
              {bibleText && bibleText.verses?.length > 0 && (
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-bereia-300/50 mb-4 border-l-4 border-l-amber-600">
                  <div className="flex items-center gap-2 mb-2">
                    <Icons.scroll size={16} color="#d97706" />
                    <span className="text-[11px] font-bold uppercase tracking-widest text-amber-700">{t.sections.bibleText}</span>
                    <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 font-medium">{bibleText.translation}</span>
                  </div>
                  <p className="text-[11px] font-semibold text-amber-800 mb-2">{bibleText.reference}</p>
                  <div className="space-y-1">
                    {bibleText.verses.map((v, i) => (
                      <p key={i} className="text-[13px] leading-relaxed text-bereia-900 font-serif">
                        <sup className="text-[9px] text-amber-600 font-bold mr-0.5">{v.number}</sup>
                        {v.text}
                      </p>
                    ))}
                  </div>
                  <p className="text-[9px] text-bereia-500 mt-2 italic">{t.sections.bibleTextNote}</p>
                </div>
              )}

              {/* What text says — dark card */}
              <div className="bg-gradient-to-br from-bereia-800 to-bereia-700 rounded-2xl p-4 mb-4">
                <p className="text-[10px] uppercase tracking-widest text-bereia-400 font-semibold mb-1.5">{t.sections.whatTextSays}</p>
                <p className="text-[13px] leading-relaxed text-bereia-50 font-serif"><TextWithRefs text={r.what_text_says} /></p>
              </div>

              {/* Curiosity */}
              {r.curiosity && <CuriosityCard curiosity={r.curiosity} t={t} />}

              {/* Tabs — scrollable on small screens */}
              <div className="flex gap-1 mb-4 bg-bereia-300/50 rounded-xl p-1 overflow-x-auto scrollbar-none">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[70px] py-2 px-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95 flex flex-col items-center gap-0.5 ${
                      activeTab === tab.id
                        ? "bg-white text-bereia-950 shadow-sm"
                        : "text-bereia-600"
                    }`}
                  >
                    <tab.Ic size={16} color={activeTab === tab.id ? "#3e2723" : "#8d6e63"} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="bg-white rounded-2xl p-4 shadow-sm border border-bereia-300/50 min-h-[180px] animate-fade-in">

                {activeTab === "context" && (
                  <>
                    <Section icon={<Icons.temple size={16} />} title={t.sections.historical}>
                      <p className="text-[13px] leading-relaxed text-bereia-900"><TextWithRefs text={r.context.historical} /></p>
                    </Section>
                    <Section icon={<Icons.library size={16} />} title={t.sections.literary}>
                      <p className="text-[13px] leading-relaxed text-bereia-900"><TextWithRefs text={r.context.literary} /></p>
                    </Section>
                    <Section icon={<Icons.users size={16} />} title={t.sections.audience}>
                      <p className="text-[13px] leading-relaxed text-bereia-900"><TextWithRefs text={r.context.original_audience} /></p>
                    </Section>
                    <Section icon={<Icons.key size={16} />} title={t.sections.keyTerms}>
                      {r.key_terms?.map((term, i) => <KeyTerm key={i} {...term} />)}
                    </Section>
                    <Section icon={<Icons.link size={16} />} title={t.sections.crossRefs}>
                      {r.cross_references?.map((cr, i) => (
                        <div key={i} className="py-2 border-b border-gray-100 last:border-0">
                          <button
                            onClick={() => searchRef(cr.ref)}
                            className="font-bold text-[12px] text-blue-700 block mb-0.5 underline underline-offset-2 active:text-blue-900"
                          >{cr.ref}</button>
                          <span className="text-[12px] text-gray-600 leading-relaxed"><TextWithRefs text={cr.connection} /></span>
                        </div>
                      ))}
                    </Section>
                  </>
                )}

                {activeTab === "perspectives" && (
                  <Section icon={<Icons.search size={16} />} title={t.sections.perspectives}>
                    <p className="text-[11px] text-bereia-600 mb-3 italic">{t.sections.perspectivesNote}</p>
                    {r.perspectives?.map((p, i) => <PerspectiveCard key={i} {...p} index={i} />)}
                  </Section>
                )}

                {activeTab === "application" && (
                  <>
                    <Section icon={<Icons.bulb size={16} />} title={t.sections.principle}>
                      <p className="text-[14px] leading-relaxed text-bereia-950 font-serif font-medium">{r.application?.principle}</p>
                    </Section>
                    <Section icon={<Icons.seedling size={16} />} title={t.sections.applicationToday}>
                      {r.application?.today?.map((item, i) => (
                        <p key={i} className="text-[13px] leading-relaxed text-bereia-900 mb-2.5 pl-3 border-l-[3px] border-green-300"><TextWithRefs text={item} /></p>
                      ))}
                    </Section>
                    <Section icon={<Icons.warning size={16} />} title={t.sections.caution}>
                      {r.application?.caution?.map((c, i) => (
                        <div key={i} className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 flex gap-2 mb-2 items-start">
                          <div className="shrink-0 mt-0.5"><Icons.warning size={14} /></div>
                          <span className="text-[12px] leading-relaxed text-orange-800"><TextWithRefs text={c} /></span>
                        </div>
                      ))}
                    </Section>
                  </>
                )}

                {activeTab === "reflection" && (
                  <>
                    <Section icon={<Icons.chat size={16} />} title={t.sections.reflection}>
                      {r.reflection?.map((q, i) => (
                        <div key={i} className="p-3 rounded-xl mb-2 bg-bereia-100 border border-bereia-300/50">
                          <p className="text-[13px] leading-relaxed text-bereia-950 font-serif italic">{q}</p>
                        </div>
                      ))}
                    </Section>
                    {r.prayer && (
                      <Section icon={<Icons.hands size={16} />} title={t.sections.prayer}>
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-bereia-100 to-bereia-200/50 border border-bereia-300/50">
                          <p className="text-[13px] leading-relaxed text-bereia-900 font-serif italic">{r.prayer}</p>
                        </div>
                      </Section>
                    )}
                    <Section icon={<Icons.book size={16} />} title={t.sections.goDeeper}>
                      {r.go_deeper?.map((s, i) => (
                        <button
                          key={i}
                          onClick={() => searchRef(s)}
                          className="flex items-start gap-2 p-2.5 rounded-xl mb-1.5 bg-bereia-50 border border-bereia-300/50 active:bg-bereia-200/50 active:scale-[0.98] transition-all w-full text-left"
                        >
                          <div className="shrink-0 mt-0.5"><Icons.arrow size={14} color="#8d6e63" /></div>
                          <span className="text-[12px] text-bereia-800 leading-relaxed">{s}</span>
                        </button>
                      ))}
                    </Section>
                  </>
                )}
              </div>

              <p className="text-center text-[10px] text-bereia-500 mt-5 leading-relaxed px-2">{t.disclaimer}</p>
            </div>
          )}

          {/* ─── EMPTY STATE ─── */}
          {!data && !loading && !error && (
            <div className="max-w-lg mx-auto mt-8 px-4 animate-fade-slide-up">
              {randomCuriosity && <CuriosityCard curiosity={randomCuriosity} t={t} />}
              <div className="text-center mb-6">
                <div className="flex justify-center">{Icons.book({ size: 36, color: "#5d4037" })}</div>
                <h2 className="text-base font-semibold text-bereia-800 font-serif mt-3 mb-1">{t.empty.title}</h2>
                <p className="text-[13px] text-bereia-600 leading-relaxed">{t.empty.desc}</p>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                {t.empty.cards.map((card, i) => {
                  const cardIcons = [Icons.scroll, Icons.question, Icons.chat, Icons.hands];
                  const CardIcon = cardIcons[i];
                  return (
                    <div key={i} className="p-3.5 rounded-2xl bg-white border border-bereia-300/50 text-left">
                      <div className="mb-1.5">{CardIcon({ size: 20, color: "#5d4037" })}</div>
                      <div className="text-[12px] font-bold text-bereia-950 mb-0.5">{card.title}</div>
                      <div className="text-[11px] text-bereia-600">{card.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ─── FOOTER ─── */}
      <footer className="mt-16 pb-8 px-4 text-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl p-5 border border-bereia-300/50 shadow-sm">
          <p className="text-[12px] text-bereia-700 leading-relaxed mb-2 font-medium">
            {lang === "pt-BR"
              ? "Ferramenta 100% gratuita a serviço da evangelização."
              : "100% free tool in service of evangelization."}
          </p>
          <p className="text-[11px] text-bereia-500 mb-3">
            {lang === "pt-BR" ? "Inspirado em " : "Inspired by "}
            <span className="italic font-serif font-semibold">Atos 17:11</span>
          </p>

          {/* Share buttons */}
          <div className="mb-4">
            <p className="text-[11px] text-bereia-600 font-semibold mb-2">
              {lang === "pt-BR" ? "Compartilhe com alguém:" : "Share with someone:"}
            </p>
            <div className="flex items-center justify-center gap-3">
              {(() => {
                const shareText = lang === "pt-BR"
                  ? "Conheça o BEREIA, uma plataforma totalmente gratuita para estudo bíblico com profundidade! 📖✨"
                  : "Check out BEREIA, a completely free platform for in-depth Bible study! 📖✨";
                const shareUrl = "https://bereiaestudos.com.br";
                const fullText = `${shareText}\n${shareUrl}`;
                return (
                  <>
                    {/* WhatsApp */}
                    <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(fullText)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center active:scale-90 transition-transform" aria-label="WhatsApp">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    </a>
                    {/* Instagram (stories share) */}
                    <a href={`https://www.instagram.com/`} target="_blank" rel="noopener noreferrer" onClick={(e) => { e.preventDefault(); if (navigator.share) { navigator.share({ title: "BEREIA", text: shareText, url: shareUrl }); } else { window.open("https://www.instagram.com/", "_blank"); }}} className="w-10 h-10 rounded-full bg-gradient-to-br from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center active:scale-90 transition-transform" aria-label="Instagram">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                    {/* Facebook */}
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center active:scale-90 transition-transform" aria-label="Facebook">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                    {/* X / Twitter */}
                    <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(fullText)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-black flex items-center justify-center active:scale-90 transition-transform" aria-label="X">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                    {/* Telegram */}
                    <a href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center active:scale-90 transition-transform" aria-label="Telegram">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
                    </a>
                    {/* Copy link */}
                    <button onClick={() => { navigator.clipboard?.writeText(fullText); }} className="w-10 h-10 rounded-full bg-bereia-600 flex items-center justify-center active:scale-90 transition-transform" aria-label="Copiar link">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                    </button>
                  </>
                );
              })()}
            </div>
          </div>

          <a href="/termos" className="inline-block text-[11px] text-bereia-700 font-semibold underline underline-offset-2 mb-4">
            {lang === "pt-BR" ? "Termos de Uso" : "Terms of Use"}
          </a>
          <div className="pt-3 border-t border-bereia-200">
            <p className="text-[12px] text-bereia-700 font-semibold">
              {lang === "pt-BR" ? "Desenvolvido por" : "Developed by"}
            </p>
            <a href="https://inventaresolutions.com.br" target="_blank" rel="noopener noreferrer" className="text-[14px] text-bereia-900 font-bold underline underline-offset-2 hover:text-bereia-950">
              Inventare Solutions
            </a>
            <p className="text-[10px] text-bereia-500 mt-0.5">inventaresolutions.com.br</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
