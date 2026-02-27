export interface DashboardConfig {
  agentPollMs: number;
  logsPollMs: number;
  logsLines: number;
  defaultLogService: string;
  /** True when KILO_API_KEY is present in the server environment. Omitted on client-side defaults. */
  kiloApiConfigured?: boolean;
}

export const DEFAULT_CONFIG: DashboardConfig = {
  /** Single source of truth: matches page.tsx defaultCfg.agentPollMs */
  agentPollMs: 10000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
  kiloApiConfigured: Boolean(process.env.KILO_API_KEY),
};
