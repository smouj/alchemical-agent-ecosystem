import { NextResponse } from "next/server";

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let last = "";
      const send = (txt: string) => controller.enqueue(encoder.encode(txt));
      const loop = async () => {
        try {
          const r = await fetch("http://localhost/gateway/chat/thread?limit=160", { cache: "no-store" });
          const j = await r.json();
          const payload = JSON.stringify(j);
          if (payload !== last) {
            send(`data: ${payload}\n\n`);
            last = payload;
          } else {
            send(`: keepalive\n\n`);
          }
        } catch {
          send(`data: ${JSON.stringify({ items: [], error: "gateway unavailable" })}\n\n`);
        }
      };
      await loop();
      const id = setInterval(loop, 1000);
      // @ts-ignore
      this._id = id;
    },
    cancel() {
      // @ts-ignore
      if (this._id) clearInterval(this._id);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
