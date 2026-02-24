# Alchemical Agent Ecosystem

<p align="center">
  <img src="./assets/branding/logo.svg" alt="Alchemical Robot Logo" width="180" />
</p>

![License](https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem)
![Last Commit](https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem)
![Docker](https://img.shields.io/badge/runtime-Docker%20Compose-2496ED)
![Local AI](https://img.shields.io/badge/LLM-Local%20Only-success)

Unified, self-hosted multi-agent platform focused on **local-first execution**, **no paid APIs**, and **low-cost operation**.

## Features
- 10 specialized agent services (7401-7410)
- Reverse proxy with Caddy (Docker service discovery, no hardcoded IPs)
- Local stack: Redis + ChromaDB + Ollama
- One-command installer flow (`install.sh`)
- Self-hosted architecture suitable for low-cost VPS and local machines

## Project Structure
- `services/*` → agent APIs
- `infra/caddy` → reverse proxy config
- `infra/scripts/install.sh` → deployment bootstrap
- `docs/*` → architecture and operations

## Quick Start (local)
```bash
cd /mnt/d/alchemical-agent-ecosystem
./scripts/alchemical wizard
```

### CLI (one-command ops)
```bash
./scripts/alchemical doctor
./scripts/alchemical setup-hooks
./scripts/alchemical scan-secrets
./scripts/alchemical install --domain localhost --profile standard --model phi3:mini
./scripts/alchemical up
./scripts/alchemical status
./scripts/alchemical logs velktharion
./scripts/alchemical dashboard
```

### Perfil 2GB RAM (recomendado en equipos limitados)
```bash
./scripts/alchemical install --profile min --domain localhost
# o levantar rápido en mínimo:
./scripts/alchemical up-min
```
Este perfil arranca core + gateway + 2 agentes (`velktharion`, `synapsara`) para mantener consumo bajo.

## Planned Remote Install Command
```bash
curl -fsSL https://smouj.ai/install.sh | bash -s -- --domain your-domain.com
```

## Alchemical Control Panel (Dashboard)
Frontend premium (dark-only, glassmorphism + neumorphism sutil) **con datos reales** del stack local (docker compose + health checks + logs), sin mocks en la UI principal.

**Ruta:** `apps/alchemical-dashboard`

### Ejecutar (local)
```bash
cd /mnt/d/alchemical-agent-ecosystem/apps/alchemical-dashboard
npm install
npm run dev
```

### Mapa rápido
- `app/layout.tsx` → shell principal (sidebar fija + header sticky)
- `app/page.tsx` → home del dashboard
- `app/globals.css` → tokens visuales 2026 + efectos glass/grain
- `components/Sidebar.tsx` → navegación y estados core reales
- `components/HeaderBar.tsx` → métricas CPU/RAM reales (docker stats)
- `components/AgentCard.tsx` → tarjeta de agente
- `components/CreateAgentWizard.tsx` → wizard 4 pasos + CTA "Transmutar Agente"
- `components/AgentsTable.tsx` → tabla de gestión + acciones start/stop/restart + dispatch
- `components/SettingsPanel.tsx` → configuración avanzada persistente
- `components/LogsMonitor.tsx` → logs reales por servicio
- `app/api/*` → endpoints runtime (agents, control, logs, system, metrics, config)
- `lib/agents.ts` y `lib/config.ts` → catálogo de agentes y configuración

## License
MIT
