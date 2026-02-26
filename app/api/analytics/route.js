import { NextResponse } from "next/server";
import { getAnalytics } from "@/lib/analytics";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  const adminKey = process.env.ADMIN_KEY || "bereia2025";
  if (key !== adminKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await getAnalytics();
  return NextResponse.json(data);
}
