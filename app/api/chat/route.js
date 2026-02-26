import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getSystemPrompt } from "@/lib/prompt";
import { checkRateLimit } from "@/lib/rate-limit";
import { getCached, setCache } from "@/lib/cache";
import { trackSearch } from "@/lib/analytics";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  const startTime = Date.now();
  try {
    const { query, lang = "pt-BR" } = await request.json();
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return NextResponse.json(
        { error: "Query is required" },
        { status: 400 }
      );
    }

    if (query.trim().length > 2000) {
      return NextResponse.json(
        { error: "Query too long (max 2000 chars)" },
        { status: 400 }
      );
    }

    // Rate limit check
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          error:
            lang === "pt-BR"
              ? "Limite de consultas atingido. Tente novamente amanhã."
              : "Rate limit reached. Try again tomorrow.",
        },
        { status: 429 }
      );
    }

    // Cache check
    const cached = getCached(query.trim(), lang);
    if (cached) {
      trackSearch({ query: query.trim(), lang, ip, cached: true, usage: null, response_ms: Date.now() - startTime });
      return NextResponse.json(cached);
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: getSystemPrompt(lang) },
        { role: "user", content: query.trim() },
      ],
      temperature: 0.3,
      max_tokens: 2500,
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) throw new Error("Empty response from API");

    const parsed = JSON.parse(raw);

    // Cache the result
    setCache(query.trim(), lang, parsed);

    // Track analytics
    trackSearch({
      query: query.trim(),
      lang,
      ip,
      cached: false,
      usage: completion.usage,
      response_ms: Date.now() - startTime,
    });

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("BEREIA API Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: "Failed to parse AI response" }, { status: 500 });
    }
    if (error?.status === 429) {
      return NextResponse.json({ error: "API rate limit. Please try again in a moment." }, { status: 429 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
