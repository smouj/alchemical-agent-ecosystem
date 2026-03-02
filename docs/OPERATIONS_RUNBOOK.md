# Operations Runbook

Canonical day-2 operations for local/prod-like environments.

---

## 🏛️ Arquitectura v3 (Simplificada — Marzo 2026)

La infraestructura ha sido **simplificada radicalmente** de 15 a 5 servicios:

| Servicio | Puerto | Función |
|----------|--------|---------|
| `caddy` | 80/443 | Reverse proxy y TLS |
| `redis` | 6379 | Cache, pub/sub, colas |
| `chromadb` | 8000 | Vector store embeddings |
| `alchemical-gateway` | 7411 | API principal y orquestador |
| `alchemical-dashboard` | 8080 | UI Next.js |

### Cambios importantes

- **Eliminados**: 10 microservicios stubs de agentes (velktharion, synapsara, kryonexus, etc.)
- **Motivo**: Eran stubs vacíos sin lógica real. Los agentes ahora se gestionan dinámicamente vía SQLite en el gateway.
- **Legacy**: Código movido a `services-deprecated/` (solo referencia)

### Diagrama de arquitectura v3

```
┌─────────────────┐
│  Caddy Proxy    │ ← Única entrada HTTP (:80/:443)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────┐
│Gateway│  │Dashboard│
│:7411  │  │:3000   │
└───┬───┘  └───────┘
    │
    ├──── Redis (:6379)
    └──── ChromaDB (:8000)
```

### Endpoints de health check

```bash
curl -fsS http://localhost/gateway/health      # Gateway
curl -fsS http://localhost/gateway/ready       # Ready check
curl -fsS http://localhost:8080/api/system     # Dashboard
curl -fsS http://localhost:80/health           # Caddy
```

---

## 1) Daily health ritual

```bash
./scripts/alchemical doctor
./scripts/alchemical status
curl -fsS http://localhost/gateway/health
curl -fsS http://localhost/gateway/ready
```

Optional deeper checks:

```bash
curl -fsS http://localhost/gateway/events | jq '.count'
curl -fsS http://localhost/gateway/usage/summary | jq '.summary'
```

### Agent & Provider API Checks

```bash
# List available AI providers
curl -fsS http://localhost/gateway/api/v1/providers | jq '.providers | keys'

# List default agents
curl -fsS http://localhost/gateway/api/v1/agents | jq '.agents[].name'

# Check OpenClaw integration status
curl -fsS http://localhost/gateway/api/v1/openclaw/status | jq

# Check KiloCode integration status
curl -fsS http://localhost/gateway/api/v1/kilocode/status | jq
```

---

## 2) Safe update (recommended)

```bash
./scripts/alchemical update-safe
```

`update-safe` covers:
1. lock (avoid concurrent updates)
2. fetch/rebase
3. secret scan + checks
4. deploy (`docker compose up -d --build`)
5. smoke tests

---

## 3) Fast update

```bash
./scripts/alchemical update
```

Use only when you explicitly accept lower safety guardrails.

---

## 4) Rollback

```bash
./scripts/alchemical rollback
```

After rollback, rerun health checks and validate chat/dispatch paths.

---

## 5) Logs and incident triage

```bash
# Logs de servicios activos (arquitectura simplificada v3)
./scripts/alchemical logs alchemical-gateway
./scripts/alchemical logs alchemical-dashboard
./scripts/alchemical logs redis
./scripts/alchemical logs chromadb
./scripts/alchemical logs caddy
```

> **Nota**: Los servicios de agentes individuales (velktharion, synapsara, etc.) fueron eliminados en v3. Los agentes ahora se gestionan dinámicamente vía gateway.

Incident workflow:
1. confirm failing endpoint (`/gateway/health`),
2. inspect gateway logs (principal punto de fallo),
3. verify auth/token/role context,
4. apply minimal fix,
5. revalidate health via `/gateway/ready`.

---

## 6) Security controls

```bash
./scripts/alchemical scan-secrets
```

Security notes:
- Gateway token from `.env` (`ALCHEMICAL_GATEWAY_TOKEN`)
- Optional inbound webhook secrets:
  - `ALCHEMICAL_TELEGRAM_WEBHOOK_SECRET`
  - `ALCHEMICAL_DISCORD_WEBHOOK_SECRET`
- Never store raw connector secrets; use `token_ref` metadata.

---

## 7) GitHub project/issues synchronization

```bash
# full maintenance cycle
bash ops/project-maintenance.sh

# safe sync only (default, no auto-seed)
bash ops/sync-project-with-repo.sh

# explicit seed only when requested
bash ops/sync-project-with-repo.sh seed

# cleanup duplicate/closed noise + relink open issues
bash ops/project-tidy.sh

# one-command hygiene ritual
bash ops/ritual-sync.sh
```

If `gh project` returns 401:

```bash
unset GITHUB_TOKEN GH_TOKEN || true
gh auth switch -u smouj
gh auth refresh -s project
```

---

## 8) Production-ready preflight checklist

Before deploying critical changes:
- [ ] `git status` clean
- [ ] secret scan passed
- [ ] dashboard build passed
- [ ] gateway syntax checks passed
- [ ] rollback path verified
- [ ] post-deploy health checks scripted

After deployment:
- [ ] `/gateway/health` OK
- [ ] `/gateway/ready` OK
- [ ] agent list loads real logical agents
- [ ] chat ask/roundtable functional
- [ ] project snapshot synced

---

## 9) AI Providers & Integrations API

The Gateway exposes endpoints for managing AI providers and agent integrations.

### Base URL
```
http://localhost/gateway/api/v1
```

### Authentication
All endpoints require `Authorization: Bearer <ALCHEMICAL_GATEWAY_TOKEN>` header.

### Providers

**List available providers:**
```bash
curl -fsS -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/providers | jq
```

**Get provider details:**
```bash
curl -fsS -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/providers/kilocode | jq
```

**Test provider connectivity:**
```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"model": "anthropic/claude-sonnet-4"}' \
  http://localhost/gateway/api/v1/providers/kilocode/test | jq
```

### Agents CRUD

**List all agents:**
```bash
curl -fsS -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/agents | jq
```

**Create custom agent:**
```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Agent",
    "role": "catalizador",
    "model_provider": "kilocode",
    "model_name": "anthropic/claude-sonnet-4",
    "system_prompt": "You are a helpful assistant...",
    "skills": ["code", "analysis"],
    "description": "My custom agent description"
  }' \
  http://localhost/gateway/api/v1/agents | jq
```

**Update agent:**
```bash
curl -fsS -X PUT \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"system_prompt": "Updated prompt..."}' \
  http://localhost/gateway/api/v1/agents/{agent_id} | jq
```

**Delete agent:**
```bash
curl -fsS -X DELETE \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/agents/{agent_id} | jq
```

### OpenClaw Integration

**Check status:**
```bash
curl -fsS -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/openclaw/status | jq
```

**Send message:**
```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello OpenClaw", "context": {}}' \
  http://localhost/gateway/api/v1/openclaw/message | jq
```

### KiloCode Integration

**Check status:**
```bash
curl -fsS -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  http://localhost/gateway/api/v1/kilocode/status | jq
```

**Chat with KiloCode:**
```bash
curl -fsS -X POST \
  -H "Authorization: Bearer $ALCHEMICAL_GATEWAY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "model": "anthropic/claude-sonnet-4",
    "stream": false
  }' \
  http://localhost/gateway/api/v1/kilocode/chat | jq
```

### Environment Variables

Required environment variables (see `.env.example`):

```bash
# KiloCode
KILO_API_KEY=your_kilo_api_key
KILO_BASE_URL=https://api.kilo.ai/api/gateway

# OpenClaw
OPENCLAW_API_KEY=your_openclaw_key
OPENCLAW_BASE_URL=https://api.openclaw.ai/v1

# Other providers (optional)
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
GOOGLE_API_KEY=your_google_key
OLLAMA_HOST=http://localhost:11434
```
