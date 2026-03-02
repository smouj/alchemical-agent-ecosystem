<h1 align="center">⚗️ Alchemical Agent Ecosystem</h1>

<p align="center">
  <img src="./assets/branding/variants/logo-horizontal-v2.svg" width="820" alt="Alchemical Agent Ecosystem — Magnum Opus" />
</p>

<p align="center"><em>Where Intelligence is Forged, Not Fetched.</em></p>

<p align="center">
  <img src="https://readme-typing-svg.demolab.com?font=JetBrains+Mono&weight=600&size=18&duration=3200&pause=900&color=FFD700&center=true&vCenter=true&multiline=false&width=700&lines=Local-first+AI+orchestration+with+KiloCode;FastAPI+Gateway+%C2%B7+Next.js+Dashboard;Redis+%C2%B7+ChromaDB+%C2%B7+Real-time+SSE;OpenClaw+agent+integration;Free+tier+capable+with+minimax" alt="Typing SVG" />
</p>

<p align="center">
  <a href="./LICENSE"><img src="https://img.shields.io/github/license/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=4B0082&labelColor=1a1a2e" alt="License"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/commits/main"><img src="https://img.shields.io/github/last-commit/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=FFD700&labelColor=1a1a2e" alt="Last Commit"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/actions"><img src="https://img.shields.io/github/actions/workflow/status/smouj/alchemical-agent-ecosystem/ci.yml?style=for-the-badge&label=CI&color=00FFAA&labelColor=1a1a2e" alt="CI"/></a>
  <a href="https://github.com/smouj/alchemical-agent-ecosystem/releases"><img src="https://img.shields.io/github/v/release/smouj/alchemical-agent-ecosystem?style=for-the-badge&color=4B0082&labelColor=1a1a2e" alt="Release"/></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/v2.0-4B0082?style=for-the-badge&labelColor=1a1a2e" alt="v2.0"/>
  <img src="https://img.shields.io/badge/Next.js%2015-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js 15"/>
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>
  <img src="https://img.shields.io/badge/KiloCode_AI-4B0082?style=for-the-badge&logoColor=white" alt="KiloCode AI"/>
  <img src="https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/ChromaDB-00C853?style=for-the-badge&logoColor=white" alt="ChromaDB"/>
  <img src="https://img.shields.io/badge/Docker%20Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker Compose"/>
  <img src="https://img.shields.io/badge/SSE%20Realtime-00BCD4?style=for-the-badge&logoColor=white" alt="SSE Realtime"/>
  <img src="https://img.shields.io/badge/OpenClaw-FFD700?style=for-the-badge&logoColor=white" alt="OpenClaw"/>
</p>

---

## Arquitectura Real

```
┌─────────────────────────────────────────────────────────────┐
│                    Alchemical Ecosystem                       │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐   ┌─────────────┐   ┌─────────────┐       │
│  │   Caddy     │   │  Dashboard  │   │   Gateway   │       │
│  │  :81/:444   │   │  Next.js    │   │  FastAPI    │       │
│  │             │   │   :8080     │   │   :7411     │       │
│  └──────┬──────┘   └──────┬──────┘   └──────┬──────┘       │
│         │                  │                  │               │
│         └──────────────────┼──────────────────┘               │
│                            │                                  │
│  ┌─────────────┐   ┌──────┴──────┐   ┌─────────────┐        │
│  │   Redis     │   │   SQLite    │   │  ChromaDB   │        │
│  │  :6379      │   │  Agents DB  │   │   :8000     │        │
│  │  Cache/Pub  │   │             │   │   Vector    │        │
│  └─────────────┘   └─────────────┘   └─────────────┘        │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              KiloCode AI Gateway                     │    │
│  │         (Modelos gratuitos :free)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### Servicios Docker (5)

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| `alchemy-caddy` | 81, 444 | Reverse proxy + TLS |
| `alchemy-dashboard` | 8080 | UI Next.js 15 |
| `alchemy-gateway` | 7411 | API FastAPI |
| `alchemy-redis` | 6379 | Cache + Pub/Sub |
| `alchemy-chromadb` | 8000 | Vector store |

### Agentes Activos (14)

**Agentes Alchemical:**
- `alquimista-mayor` - Orquestador principal
- `investigador-analista` - Investigación y análisis
- `ingeniero-constructor` - Desarrollo técnico
- `creador-visual` - Diseño visual
- `redactor-narrador` - Redacción y contenido

**Agentes OpenClaw (sincronizados):**
- `main` - Agente principal
- `vps-ops` - Operaciones VPS
- `rpgclaw-ops` - Desarrollo RPGCLAW
- `flickclaw-ops` - Desarrollo FlickClaw
- `img-ops` - Generación visual
- `threejs-ops` - 3D y Three.js
- `coder` - Coding general
- `researcher` - Investigación
- `alchemical-ops` - Operaciones Alchemical

---

## 🚀 Quickstart

```bash
# Clonar el proyecto
git clone https://github.com/smouj/alchemical-agent-ecosystem.git
cd alchemical-agent-ecosystem

# Configurar variables de entorno
cp .env.example .env

# Levantar servicios
docker compose up -d

# Verificar estado
docker compose ps

# Acceder al Dashboard
# http://localhost:81  (a través de Caddy)
# http://localhost:8080  (directo)

# API Gateway
# http://localhost:7411
# Docs: http://localhost:7411/docs
```

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `ALCHEMICAL_GATEWAY_TOKEN` | Token para la API | (se genera automáticamente) |
| `KILO_API_KEY` | API key de KiloCode (opcional para modelos free) | - |
| `REDIS_PASSWORD` | Password de Redis | `alchemical` |
| `GATEWAY_SECRET` | Secret para JWT | - |

---

## 📡 API Endpoints

### Agentes

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/agents` | Listar todos los agentes |
| POST | `/api/v1/agents` | Crear agente |
| GET | `/api/v1/agents/{name}` | Obtener agente |
| DELETE | `/api/v1/agents/{name}` | Eliminar agente |
| POST | `/api/v1/sync/openclaw-agents` | Sincronizar agentes OpenClaw |

### Chat

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/kilocode/chat` | Chat con modelo KiloCode |
| POST | `/api/v1/chat/ask` | Pregunta a un agente |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/v1/providers` | Proveedores LLM disponibles |

---

## 🎨 Dashboard Features

- **💬 Chat del Caldero** - Interacción multi-agente en tiempo real
- **🧩 Agent Node Studio** - Editor visual de flujos (WIP)
- **🤖 Runtime de Agentes** - Monitorización de agentes activos
- **📜 Logs & Telemetría** - Streaming de logs en tiempo real
- **🛠️ Administración** - Configuración del sistema

---

## 🔄 Sincronización con OpenClaw

El ecosistema se integra con **OpenClaw** para gestionar agentes:

```bash
# Sincronizar agentes de OpenClaw
curl -X POST http://localhost:7411/api/v1/sync/openclaw-agents
```

Los agentes de OpenClaw se sincronizan automáticamente con la base de datos SQLite del gateway.

---

## 📝 Changelog

### v2.0 (2026-03-02)
- ✅ Integración completa con KiloCode AI (modelos gratuitos)
- ✅ Sincronización de agentes OpenClaw
- ✅ Dashboard Next.js 15 funcional
- ✅ API Gateway FastAPI
- ✅ SQLite para gestión de agentes
- ✅ Limpieza de código hardcodeado
- ✅ Documentación actualizada
- ✅ Corrección de errores de schema en DB
- ✅ Integración dashboard ↔ gateway operativa

### v1.x
- Versiones anteriores con arquitectura experimental

---

## 📄 License

MIT License - Ver LICENSE para más detalles.

---

<p align="center">
  <em>⚗️ The Magnum Opus of local-first AI orchestration ⚗️</em>
</p>
