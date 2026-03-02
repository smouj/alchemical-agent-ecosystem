# services-deprecated/

## ⚠️ Código Obsoleto — No usar en producción

Este directorio contiene los **microservicios stub de agentes** que fueron eliminados de la arquitectura activa el 2026-03-01.

### ¿Por qué fueron eliminados?

1. **Eran stubs vacíos**: Cada servicio tenía solo un `app.py` básico que devolvía respuestas estáticas sin lógica real
2. **No correspondían a los agentes reales**: Los nombres (auralith, fluxenrath, ignivox, etc.) no coincidían con los 7 agentes definidos en el sistema
3. **Arquitectura incorrecta**: Los agentes ahora se gestionan dinámicamente mediante SQLite en el gateway, no como microservicios separados
4. **Consumo innecesario de recursos**: 10 contenedores adicionales que no aportaban funcionalidad

### Arquitectura nueva (v3)

```
┌─────────────────┐
│  Caddy Proxy    │ ← Única entrada HTTP
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌──▼────┐
│Gateway│  │Dashboard│
│:7411  │  │:3000   │
└───┬───┘  └───────┘
    │
    ├──── Redis (cache/colas)
    └──── ChromaDB (vectors)
```

Los agentes se gestionan dinámicamente:
- CRUD completo vía `/gateway/agents`
- SQLite persistente en `./.runtime/gateway.db`
- Configuración de modelos AI via KiloCode API

### Servicios eliminados

| Servicio | Puerto | Estado |
|----------|--------|--------|
| velktharion | 7401 | ❌ Eliminado |
| synapsara | 7402 | ❌ Eliminado |
| kryonexus | 7403 | ❌ Eliminado |
| noctumbra-mail | 7404 | ❌ Eliminado |
| temporaeth | 7405 | ❌ Eliminado |
| vaeloryn-conclave | 7406 | ❌ Eliminado |
| ignivox | 7407 | ❌ Eliminado |
| auralith | 7408 | ❌ Eliminado |
| resonvyr | 7409 | ❌ Eliminado |
| fluxenrath | 7410 | ❌ Eliminado |

### ¿Necesitas recuperar algo?

Si necesitas código de estos stubs como referencia, cada directorio contiene:
- `Dockerfile` — Build básico Python
- `app.py` — Stub FastAPI mínimo
- `requirements.txt` — Dependencias básicas

**Recomendación**: No reactivar estos servicios. Usar el gateway para gestión dinámica de agentes.

---
*Migración realizada por Alchemical DevOps Engineer*
*Fecha: 2026-03-01*
