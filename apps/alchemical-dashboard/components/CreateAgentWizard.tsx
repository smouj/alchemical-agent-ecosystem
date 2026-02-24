"use client";

import { useMemo, useState } from "react";

const steps = ["Plantilla", "Configuración", "Capacidades", "Review"];
const templates = ["Routing Cognitivo", "Audio/Intent", "Guardrails", "Workflow Orchestrator"];
const caps = ["Memory", "Tools", "Vision", "RAG", "Guardrails", "Web Search"];

export function CreateAgentWizard() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [model, setModel] = useState("llama3.2");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState<string[]>(["Memory", "Tools"]);
  const yaml = useMemo(() => `name: ${name || "nuevo-agente"}\nmodel: ${model}\ndescription: ${description || "Agente especializado"}\ncapabilities:\n${selected.map((s) => `  - ${s}`).join("\n")}`,[name, model, description, selected]);

  return (
    <section className="glass-card" style={{ padding: 16 }}>
      <h3 style={{ marginTop: 0 }}>Crear Nuevo Agente</h3>
      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
        {steps.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className="card" style={{ padding: "6px 10px", fontSize: 12, borderColor: i === step ? "#22d3ee" : undefined, color: i === step ? "#67e8f9" : "#cbd5e1" }}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      {step === 0 && <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{templates.map((t) => <button key={t} className="card" style={{ padding: 10, textAlign: "left" }}>{t}</button>)}</div>}

      {step === 1 && (
        <div style={{ display: "grid", gap: 8 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre del agente" style={field} />
          <input value={model} onChange={(e) => setModel(e.target.value)} placeholder="Modelo base" style={field} />
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Descripción" rows={3} style={field} />
        </div>
      )}

      {step === 2 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {caps.map((c) => {
            const active = selected.includes(c);
            return <button key={c} onClick={() => setSelected(active ? selected.filter((x) => x !== c) : [...selected, c])} className="card" style={{ padding: "8px 10px", color: active ? "#22d3ee" : "#cbd5e1" }}>{c}</button>;
          })}
        </div>
      )}

      {step === 3 && (
        <pre style={{ margin: 0, borderRadius: 12, padding: 12, background: "#020617", border: "1px solid rgba(255,255,255,.1)", fontSize: 12, color: "#67e8f9", whiteSpace: "pre-wrap" }}>{yaml}</pre>
      )}

      <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", gap: 8 }}>
        <button className="card" onClick={() => setStep(Math.max(0, step - 1))} style={{ padding: "10px 14px" }}>Atrás</button>
        <div style={{ display: "flex", gap: 8 }}>
          {step < 3 && <button className="card" onClick={() => setStep(step + 1)} style={{ padding: "10px 14px" }}>Siguiente</button>}
          <button className="cta">Transmutar Agente</button>
        </div>
      </div>
    </section>
  );
}

const field: React.CSSProperties = {
  width: "100%", borderRadius: 12, border: "1px solid rgba(255,255,255,.14)",
  background: "rgba(3,7,18,.45)", color: "#f8fafc", padding: "10px 12px"
};
