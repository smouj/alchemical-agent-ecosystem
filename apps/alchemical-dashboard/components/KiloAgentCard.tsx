"use client"

import { useState } from "react"
import { Zap, Code, Search, GitBranch, Brain, Terminal, Clock, Activity } from "lucide-react"

interface KiloAgentCardProps {
  name: string
  role: string
  status: "active" | "idle" | "running" | "error" | "offline"
  kilocodeSession?: string | null
  skills: string[]
  tools: string[]
  latency?: number
  model?: string
  service?: string
  onLaunchKiloSession?: () => void
  onViewSession?: () => void
}

const STATUS_LABELS: Record<string, { label: string; color: string; glow: string }> = {
  active: {
    label: "Esencia Vinculada",
    color: "#10b981",
    glow: "0 0 15px rgba(16, 185, 129, 0.3)",
  },
  idle: {
    label: "Fluyendo en el Éter",
    color: "#60a5fa",
    glow: "0 0 15px rgba(96, 165, 250, 0.3)",
  },
  running: {
    label: "En Transmutación KiloCode",
    color: "#8b5cf6",
    glow: "0 0 20px rgba(139, 92, 246, 0.5)",
  },
  error: {
    label: "Conjuro Fracturado",
    color: "#ef4444",
    glow: "0 0 15px rgba(239, 68, 68, 0.3)",
  },
  offline: {
    label: "Esencia Dormida",
    color: "rgba(255,255,255,0.3)",
    glow: "none",
  },
}

const SKILL_ICONS: Record<string, React.ReactNode> = {
  coding: <Code size={10} />,
  debugging: <Search size={10} />,
  planning: <Brain size={10} />,
  git: <GitBranch size={10} />,
  terminal: <Terminal size={10} />,
}

export default function KiloAgentCard({
  name,
  role,
  status,
  kilocodeSession,
  skills,
  tools: _tools,
  latency,
  model,
  service: _service,
  onLaunchKiloSession,
  onViewSession,
}: KiloAgentCardProps) {
  const [hovered, setHovered] = useState(false)
  const statusInfo = STATUS_LABELS[status] || STATUS_LABELS.idle

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "rgba(30, 20, 60, 0.95)" : "rgba(20, 15, 40, 0.8)",
        border: `1px solid ${hovered ? "rgba(139, 92, 246, 0.4)" : "rgba(139, 92, 246, 0.15)"}`,
        borderRadius: "16px",
        padding: "20px",
        transition: "all 0.3s",
        boxShadow: hovered ? "0 8px 32px rgba(109, 40, 217, 0.2)" : "none",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow orb on hover for running state */}
      {hovered && status === "running" && (
        <div
          style={{
            position: "absolute",
            top: "-20px",
            right: "-20px",
            width: "80px",
            height: "80px",
            background:
              "radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
            borderRadius: "50%",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              background:
                "linear-gradient(135deg, rgba(109, 40, 217, 0.4), rgba(37, 99, 235, 0.4))",
              borderRadius: "12px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `1px solid ${statusInfo.color}40`,
              boxShadow: statusInfo.glow,
            }}
          >
            <Zap size={20} color={statusInfo.color} />
          </div>
          <div>
            <div
              style={{ fontSize: "15px", fontWeight: 700, color: "#f0f0ff", lineHeight: 1 }}
            >
              {name}
            </div>
            <div
              style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)", marginTop: "3px" }}
            >
              {role}
            </div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: statusInfo.color,
              boxShadow: statusInfo.glow,
              animation:
                status === "running" ? "kiloAgentCard-pulse 1.5s ease-in-out infinite" : "none",
            }}
          />
        </div>
      </div>

      {/* Status Badge */}
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          background: `${statusInfo.color}15`,
          border: `1px solid ${statusInfo.color}30`,
          borderRadius: "20px",
          padding: "4px 10px",
          marginBottom: "14px",
        }}
      >
        <Activity size={10} color={statusInfo.color} />
        <span style={{ fontSize: "11px", color: statusInfo.color, fontWeight: 600 }}>
          {statusInfo.label}
        </span>
      </div>

      {/* KiloCode Session Badge */}
      {kilocodeSession && (
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "rgba(139, 92, 246, 0.1)",
            border: "1px solid rgba(139, 92, 246, 0.3)",
            borderRadius: "20px",
            padding: "4px 10px",
            marginBottom: "14px",
            marginLeft: "6px",
            cursor: "pointer",
          }}
          onClick={onViewSession}
        >
          <Zap size={10} color="#8b5cf6" />
          <span style={{ fontSize: "11px", color: "#8b5cf6", fontWeight: 600 }}>
            Sesión Arcana Activa
          </span>
        </div>
      )}

      {/* Model */}
      {model && (
        <div
          style={{
            fontSize: "11px",
            color: "rgba(255,255,255,0.3)",
            marginBottom: "12px",
            fontFamily: "monospace",
          }}
        >
          {model}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div style={{ marginBottom: "12px" }}>
          <div
            style={{
              fontSize: "10px",
              color: "rgba(255,255,255,0.3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "6px",
            }}
          >
            Habilidades
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
            {skills.slice(0, 4).map(skill => (
              <span
                key={skill}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px",
                  background: "rgba(96, 165, 250, 0.1)",
                  border: "1px solid rgba(96, 165, 250, 0.2)",
                  borderRadius: "4px",
                  padding: "2px 6px",
                  fontSize: "10px",
                  color: "#93c5fd",
                }}
              >
                {SKILL_ICONS[skill] || <Zap size={10} />}
                {skill}
              </span>
            ))}
            {skills.length > 4 && (
              <span
                style={{
                  fontSize: "10px",
                  color: "rgba(255,255,255,0.3)",
                  alignSelf: "center",
                }}
              >
                +{skills.length - 4}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer: Latency + Actions */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginTop: "4px",
        }}
      >
        {latency !== undefined && (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <Clock size={11} color="rgba(255,255,255,0.3)" />
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)" }}>
              {latency}ms
            </span>
          </div>
        )}
        {onLaunchKiloSession && !kilocodeSession && (
          <button
            onClick={e => {
              e.stopPropagation()
              onLaunchKiloSession()
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              background: "rgba(139, 92, 246, 0.1)",
              border: "1px solid rgba(139, 92, 246, 0.3)",
              borderRadius: "6px",
              padding: "4px 8px",
              color: "#a78bfa",
              fontSize: "11px",
              cursor: "pointer",
            }}
          >
            <Zap size={10} />
            Forjar con KiloCode
          </button>
        )}
      </div>

      <style>{`
        @keyframes kiloAgentCard-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.2); }
        }
      `}</style>
    </div>
  )
}
