// ─────────────────────────────────────────────────────────────────────────────
// KiloCode Engine Types — Alchemical Agent Ecosystem Dashboard
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Overall status of the KiloCode local engine.
 * Returned by GET /gateway/kilo/status
 */
export interface KiloEngineStatus {
  /** Engine health: "active" = reachable and ready, "offline" = unreachable, "unknown" = not yet checked */
  status: "active" | "offline" | "unknown"
  /** Spanish alchemical label displayed in the UI (e.g. "Forja Arcana Activa") */
  alchemical_label: string
  /** Number of currently open sessions */
  session_count: number
  /** Semantic version of the running KiloCode CLI, or null if unavailable */
  version: string | null
  /** Base URL the local server is bound to (e.g. "http://localhost:4096") */
  server_url: string
  /** Unix timestamp (seconds) of the most recent health check */
  last_check: number
}

/**
 * A single KiloCode coding session.
 * Returned inside { sessions: KiloSession[] } by GET /gateway/kilo/sessions
 * and as the top-level body of POST /gateway/kilo/sessions.
 */
export interface KiloSession {
  /** Unique session identifier (UUID or similar) */
  id: string
  /** Optional human-readable title */
  title?: string
  /**
   * Session lifecycle status.
   * "running"   → currently executing a task ("En Transmutación KiloCode")
   * "idle"      → open but waiting                ("Esencia Vinculada")
   * "completed" → task finished                   ("Transmutación Completa")
   * "error"     → task failed
   */
  status?: "running" | "idle" | "completed" | "error"
  /** Spanish alchemical label for the current status */
  alchemical_label?: string
  /** Working directory for the session (e.g. "/workspace/my-project") */
  directory?: string
  /**
   * Agent mode identifier.
   * One of: "architect" | "code" | "debug" | "orchestrator" | "ask"
   */
  agent?: "architect" | "code" | "debug" | "orchestrator" | "ask"
  /** Model override (e.g. "anthropic/claude-sonnet-4-20250514") */
  model?: string
  /** Total number of messages exchanged in this session */
  messageCount?: number
  /** ISO 8601 creation timestamp */
  createdAt?: string
}

/**
 * An SSE event streamed from POST /gateway/kilo/sessions/{id}/task.
 * Each event is a JSON object sent as `data: <json>\n\n`.
 */
export interface KiloMessage {
  /** Client-side correlation id (added by the dashboard, not the server) */
  id: string
  /**
   * Event type, e.g.:
   *   "message_start" | "message_chunk" | "message_complete"
   *   "tool_use_start" | "tool_use_complete" | "tool_error"
   *   "error" | "abort"
   */
  type: string
  /** Human-readable content or partial text chunk */
  content?: string
  /** Spanish alchemical description of the event */
  alchemical_context?: string
  /** Unix timestamp (milliseconds) */
  timestamp?: number
}

/**
 * A KiloCode-powered agent profile, enriching the base Agent type
 * with KiloCode-specific capabilities.
 */
export interface KiloAgent {
  /** Unique agent identifier */
  id: string
  /** Display name */
  name: string
  /** Role description */
  role: string
  /** Model the agent runs on */
  model: string
  /** Target backend service (Docker service name) */
  target_service: string
  /** List of skill identifiers this agent possesses */
  skills: KiloSkill[]
  /** Lucide icon names or emoji labels for the tools available */
  tools: string[]
  /** Current operational status */
  status?: "active" | "idle" | "running" | "error" | "offline"
  /** Round-trip latency in milliseconds */
  latency_ms?: number
  /** Active KiloCode session ID bound to this agent, if any */
  kilocode_session_id?: string | null
}

/**
 * A discrete capability slot carried by a KiloAgent.
 */
export interface KiloSkill {
  /** Skill identifier used in SKILL_ICONS lookup */
  id: string
  /** Human-readable label */
  label: string
  /**
   * Proficiency level.
   * "expert"    → fully autonomous
   * "proficient" → can handle most cases
   * "novice"    → guided assistance only
   */
  level?: "expert" | "proficient" | "novice"
}

/**
 * Request body for POST /gateway/kilo/sessions/{id}/task
 * Triggers an SSE-streamed task execution within an existing session.
 */
export interface KiloTaskRequest {
  /** Natural language task description */
  text: string
  /** Optional key/value context passed to the agent */
  context?: Record<string, unknown>
}

/**
 * Request body for POST /gateway/kilo/sessions
 * Creates a new KiloCode session.
 */
export interface KiloCreateSessionRequest {
  /** Working directory for the session */
  directory?: string
  /** Agent mode: "architect" | "code" | "debug" | "orchestrator" | "ask" */
  agent?: string
  /** Model override */
  model?: string
  /** Human-readable session title */
  title?: string
}

/**
 * Request body for POST /gateway/kilo/run
 * Fire-and-forget autonomous task — creates a session, runs the task, and closes.
 */
export interface KiloRunRequest {
  /** Natural language task description */
  text: string
  /** When true the agent acts fully autonomously without confirmation prompts */
  auto?: boolean
  /** Optional working directory override */
  directory?: string
  /** Agent mode override */
  agent?: string
  /** Model override */
  model?: string
}

/**
 * Response body from POST /gateway/kilo/run
 */
export interface KiloRunResponse {
  /** ID of the ephemeral session that was created */
  session_id: string
  /** Terminal status after the run */
  status: "completed" | "error" | "aborted"
  /** Final output text, if available */
  output?: string
  /** Error message, if the run failed */
  error?: string
}
