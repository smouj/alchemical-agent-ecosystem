# Project Status Snapshot

_Auto-generated from repository state. Do not edit manually._

## Metadata

- Generated: **2026-03-02**
- Branch: **main**
- Last update: **v2.0.0 stabilization**

## Repository Metrics

| Metric | Value |
|---|---:|
| Core services (docker-compose) | 5 |
| Dashboard API routes | 23 |
| Gateway endpoints | ~30 |

## Core Services (from docker-compose.yml)

```
caddy         - Reverse proxy (:81, :444)
redis         - Cache & Pub/Sub
chromadb      - Vector store
alchemical-gateway  - FastAPI gateway (:7411)
alchemical-dashboard - Next.js UI (:8080)
```

## Notes

- **2026-03-02**: v2.0.0 stabilization - removed corrupt files, fixed Next.js version
- Runtime services (velktharion, synapsara, etc.) are **planned but not implemented** - they exist only as skill placechemical Circles orchestrationholders
- Al is **vision/future work**, not yet implemented
- This file should be updated manually or via CI on structural changes
