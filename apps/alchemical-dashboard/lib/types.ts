export type AgentStatus = "Running" | "Paused" | "Error";

export type AgentRow = {
  name: string;
  port: number;
  action: string;
  model: string;
  description: string;
  status: AgentStatus;
  latencyMs: number | null;
  containerState: string;
  containerStatus: string;
};

export type DashboardPayload = {
  items: AgentRow[];
  stats: {
    active: number;
    total: number;
    tasksToday: number | null;
    tokensProcessed: number | null;
    uptimeAvg: number;
  };
};
