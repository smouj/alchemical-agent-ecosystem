export type DashboardConfig = {
  agentPollMs: number;
  logsPollMs: number;
  logsLines: number;
  defaultLogService: string;
};

export const DEFAULT_CONFIG: DashboardConfig = {
  agentPollMs: 5000,
  logsPollMs: 5000,
  logsLines: 50,
  defaultLogService: "velktharion",
};
