"use client";

import { useEffect, useState } from "react";

export function AdminOpsPanel() {
  const [keys, setKeys] = useState<any[]>([]);
  const [newKey, setNewKey] = useState<{ name: string; role: string }>({ name: "ops-key", role: "operator" });
  const [lastKey, setLastKey] = useState("");
  const [send, setSend] = useState({ channel: "telegram", target: "-1003822689592", message: "Test Alchemical connector" });
  const [msg, setMsg] = useState("");

  const load = async () => {
    const r = await fetch("/api/gateway/auth-keys", { cache: "no-store" });
    const j = await r.json();
    setKeys(j.items ?? []);
  };

  useEffect(() => { load(); }, []);

  const createKey = async () => {
    const r = await fetch("/api/gateway/auth-keys", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(newKey),
    });
    const j = await r.json();
    setLastKey(j.api_key || "");
    setMsg(r.ok ? "API key creada" : "Error creando key");
    load();
  };

  const sendConnector = async () => {
    const r = await fetch("/api/gateway/connectors-send", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(send),
    });
    setMsg(r.ok ? "Mensaje encolado para conector" : "Error en envío a conector");
  };

  return (
    <section className="glass-card" style={{ padding: 14 }}>
      <h3 style={{ marginTop: 0 }}>Admin Ops (RBAC + Connectors)</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div>
          <strong style={{ fontSize: 13 }}>API Keys</strong>
          <div style={box}>
            <div style={{ display: "flex", gap: 6 }}>
              <input value={newKey.name} onChange={(e) => setNewKey({ ...newKey, name: e.target.value })} placeholder="key name" style={field} />
              <select value={newKey.role} onChange={(e) => setNewKey({ ...newKey, role: e.target.value })} style={field}>
                <option value="viewer">viewer</option>
                <option value="operator">operator</option>
                <option value="admin">admin</option>
              </select>
              <button className="card" style={{ padding: "8px 10px" }} onClick={createKey}>Create</button>
            </div>
            {lastKey && <div style={{ marginTop: 6, color: "#34d399", fontSize: 12 }}>Nueva key (cópiala ahora): {lastKey}</div>}
            <div style={{ marginTop: 8 }}>
              {keys.map((k) => <div key={k.id} style={row}>#{k.id} {k.name} ({k.role})</div>)}
            </div>
          </div>
        </div>

        <div>
          <strong style={{ fontSize: 13 }}>Connector Send Test</strong>
          <div style={box}>
            <input value={send.channel} onChange={(e) => setSend({ ...send, channel: e.target.value })} placeholder="channel" style={field} />
            <input value={send.target} onChange={(e) => setSend({ ...send, target: e.target.value })} placeholder="target" style={field} />
            <textarea value={send.message} onChange={(e) => setSend({ ...send, message: e.target.value })} rows={3} style={field} />
            <button className="card" style={{ padding: "8px 10px" }} onClick={sendConnector}>Queue send</button>
          </div>
        </div>
      </div>
      {msg && <div style={{ marginTop: 8, color: "#67e8f9", fontSize: 12 }}>{msg}</div>}
    </section>
  );
}

const box: React.CSSProperties = { marginTop: 6, borderRadius: 12, border: "1px solid rgba(255,255,255,.12)", background: "#020617", padding: 10 };
const row: React.CSSProperties = { fontSize: 12, color: "#cbd5e1", padding: "2px 0" };
const field: React.CSSProperties = { width: "100%", borderRadius: 8, border: "1px solid rgba(255,255,255,.15)", background: "rgba(0,0,0,.2)", color: "#f8fafc", padding: "7px 8px", marginBottom: 6 };
