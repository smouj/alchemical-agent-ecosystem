"use client";

import { useState } from "react";

export function CanvasLab() {
  const [url, setUrl] = useState("https://example.com");
  const [snapshot, setSnapshot] = useState<any>(null);

  const capture = async () => {
    const r = await fetch("/api/agent/velktharion/dispatch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "snapshot", payload: { targetUrl: url } }),
    });
    const j = await r.json();
    setSnapshot(j);
  };

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Canvas Lab</h3>
      <p style={{ color: "#94a3b8", marginTop: 0 }}>Visualiza webs en canvas e inicia capturas/snapshots para trabajo visual.</p>
      <div style={{ display: "flex", gap: 8 }}>
        <input value={url} onChange={(e) => setUrl(e.target.value)} style={{ flex: 1, borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "8px" }} />
        <button className="card" style={{ padding: "8px 10px" }} onClick={capture}>Snapshot</button>
      </div>
      <iframe src={url} title="canvas-web" style={{ marginTop: 10, width: "100%", height: 220, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "#020617" }} />
      {snapshot && <pre style={{ marginTop: 10, maxHeight: 180, overflow: "auto", borderRadius: 10, padding: 8, background: "#020617", border: "1px solid rgba(255,255,255,.1)", color: "#67e8f9", fontSize: 12 }}>{JSON.stringify(snapshot, null, 2)}</pre>}
    </section>
  );
}
