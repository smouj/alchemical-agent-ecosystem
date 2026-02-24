import { NextResponse } from "next/server";

export async function GET() {
  try {
    const res = await fetch("http://localhost/gateway/capabilities", { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
