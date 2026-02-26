import { NextResponse } from "next/server";
import { trackVisit, trackHeartbeat } from "@/lib/analytics";

export async function POST(request) {
  try {
    const { type, path, lang } = await request.json();

    if (type === "heartbeat") {
      trackHeartbeat(request.headers);
    } else {
      await trackVisit(request.headers, path || "/", lang || "pt-BR");
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
