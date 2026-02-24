import { NextRequest, NextResponse } from "next/server";

const headersFor = (): Record<string, string> => {
  const token = process.env.ALCHEMICAL_GATEWAY_TOKEN || "";
  const h: Record<string, string> = { "x-alchemy-role": "admin" };
  if (token) h["x-alchemy-token"] = token;
  return h;
};

export async function GET() {
  try {
    const res = await fetch("http://localhost/gateway/auth/keys", { cache: "no-store", headers: headersFor() });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable", items: [] }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const name = encodeURIComponent(body.name || "dashboard-key");
  const role = encodeURIComponent(body.role || "operator");
  try {
    const res = await fetch(`http://localhost/gateway/auth/keys?name=${name}&role=${role}`, {
      method: "POST",
      headers: headersFor(),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "gateway unavailable" }, { status: 502 });
  }
}
