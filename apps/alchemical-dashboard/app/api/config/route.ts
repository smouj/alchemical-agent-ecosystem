import { NextRequest, NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DEFAULT_CONFIG, type DashboardConfig } from "../../../lib/config";

const root = join(process.cwd(), "../..");
const runtimeDir = join(root, ".runtime");
const configPath = join(runtimeDir, "dashboard.config.json");

function sanitize(input: Partial<DashboardConfig>): DashboardConfig {
  return {
    agentPollMs: Math.max(1000, Math.min(60000, Number(input.agentPollMs ?? DEFAULT_CONFIG.agentPollMs))),
    logsPollMs: Math.max(1000, Math.min(60000, Number(input.logsPollMs ?? DEFAULT_CONFIG.logsPollMs))),
    logsLines: Math.max(10, Math.min(200, Number(input.logsLines ?? DEFAULT_CONFIG.logsLines))),
    defaultLogService: String(input.defaultLogService ?? DEFAULT_CONFIG.defaultLogService),
  };
}

export async function GET() {
  try {
    const data = await readFile(configPath, "utf8");
    const parsed = JSON.parse(data);
    return NextResponse.json({ config: sanitize(parsed) });
  } catch {
    return NextResponse.json({ config: DEFAULT_CONFIG });
  }
}

export async function PUT(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const config = sanitize(body);
  await mkdir(runtimeDir, { recursive: true });
  await writeFile(configPath, JSON.stringify(config, null, 2), "utf8");
  return NextResponse.json({ ok: true, config });
}
