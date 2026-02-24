"use client";

import { useEffect, useState } from "react";
import { StatsHero } from "../components/StatsHero";
import { AgentCard } from "../components/AgentCard";
import { CreateAgentWizard } from "../components/CreateAgentWizard";
import { AgentsTable } from "../components/AgentsTable";
import { LogsMonitor } from "../components/LogsMonitor";
import type { DashboardPayload } from "../lib/types";

export default function Page() {
  const [data, setData] = useState<DashboardPayload | null>(null);

  useEffect(() => {
    let stop = false;
    const load = async () => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      if (!stop) setData(json);
    };
    load();
    const id = setInterval(load, 5000);
    return () => { stop = true; clearInterval(id); };
  }, []);

  if (!data) return <div className="glass-card" style={{ padding: 20 }}>Cargando estado real de agentes...</div>;

  return (
    <div className="dashboard-grid">
      <StatsHero stats={data.stats} />
      <section className="widgets">
        {data.items.slice(0, 4).map((agent) => (
          <AgentCard key={agent.name} agent={agent} />
        ))}
      </section>
      <section className="two-col">
        <div className="glass-card"><AgentsTable agents={data.items} /></div>
        <div className="stack">
          <CreateAgentWizard />
          <LogsMonitor />
        </div>
      </section>
    </div>
  );
}
