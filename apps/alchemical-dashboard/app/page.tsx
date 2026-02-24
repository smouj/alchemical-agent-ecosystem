"use client";

import { useCallback, useEffect, useState } from "react";
import { StatsHero } from "../components/StatsHero";
import { AgentCard } from "../components/AgentCard";
import { CreateAgentWizard } from "../components/CreateAgentWizard";
import { AgentsTable } from "../components/AgentsTable";
import { LogsMonitor } from "../components/LogsMonitor";
import { SettingsPanel } from "../components/SettingsPanel";
import { ChatWorkbench } from "../components/ChatWorkbench";
import { CanvasLab } from "../components/CanvasLab";
import { JobsEventsPanel } from "../components/JobsEventsPanel";
import { AdminOpsPanel } from "../components/AdminOpsPanel";
import { UsagePanel } from "../components/UsagePanel";
import type { DashboardPayload } from "../lib/types";
import type { DashboardConfig } from "../lib/config";

const defaultCfg: DashboardConfig = {
  agentPollMs: 5000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
};

export default function Page() {
  const [data, setData] = useState<DashboardPayload | null>(null);
  const [cfg, setCfg] = useState<DashboardConfig>(defaultCfg);

  const onCfg = useCallback((c: DashboardConfig) => setCfg(c), []);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      if (!stop) setData(json);
    };
    load();
    const id = setInterval(load, cfg.agentPollMs);
    return () => { stop = true; clearInterval(id); };
  }, [cfg.agentPollMs]);

  if (!data) return <div className="glass-card" style={{ padding: 20 }}>Cargando estado real de agentes...</div>;

  return (
    <div className="dashboard-grid">
      <section id="section-dashboard">
        <StatsHero stats={data.stats} />
      </section>

      <section className="widgets" id="section-widgets">
        {data.items.slice(0, 4).map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </section>

      <section className="two-col">
        <div className="glass-card" id="section-agentes"><AgentsTable agents={data.items} /></div>
        <div className="stack">
          <section id="section-crear-agente"><CreateAgentWizard /></section>
          <section id="section-chat"><ChatWorkbench /></section>
          <section id="section-canvas"><CanvasLab /></section>
          <section id="section-jobs"><JobsEventsPanel /></section>
          <section id="section-usage"><UsagePanel /></section>
          <section id="section-admin"><AdminOpsPanel /></section>
          <section id="section-settings"><SettingsPanel onChange={onCfg} /></section>
          <section id="section-logs"><LogsMonitor defaultService={cfg.defaultLogService} linesCount={cfg.logsLines} /></section>
          <section id="section-ayuda" className="glass-card" style={{ padding: 14 }}>
            <h3 style={{ marginTop: 0 }}>Ayuda rápida</h3>
            <p style={{ color: "#94a3b8", marginBottom: 0 }}>
              Usa "Chat Gateway" para hablar con un agente real, "Agentes" para estado/control y "Logs" para depurar.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
