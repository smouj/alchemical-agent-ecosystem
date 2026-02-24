import { NextRequest, NextResponse } from "next/server";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export async function GET(req: NextRequest) {
  const service = req.nextUrl.searchParams.get("service") || "velktharion";
  const lines = Number(req.nextUrl.searchParams.get("lines") || "50");

  try {
    const { stdout } = await execFileAsync("docker", ["compose", "logs", "--tail", String(Math.min(lines, 200)), service], {
      cwd: process.cwd() + "/../..",
      maxBuffer: 1024 * 1024,
    });
    return NextResponse.json({ service, logs: stdout.split("\n").slice(-lines) });
  } catch (error: any) {
    return NextResponse.json({ service, logs: [], error: error?.message ?? "logs unavailable" }, { status: 500 });
  }
}
