export const AGENTS = [
  { name: "velktharion", port: 7401, action: "navigate", model: "llama3.2", description: "Browser/navigation specialist" },
  { name: "synapsara", port: 7402, action: "query", model: "llama3.2", description: "Knowledge routing" },
  { name: "kryonexus", port: 7403, action: "search", model: "mistral", description: "Retrieval and search" },
  { name: "noctumbra-mail", port: 7404, action: "send", model: "qwen2.5", description: "Mail automation" },
  { name: "temporaeth", port: 7405, action: "plan", model: "qwen2.5", description: "Scheduling and planning" },
  { name: "vaeloryn-conclave", port: 7406, action: "deliberate", model: "llama3.1", description: "Consensus orchestration" },
  { name: "ignivox", port: 7407, action: "transform", model: "deepseek", description: "Transform pipelines" },
  { name: "auralith", port: 7408, action: "live", model: "mistral", description: "Audio live analysis" },
  { name: "resonvyr", port: 7409, action: "voice", model: "llama3.1", description: "Voice tasks" },
  { name: "fluxenrath", port: 7410, action: "/", model: "deepseek-r1", description: "Flow diagnostics" },
] as const;

export const CORE_SERVICES = ["ollama", "redis", "chromadb", "caddy", "alchemical-gateway"] as const;
