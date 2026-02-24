import { NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AGENTS } from "../../../lib/agents";

const execFileAsync = promisify(execFile);

async function composePs() {
  try {
    const { stdout } = await execFileAsync("docker", ["compose", "ps", "--format", "json"], { cwd: process.cwd() + "/../.." });
    const lines = stdout.trim().split("\n").filter(Boolean);
    return lines.map((l) => JSON.parse(l)) as Array<{ Service: string; State: string; Status: string }>;
  } catch {
    return [];
  }
}

export async function GET() {
  const ps = await composePs();
  const byService = new Map(ps.map((s) => [s.Service, s]));

  const items = await Promise.all(
    AGENTS.map(async (a) => {
      const svc = byService.get(a.name);
      const healthUrl = `http://localhost/${a.name}/health`;
      let health: "Running" | "Error" | "Paused" = "Paused";
      let latencyMs: number | null = null;

      const started = Date.now();
      try {
        const r = await fetch(healthUrl, { cache: "no-store" });
        latencyMs = Date.now() - started;
        if (r.ok) health = "Running";
        else health = "Error";
      } catch {
        health = svc?.State?.toLowerCase().includes("running") ? "Error" : "Paused";
      }

      return {
        ...a,
        status: health,
        latencyMs,
        containerState: svc?.State ?? "unknown",
        containerStatus: svc?.Status ?? "unknown",
      };
    })
  );

  const active = items.filter((i) => i.status === "Running").length;
  const stats = {
    active,
    total: items.length,
    tasksToday: null,
    tokensProcessed: null,
    uptimeAvg: Number(((active / Math.max(items.length, 1)) * 100).toFixed(1)),
  };

  return NextResponse.json({ items, stats });
}
