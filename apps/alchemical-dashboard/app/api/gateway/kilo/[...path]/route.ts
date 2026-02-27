import { NextRequest, NextResponse } from "next/server"

const GATEWAY = process.env.GATEWAY_URL || "http://localhost/gateway"
const TOKEN = process.env.ALCHEMICAL_GATEWAY_TOKEN || ""

export async function GET(req: NextRequest) {
  return proxyToGateway(req, "GET")
}

export async function POST(req: NextRequest) {
  return proxyToGateway(req, "POST")
}

export async function DELETE(req: NextRequest) {
  return proxyToGateway(req, "DELETE")
}

async function proxyToGateway(req: NextRequest, method: string) {
  const url = new URL(req.url)
  // Extract path after /api/gateway/kilo
  const pathMatch = url.pathname.match(/\/api\/gateway\/kilo(.*)/)
  const kiloPath = pathMatch ? pathMatch[1] : ""
  const targetUrl = `${GATEWAY}/kilo${kiloPath}${url.search}`

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }
  if (TOKEN) {
    headers["Authorization"] = `Bearer ${TOKEN}`
  }

  try {
    const body =
      method !== "GET" && method !== "DELETE" ? await req.text() : undefined

    const resp = await fetch(targetUrl, {
      method,
      headers,
      body,
      // @ts-expect-error — duplex is required for streaming bodies in Node 18+
      duplex: "half",
    })

    // For SSE streams, proxy the stream directly
    if (resp.headers.get("content-type")?.includes("text/event-stream")) {
      return new NextResponse(resp.body, {
        status: resp.status,
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "X-Accel-Buffering": "no",
          Connection: "keep-alive",
        },
      })
    }

    const data = await resp.text()
    return new NextResponse(data, {
      status: resp.status,
      headers: {
        "Content-Type": resp.headers.get("content-type") || "application/json",
      },
    })
  } catch (error) {
    console.error("[kilo proxy] gateway error:", error)
    return NextResponse.json(
      {
        error: "Gateway proxy error",
        hint: "Ensure the alchemical gateway is running",
      },
      { status: 503 }
    )
  }
}
