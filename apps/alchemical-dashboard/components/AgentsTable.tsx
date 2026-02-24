"use client";

import { useMemo, useState } from "react";
import { agents } from "../lib/mock-data";

export function AgentsTable() {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const rows = useMemo(() => agents.filter((a) => `${a.name} ${a.model} ${a.description}`.toLowerCase().includes(q.toLowerCase())), [q]);

  return (
    <section style={{ padding: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
        <h3 style={{ marginTop: 0 }}>Agentes</h3>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrar..." style={{ ...input, maxWidth: 220 }} />
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead><tr style={{ color: "#9ca3af", textAlign: "left" }}><th>Nombre</th><th>Puerto</th><th>Estado</th><th>Modelo</th><th>Descripción</th><th>Acciones</th></tr></thead>
        <tbody>
          {rows.map((a) => (
            <tr key={a.name} onClick={() => setSelected(a.name)} style={{ borderTop: "1px solid rgba(255,255,255,.08)", cursor: "pointer" }}>
              <td>{a.name}</td><td>{a.port}</td><td>{a.status}</td><td>{a.model}</td><td>{a.description}</td>
              <td><button>Start</button> <button>Stop</button> <button>Restart</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      {selected && (
        <aside className="glass-card" style={{ marginTop: 10, padding: 12 }}>
          <strong>Detalle: {selected}</strong>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
            <pre style={panel}>requests/min: 142\nlatency p50: 120ms\nlatency p95: 287ms\nerrors: 0.7%</pre>
            <pre style={panel}># yaml\nservice: {selected.toLowerCase()}\nport: 7401\nmodel: llama3.2</pre>
          </div>
        </aside>
      )}
    </section>
  );
}

const input: React.CSSProperties = { borderRadius: 10, border: "1px solid rgba(255,255,255,.14)", background: "rgba(0,0,0,.24)", color: "#f8fafc", padding: "8px 10px" };
const panel: React.CSSProperties = { margin: 0, borderRadius: 12, padding: 12, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontSize: 12 };
