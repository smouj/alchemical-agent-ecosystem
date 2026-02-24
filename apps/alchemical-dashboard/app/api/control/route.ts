import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { AGENTS } from "../../../lib/agents";

const execFileAsync = promisify(execFile);
const allowed = new Set(AGENTS.map((a) => a.name));

export async function POST(req: NextRequest) {
  const { service, command } = await req.json();
  if (!allowed.has(service)) return NextResponse.json({ error: "Service not allowed" }, { status: 400 });
  if (!["start", "stop", "restart"].includes(command)) return NextResponse.json({ error: "Invalid command" }, { status: 400 });

  try {
    const args = ["compose", command === "restart" ? "restart" : command, service];
    const { stdout, stderr } = await execFileAsync("docker", args, { cwd: process.cwd() + "/../.." });
    return NextResponse.json({ ok: true, stdout, stderr });
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error?.message ?? "control failed" }, { status: 500 });
  }
}
