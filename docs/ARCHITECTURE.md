# Architecture

- Reverse proxy: Caddy (Docker DNS upstreams, no hardcoded IPs)
- Runtime mesh: Docker network `alchemical-net`
- Data: Redis + ChromaDB + local volumes
- Local LLM: Ollama sidecar
- Services: 10 agent APIs (ports 7401..7410 internally)

This is a local-first baseline with no paid API dependency.
