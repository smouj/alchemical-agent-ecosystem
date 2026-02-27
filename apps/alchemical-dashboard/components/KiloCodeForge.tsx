"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Zap, Terminal, Play, Square, Trash2, Plus, RefreshCw, ChevronDown, ChevronUp, Cpu } from "lucide-react"

// ── Types ─────────────────────────────────────────────────────────────────────

interface KiloStatus {
  status: "active" | "offline" | "unknown"
  alchemical_label: string
  session_count: number
  version: string | null
  server_url: string
  last_check: number
}

interface KiloSession {
  id: string
  title?: string
  status?: string
  alchemical_label?: string
  directory?: string
  agent?: string
  model?: string
  messageCount?: number
  createdAt?: string
}

interface KiloMessage {
  id: string
  type: string
  content?: string
  alchemical_context?: string
  timestamp?: number
}

const AGENT_MODES = [
  { id: "architect", label: "🏗️ Arquitecto Arcano", desc: "Planifica sin modificar código" },
  { id: "code", label: "⚡ Codificador del Éter", desc: "Implementa y escribe código" },
  { id: "debug", label: "🔍 Oráculo de Errores", desc: "Diagnostica y corrige fallos" },
  { id: "orchestrator", label: "🎭 Alquimista Mayor", desc: "Orquesta múltiples agentes" },
  { id: "ask", label: "💬 Sabio Consultado", desc: "Responde sin modificar archivos" },
]

const GATEWAY_URL = process.env.NEXT_PUBLIC_GATEWAY_URL || "/gateway"

// ── Component ─────────────────────────────────────────────────────────────────

export default function KiloCodeForge() {
  const [engineStatus, setEngineStatus] = useState<KiloStatus | null>(null)
  const [sessions, setSessions] = useState<KiloSession[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [activeTaskSession, setActiveTaskSession] = useState<string | null>(null)
  const [taskInput, setTaskInput] = useState("")
  const [taskLogs, setTaskLogs] = useState<KiloMessage[]>([])
  const [streamingSessionId, setStreamingSessionId] = useState<string | null>(null)
  const [quickRunText, setQuickRunText] = useState("")
  const [quickRunLoading, setQuickRunLoading] = useState(false)
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set())
  const logsEndRef = useRef<HTMLDivElement>(null)

  // Create form state
  const [createForm, setCreateForm] = useState({
    directory: "/workspace",
    agent: "code",
    model: "",
    title: "",
  })

  // Fetch engine status
  const fetchStatus = useCallback(async () => {
    try {
      const resp = await fetch(`${GATEWAY_URL}/kilo/status`)
      if (resp.ok) {
        const data = await resp.json()
        setEngineStatus(data)
        setLoading(false)
      }
    } catch {
      setEngineStatus({
        status: "offline",
        alchemical_label: "Forja en Reposo",
        session_count: 0,
        version: null,
        server_url: "http://localhost:4096",
        last_check: Date.now() / 1000,
      })
      setLoading(false)
    }
  }, [])

  // Fetch sessions
  const fetchSessions = useCallback(async () => {
    try {
      const resp = await fetch(`${GATEWAY_URL}/kilo/sessions`)
      if (resp.ok) {
        const data = await resp.json()
        setSessions(data.sessions || [])
      }
    } catch {}
  }, [])

  useEffect(() => {
    fetchStatus()
    fetchSessions()
    const interval = setInterval(() => {
      fetchStatus()
      fetchSessions()
    }, 10000)
    return () => clearInterval(interval)
  }, [fetchStatus, fetchSessions])

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [taskLogs])

  // Create session
  const createSession = async () => {
    try {
      const resp = await fetch(`${GATEWAY_URL}/kilo/sessions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directory: createForm.directory || undefined,
          agent: createForm.agent || undefined,
          model: createForm.model || undefined,
          title: createForm.title || undefined,
        }),
      })
      if (resp.ok) {
        const session = await resp.json()
        setSessions(prev => [session, ...prev])
        setShowCreateForm(false)
        setCreateForm({ directory: "/workspace", agent: "code", model: "", title: "" })
      }
    } catch (e) {
      console.error("Failed to create session:", e)
    }
  }

  // Delete session
  const deleteSession = async (sessionId: string) => {
    try {
      await fetch(`${GATEWAY_URL}/kilo/sessions/${sessionId}`, { method: "DELETE" })
      setSessions(prev => prev.filter(s => s.id !== sessionId))
    } catch {}
  }

  // Abort session
  const abortSession = async (sessionId: string) => {
    try {
      await fetch(`${GATEWAY_URL}/kilo/sessions/${sessionId}/abort`, { method: "POST" })
      await fetchSessions()
    } catch {}
  }

  // Send task with SSE streaming
  const sendTask = async (sessionId: string) => {
    if (!taskInput.trim()) return
    setStreamingSessionId(sessionId)
    setTaskLogs([])

    const resp = await fetch(`${GATEWAY_URL}/kilo/sessions/${sessionId}/task`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
      body: JSON.stringify({ text: taskInput }),
    })

    setTaskInput("")

    const reader = resp.body?.getReader()
    if (!reader) return

    const decoder = new TextDecoder()
    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          try {
            const event = JSON.parse(line.slice(6))
            setTaskLogs(prev => [...prev, { id: Date.now().toString(), ...event }])
          } catch {}
        }
      }
    }
    setStreamingSessionId(null)
  }

  // Quick run
  const quickRun = async () => {
    if (!quickRunText.trim()) return
    setQuickRunLoading(true)
    try {
      const resp = await fetch(`${GATEWAY_URL}/kilo/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: quickRunText, auto: true }),
      })
      if (resp.ok) {
        setQuickRunText("")
        setTimeout(fetchSessions, 2000)
      }
    } catch {}
    setQuickRunLoading(false)
  }

  const toggleSession = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const statusColor =
    engineStatus?.status === "active"
      ? "#10b981"
      : engineStatus?.status === "offline"
      ? "#ef4444"
      : "#f59e0b"
  const statusGlow =
    engineStatus?.status === "active"
      ? "0 0 12px rgba(16, 185, 129, 0.6)"
      : "0 0 12px rgba(239, 68, 68, 0.6)"

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        background: "rgba(10, 8, 20, 0.95)",
        border: "1px solid rgba(139, 92, 246, 0.2)",
        borderRadius: "16px",
        padding: "24px",
        height: "100%",
        overflow: "auto",
        fontFamily: "'Inter', system-ui, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "24px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              background: "linear-gradient(135deg, #6d28d9, #2563eb)",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 20px rgba(109, 40, 217, 0.5)",
            }}
          >
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: 700,
                color: "#f0c040",
                letterSpacing: "0.05em",
              }}
            >
              Forja Arcana
            </h2>
            <p style={{ margin: 0, fontSize: "12px", color: "rgba(255,255,255,0.5)" }}>
              KiloCode Local Engine
            </p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              background: statusColor,
              boxShadow: statusGlow,
              animation: engineStatus?.status === "active" ? "kiloForge-pulse 2s infinite" : "none",
            }}
          />
          <span style={{ fontSize: "13px", color: statusColor, fontWeight: 600 }}>
            {loading ? "Invocando..." : engineStatus?.alchemical_label || "Desconocido"}
          </span>
          <button
            onClick={() => {
              fetchStatus()
              fetchSessions()
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "rgba(255,255,255,0.4)",
              padding: "4px",
            }}
            aria-label="Refresh status"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Engine Status Card */}
      {engineStatus && (
        <div
          style={{
            background: "rgba(20, 15, 40, 0.8)",
            border: `1px solid ${statusColor}30`,
            borderRadius: "12px",
            padding: "16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <Cpu size={20} color={statusColor} />
            <div>
              <div style={{ fontSize: "14px", fontWeight: 600, color: "#fff" }}>
                {engineStatus.status === "active"
                  ? "Forja Arcana Activa"
                  : "Forja en Reposo"}
              </div>
              <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "2px" }}>
                {engineStatus.status === "active"
                  ? `${engineStatus.session_count} sesión(es) arcana(s) • ${engineStatus.server_url}`
                  : "Inicia con: kilo serve --port 4096 --hostname 0.0.0.0"}
              </div>
            </div>
          </div>
          {engineStatus.status === "offline" && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.1)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "8px",
                padding: "8px 12px",
                fontSize: "12px",
                color: "#fca5a5",
                fontFamily: "monospace",
              }}
            >
              npm install -g @kilocode/cli
            </div>
          )}
        </div>
      )}

      {/* Sessions Section */}
      <div style={{ marginBottom: "20px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "12px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontSize: "14px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.8)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Sesiones Arcanas ({sessions.length})
          </h3>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            disabled={engineStatus?.status !== "active"}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background:
                engineStatus?.status === "active"
                  ? "linear-gradient(135deg, #6d28d9, #2563eb)"
                  : "rgba(255,255,255,0.05)",
              border: "none",
              borderRadius: "8px",
              padding: "8px 14px",
              color:
                engineStatus?.status === "active" ? "#fff" : "rgba(255,255,255,0.3)",
              fontSize: "13px",
              fontWeight: 600,
              cursor: engineStatus?.status === "active" ? "pointer" : "not-allowed",
              transition: "all 0.2s",
            }}
          >
            <Plus size={14} />
            Nueva Sesión
          </button>
        </div>

        {/* Create Session Form */}
        {showCreateForm && (
          <div
            style={{
              background: "rgba(109, 40, 217, 0.1)",
              border: "1px solid rgba(109, 40, 217, 0.3)",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "12px",
            }}
          >
            <h4 style={{ margin: "0 0 12px", fontSize: "13px", color: "#a78bfa", fontWeight: 600 }}>
              ✨ Abrir Nueva Sesión Arcana
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  DIRECTORIO
                </label>
                <input
                  value={createForm.directory}
                  onChange={e => setCreateForm(p => ({ ...p, directory: e.target.value }))}
                  style={inputStyle}
                  placeholder="/workspace"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  MODO AGENTE
                </label>
                <select
                  value={createForm.agent}
                  onChange={e => setCreateForm(p => ({ ...p, agent: e.target.value }))}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  {AGENT_MODES.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  MODELO (opcional)
                </label>
                <input
                  value={createForm.model}
                  onChange={e => setCreateForm(p => ({ ...p, model: e.target.value }))}
                  style={inputStyle}
                  placeholder="anthropic/claude-sonnet-4-20250514"
                />
              </div>
              <div>
                <label
                  style={{
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.5)",
                    display: "block",
                    marginBottom: "4px",
                  }}
                >
                  TÍTULO (opcional)
                </label>
                <input
                  value={createForm.title}
                  onChange={e => setCreateForm(p => ({ ...p, title: e.target.value }))}
                  style={inputStyle}
                  placeholder="Mi Sesión de Código"
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={createSession} style={primaryBtnStyle}>
                ✨ Abrir Sesión
              </button>
              <button onClick={() => setShowCreateForm(false)} style={ghostBtnStyle}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "32px",
              color: "rgba(255,255,255,0.3)",
              border: "1px dashed rgba(139, 92, 246, 0.2)",
              borderRadius: "12px",
            }}
          >
            <Terminal size={32} style={{ marginBottom: "12px", opacity: 0.4 }} />
            <p style={{ margin: 0, fontSize: "14px" }}>No hay sesiones arcanas activas</p>
            <p style={{ margin: "4px 0 0", fontSize: "12px", opacity: 0.7 }}>
              {engineStatus?.status === "active"
                ? "Abre una nueva sesión para comenzar"
                : "Inicia el motor KiloCode primero"}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {sessions.map(session => (
              <SessionCard
                key={session.id}
                session={session}
                isExpanded={expandedSessions.has(session.id)}
                isStreaming={streamingSessionId === session.id}
                isActive={activeTaskSession === session.id}
                taskInput={activeTaskSession === session.id ? taskInput : ""}
                taskLogs={activeTaskSession === session.id ? taskLogs : []}
                logsEndRef={activeTaskSession === session.id ? logsEndRef : null}
                onToggleExpand={() => toggleSession(session.id)}
                onSetActive={() =>
                  setActiveTaskSession(session.id === activeTaskSession ? null : session.id)
                }
                onTaskInputChange={setTaskInput}
                onSendTask={() => sendTask(session.id)}
                onAbort={() => abortSession(session.id)}
                onDelete={() => deleteSession(session.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Quick Run Section */}
      <div
        style={{
          background: "rgba(20, 15, 40, 0.8)",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "12px",
          padding: "16px",
        }}
      >
        <h3
          style={{
            margin: "0 0 12px",
            fontSize: "13px",
            fontWeight: 600,
            color: "rgba(255,255,255,0.6)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          ⚡ Ritual Rápido (Autónomo)
        </h3>
        <textarea
          value={quickRunText}
          onChange={e => setQuickRunText(e.target.value)}
          placeholder="Describe la tarea que el Alquimista debe ejecutar de forma autónoma..."
          rows={3}
          style={{
            ...inputStyle,
            width: "100%",
            resize: "vertical",
            marginBottom: "10px",
            fontFamily: "inherit",
          }}
        />
        <button
          onClick={quickRun}
          disabled={!quickRunText.trim() || quickRunLoading}
          style={{
            ...primaryBtnStyle,
            width: "100%",
            justifyContent: "center",
            opacity: !quickRunText.trim() || quickRunLoading ? 0.5 : 1,
          }}
        >
          {quickRunLoading ? "Invocando..." : "⚡ Invocar Ritual Autónomo"}
        </button>
      </div>

      <style>{`
        @keyframes kiloForge-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes kiloForge-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes kiloForge-dotPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}

// ── Session Card ───────────────────────────────────────────────────────────────

interface SessionCardProps {
  session: KiloSession
  isExpanded: boolean
  isStreaming: boolean
  isActive: boolean
  taskInput: string
  taskLogs: KiloMessage[]
  logsEndRef: React.RefObject<HTMLDivElement | null> | null
  onToggleExpand: () => void
  onSetActive: () => void
  onTaskInputChange: (v: string) => void
  onSendTask: () => void
  onAbort: () => void
  onDelete: () => void
}

function SessionCard({
  session,
  isExpanded,
  isStreaming,
  isActive,
  taskInput,
  taskLogs,
  logsEndRef,
  onToggleExpand,
  onSetActive,
  onTaskInputChange,
  onSendTask,
  onAbort,
  onDelete,
}: SessionCardProps) {
  const statusColor =
    session.status === "running"
      ? "#8b5cf6"
      : session.status === "error"
      ? "#ef4444"
      : session.status === "completed"
      ? "#10b981"
      : "#60a5fa"

  const agentMode = AGENT_MODES.find(m => m.id === session.agent) || AGENT_MODES[1]

  return (
    <div
      style={{
        background: "rgba(20, 15, 40, 0.8)",
        border: `1px solid ${isExpanded ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.15)"}`,
        borderRadius: "12px",
        overflow: "hidden",
        transition: "border-color 0.2s",
      }}
    >
      {/* Session Header */}
      <div
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          cursor: "pointer",
        }}
        onClick={onToggleExpand}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, minWidth: 0 }}
        >
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: statusColor,
              flexShrink: 0,
              animation: isStreaming ? "kiloForge-dotPulse 1s infinite" : "none",
            }}
          />
          <div style={{ minWidth: 0 }}>
            <div
              style={{
                fontSize: "13px",
                fontWeight: 600,
                color: "#e2e8f0",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.title || `Sesión ${session.id?.slice(0, 8)}...`}
            </div>
            <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "2px" }}>
              {agentMode.label} •{" "}
              {session.status === "running"
                ? "En Transmutación KiloCode"
                : session.status === "completed"
                ? "Transmutación Completa"
                : session.alchemical_label || "Esencia Vinculada"}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {session.directory && (
            <span
              style={{
                fontSize: "10px",
                background: "rgba(255,255,255,0.05)",
                padding: "2px 6px",
                borderRadius: "4px",
                color: "rgba(255,255,255,0.4)",
                fontFamily: "monospace",
                maxWidth: "120px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {session.directory}
            </span>
          )}
          {session.messageCount !== undefined && (
            <span
              style={{
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                background: "rgba(255,255,255,0.04)",
                padding: "2px 6px",
                borderRadius: "4px",
              }}
            >
              {session.messageCount} msgs
            </span>
          )}
          {isExpanded ? (
            <ChevronUp size={14} color="rgba(255,255,255,0.4)" />
          ) : (
            <ChevronDown size={14} color="rgba(255,255,255,0.4)" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "12px 16px" }}>
          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button
              onClick={e => {
                e.stopPropagation()
                onSetActive()
              }}
              style={isActive ? primaryBtnStyle : ghostBtnStyle}
            >
              <Play size={12} />
              {isActive ? "Ocultar Tarea" : "Enviar Tarea"}
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                onAbort()
              }}
              style={dangerGhostBtnStyle}
            >
              <Square size={12} />
              Abortar
            </button>
            <button
              onClick={e => {
                e.stopPropagation()
                onDelete()
              }}
              style={{ ...dangerGhostBtnStyle, marginLeft: "auto" }}
              aria-label="Delete session"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {/* Task Input (when active) */}
          {isActive && (
            <div style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  value={taskInput}
                  onChange={e => onTaskInputChange(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && onSendTask()}
                  placeholder="Describe la transmutación a ejecutar..."
                  style={{ ...inputStyle, flex: 1 }}
                  autoFocus
                />
                <button
                  onClick={onSendTask}
                  disabled={!taskInput.trim() || isStreaming}
                  style={{ ...primaryBtnStyle, padding: "8px 12px" }}
                  aria-label="Send task"
                >
                  {isStreaming ? (
                    <RefreshCw
                      size={14}
                      style={{ animation: "kiloForge-spin 1s linear infinite" }}
                    />
                  ) : (
                    <Zap size={14} />
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Task Logs Stream */}
          {isActive && taskLogs.length > 0 && (
            <div
              style={{
                background: "rgba(0, 0, 0, 0.4)",
                borderRadius: "8px",
                padding: "10px",
                maxHeight: "200px",
                overflowY: "auto",
                fontFamily: "monospace",
                fontSize: "11px",
                lineHeight: "1.6",
              }}
            >
              {taskLogs.map((log, i) => (
                <div
                  key={i}
                  style={{ color: getEventColor(log.type), marginBottom: "2px" }}
                >
                  <span style={{ color: "rgba(255,255,255,0.3)", marginRight: "8px" }}>
                    {log.alchemical_context || log.type}
                  </span>
                  {log.content && (
                    <span style={{ color: "rgba(255,255,255,0.8)" }}>
                      {typeof log.content === "string" ? log.content.slice(0, 200) : ""}
                    </span>
                  )}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function getEventColor(type: string): string {
  if (type?.includes("error")) return "#f87171"
  if (type?.includes("tool")) return "#34d399"
  if (type?.includes("complete")) return "#60a5fa"
  if (type?.includes("start")) return "#a78bfa"
  return "rgba(255,255,255,0.6)"
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  padding: "8px 12px",
  color: "#e2e8f0",
  fontSize: "13px",
  outline: "none",
  boxSizing: "border-box",
}

const primaryBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "linear-gradient(135deg, #6d28d9, #2563eb)",
  border: "none",
  borderRadius: "8px",
  padding: "8px 14px",
  color: "#fff",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
  transition: "opacity 0.2s",
  whiteSpace: "nowrap",
}

const ghostBtnStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "6px",
  background: "rgba(255, 255, 255, 0.05)",
  border: "1px solid rgba(255, 255, 255, 0.1)",
  borderRadius: "8px",
  padding: "8px 14px",
  color: "rgba(255, 255, 255, 0.7)",
  fontSize: "13px",
  fontWeight: 500,
  cursor: "pointer",
  whiteSpace: "nowrap",
}

const dangerGhostBtnStyle: React.CSSProperties = {
  ...ghostBtnStyle,
  border: "1px solid rgba(239, 68, 68, 0.2)",
  color: "#f87171",
}
