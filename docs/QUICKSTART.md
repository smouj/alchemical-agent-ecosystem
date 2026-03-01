# 🚀 Alchemical Ecosystem - Quickstart Guide

Guía rápida para empezar a usar el Ecosistema de Agentes Alchemical.

---

## 📋 Tabla de Contenidos

1. [URLs de Acceso](#-urls-de-acceso)
2. [Configuración Inicial](#-configuración-inicial)
3. [Crear un Agente](#-crear-un-agente)
4. [Usar el Chat](#-usar-el-chat)
5. [Ejemplos de Integración](#-ejemplos-de-integración)
6. [Solución de Problemas](#-solución-de-problemas)

---

## 🌐 URLs de Acceso

| Servicio | URL Local | URL VPS (Producción) |
|----------|-----------|---------------------|
| **Dashboard** | http://localhost:3000 | http://76.13.37.123:8080 |
| **Gateway API** | http://localhost:7411 | http://76.13.37.123:7411 |
| **Documentación API** | http://localhost:7411/docs | http://76.13.37.123:7411/docs |

### Endpoints del Gateway

```bash
# Health check
curl http://localhost:7411/health

# Listar agentes
curl http://localhost:7411/api/v1/agents

# OpenClaw status
curl http://localhost:7411/api/v1/openclaw/status

# KiloCode status
curl http://localhost:7411/api/v1/kilocode/status
```

---

## ⚙️ Configuración Inicial

### 1. Configurar Variables de Entorno (VPS)

Conéctate al VPS y edita el archivo `.env`:

```bash
ssh vps-hostinger
cd /opt/flickclaw-saas
sudo nano .env
```

### 2. Variables Requeridas

```bash
# ── KiloCode AI Gateway ──────────────────────────────────────────
# Obtén tu API key en: https://app.kilo.ai (Profile → scroll abajo)
# Modelos gratuitos disponibles (sin key para modelos con sufijo :free)
KILO_API_KEY=tu_api_key_aqui
KILO_DEFAULT_MODEL=anthropic/claude-sonnet-4.5
KILO_BASE_URL=https://api.kilo.ai/api/gateway

# ── OpenClaw Integration ─────────────────────────────────────────
OPENCLAW_API_KEY=tu_api_key_aqui
OPENCLAW_BASE_URL=https://api.openclaw.ai/v1

# ── Proveedores Adicionales (opcional) ───────────────────────────
# OpenAI - https://platform.openai.com/api-keys
OPENAI_API_KEY=

# Anthropic - https://console.anthropic.com/settings/keys
ANTHROPIC_API_KEY=

# Google AI (Gemini) - https://aistudio.google.com/app/apikey
GOOGLE_API_KEY=

# Ollama (modelos locales) - http://localhost:11434
OLLAMA_HOST=http://localhost:11434
```

### 3. Aplicar Permisos Seguros

```bash
chmod 600 .env
```

### 4. Reiniciar Servicios

```bash
docker-compose down
docker-compose up -d
```

---

## 🤖 Crear un Agente

### Método 1: Via Dashboard (UI)

1. Abre el Dashboard: http://76.13.37.123:8080
2. Navega a la sección **"Agentes"**
3. Haz clic en **"+ Nuevo Agente"**
4. Completa el formulario:
   - **Nombre**: `MiAgente`
   - **Rol**: Selecciona uno (Prima Materia, Catalizador, etc.)
   - **Modelo**: Selecciona de la lista desplegable
   - **Prompt de Sistema**: Define el comportamiento del agente
5. Haz clic en **"Forjar Agente"**

### Método 2: Via API (cURL)

```bash
curl -X POST http://localhost:7411/api/v1/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MiAgente",
    "role": "catalyst",
    "codename": "El Asistente",
    "model": "anthropic/claude-sonnet-4.5",
    "system_prompt": "Eres un asistente experto en..."
  }'
```

### Método 3: Via Gateway Directo

```bash
curl -X POST http://localhost:7411/api/v1/gateway/agents \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MiAgente",
    "description": "Asistente personalizado",
    "system_prompt": "Eres un experto en...",
    "model": "anthropic/claude-sonnet-4.5",
    "tools": ["search", "code"]
  }'
```

---

## 💬 Usar el Chat

### Chat Simple (Un Agente)

```bash
# Enviar mensaje a un agente específico
curl -X POST http://localhost:7411/api/v1/agent/MiAgente/dispatch \
  -H "Content-Type: application/json" \
  -d '{
    "message": "¿Qué es la transmutación alquímica?",
    "context": {}
  }'
```

### Chat Avanzado (Gateway)

```bash
# Pregunta directa al gateway
curl -X POST http://localhost:7411/api/v1/gateway/chat-ask \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "MiAgente",
    "prompt": "Explica el concepto de Magnum Opus",
    "stream": false
  }'
```

### Chat con Streaming (SSE)

```bash
# Streaming de respuestas en tiempo real
curl -X POST http://localhost:7411/api/v1/gateway/chat-stream \
  -H "Content-Type: application/json" \
  -d '{
    "agent": "MiAgente",
    "prompt": "Genera un poema sobre la alquimia",
    "stream": true
  }'
```

### Chat Roundtable (Múltiples Agentes)

```bash
# Discusión entre múltiples agentes
curl -X POST http://localhost:7411/api/v1/gateway/chat-roundtable \
  -H "Content-Type: application/json" \
  -d '{
    "agents": ["Velktharion", "Synapsara", "Pyraxis"],
    "topic": "Diseño de una arquitectura de microservicios",
    "rounds": 3
  }'
```

---

## 🔌 Ejemplos de Integración

### Ejemplo 1: Integración con Python

```python
import requests

GATEWAY_URL = "http://localhost:7411"

def chat_with_agent(agent_name: str, message: str) -> str:
    """Envía un mensaje a un agente y retorna la respuesta."""
    response = requests.post(
        f"{GATEWAY_URL}/api/v1/agent/{agent_name}/dispatch",
        json={"message": message, "context": {}}
    )
    return response.json()["response"]

# Uso
respuesta = chat_with_agent("Velktharion", "Hola, ¿cómo estás?")
print(respuesta)
```

### Ejemplo 2: Integración con JavaScript/Node.js

```javascript
async function chatWithAgent(agentName, message) {
  const response = await fetch(`http://localhost:7411/api/v1/agent/${agentName}/dispatch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context: {} })
  });
  const data = await response.json();
  return data.response;
}

// Uso
chatWithAgent('Velktharion', 'Hola, ¿cómo estás?')
  .then(respuesta => console.log(respuesta));
```

### Ejemplo 3: WebSocket para Eventos en Tiempo Real

```javascript
// Conectar al stream de eventos
const eventSource = new EventSource('http://localhost:7411/api/v1/gateway/events-stream');

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Evento recibido:', data);
};

eventSource.onerror = (error) => {
  console.error('Error en SSE:', error);
};
```

### Ejemplo 4: Uso con OpenClaw

```bash
# Verificar estado de OpenClaw
curl http://localhost:7411/api/v1/openclaw/status

# Enviar solicitud a través de OpenClaw
curl -X POST http://localhost:7411/api/v1/openclaw/ask \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Optimiza este código Python",
    "context": {"code": "def fib(n): ..."}
  }'
```

### Ejemplo 5: Uso con KiloCode

```bash
# Verificar estado de KiloCode
curl http://localhost:7411/api/v1/kilocode/status

# Enviar solicitud a través de KiloCode
curl -X POST http://localhost:7411/api/v1/kilocode/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Refactoriza esta función",
    "model": "anthropic/claude-sonnet-4.5",
    "stream": false
  }'
```

---

## 🔧 Solución de Problemas

### Problema: El Dashboard no carga

```bash
# Verificar que los contenedores están corriendo
docker-compose ps

# Ver logs del dashboard
docker-compose logs alchemical-dashboard

# Reiniciar servicios
docker-compose restart alchemical-dashboard
```

### Problema: Error de conexión con APIs externas

```bash
# Verificar variables de entorno
cat .env | grep -E "(KILO|OPENCLAW|OPENAI)"

# Ver logs del gateway
docker-compose logs gateway

# Probar conectividad desde el contenedor
docker-compose exec gateway curl -I https://api.kilo.ai
```

### Problema: Agentes no responden

```bash
# Verificar estado del gateway
curl http://localhost:7411/health

# Listar agentes disponibles
curl http://localhost:7411/api/v1/agents

# Verificar base de datos SQLite
docker-compose exec gateway ls -la /app/data/
```

### Comandos Útiles

```bash
# Ver estado de todos los servicios
./scripts/alchemical doctor

# Ver logs en tiempo real
docker-compose logs -f

# Reiniciar todo el ecosistema
docker-compose down && docker-compose up -d

# Backup de la base de datos
docker-compose exec gateway sqlite3 /app/data/agents.db ".backup /app/data/agents_backup.db"

# Ver métricas del sistema
curl http://localhost:7411/api/v1/metrics
```

---

## 📚 Recursos Adicionales

- [Documentación API Completa](API_REFERENCE.md)
- [Guía de Arquitectura](ARCHITECTURE.md)
- [Runbook de Operaciones](OPERATIONS_RUNBOOK.md)
- [Roadmap del Proyecto](ALCHEMICAL_ECOSYSTEM_ROADMAP.md)

---

## 🆘 Soporte

Si encuentras problemas:

1. Revisa los logs: `docker-compose logs`
2. Verifica la salud: `./scripts/alchemical doctor`
3. Consulta la [documentación de troubleshooting](OPERATIONS_RUNBOOK.md)

---

**Última actualización**: 2026-03-01  
**Versión**: v2.0.0 - Magnum Opus
