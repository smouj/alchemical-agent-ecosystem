import type { DashboardPayload } from "../lib/types";

export function StatsHero({ stats }: { stats: DashboardPayload["stats"] }) {
  const cards: Array<[string, string]> = [
    ["Agentes activos", `${stats.active}/${stats.total}`],
    ["Tareas completadas hoy", stats.tasksToday === null ? "N/D" : String(stats.tasksToday)],
    ["Tokens procesados", stats.tokensProcessed === null ? "N/D" : Intl.NumberFormat("es-ES", { notation: "compact" }).format(stats.tokensProcessed)],
    ["Uptime promedio", `${stats.uptimeAvg}%`],
  ];

  return (
    <section className="glass-card" style={{ padding: 20 }}>
      <h2 style={{ margin: 0, fontFamily: "'Playfair Display', serif" }}>Operación alquímica en tiempo real</h2>
      <p style={{ color: "#a1a1aa", marginTop: 6 }}>Estado real de contenedores + salud de endpoints por agente.</p>
      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(4, minmax(0,1fr))", gap: 10 }}>
        {cards.map(([k, v]) => (
          <div key={k} className="card" style={{ padding: 12 }}><small style={{ color: "#9ca3af" }}>{k}</small><div style={{ fontSize: 26, fontWeight: 700 }}>{v}</div></div>
        ))}
      </div>
    </section>
  );
}
