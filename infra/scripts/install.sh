#!/usr/bin/env bash
set -euo pipefail
DOMAIN="localhost"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="$2"; shift 2 ;;
    *) echo "Unknown arg: $1"; exit 1 ;;
  esac
done

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

echo "[1/4] Preflight"
command -v docker >/dev/null || { echo "Docker missing"; exit 1; }
docker compose version >/dev/null || { echo "Docker Compose missing"; exit 1; }

echo "[2/4] Prepare dirs"
sudo mkdir -p /opt/smouj/{persistence,models} || true

echo "[3/4] Start platform"
docker compose up -d --build

echo "[4/4] Pull local model (optional)"
if docker compose ps ollama >/dev/null 2>&1; then
  docker compose exec -T ollama ollama pull phi3:mini || true
fi

echo "Done. Domain parameter received: $DOMAIN"
echo "Health checks:"
echo "  curl http://localhost/velktharion/health"
echo "  curl http://localhost/synapsara/health"
