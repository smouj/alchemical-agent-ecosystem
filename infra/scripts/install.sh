#!/usr/bin/env bash
set -euo pipefail

DOMAIN="localhost"
PROFILE="standard"
OLLAMA_MODEL="phi3:mini"
NO_PULL=0
WIZARD=0

log(){ printf "\033[1;36m[alchemical]\033[0m %s\n" "$*"; }
warn(){ printf "\033[1;33m[warn]\033[0m %s\n" "$*"; }
err(){ printf "\033[1;31m[error]\033[0m %s\n" "$*"; }

usage(){
  cat <<USAGE
Usage: bash infra/scripts/install.sh [options]
  --domain <domain>          Domain for reverse proxy (default: localhost)
  --profile <standard|min>   Compose profile hint (default: standard)
  --model <ollama-model>     Ollama model to pull (default: phi3:mini)
  --no-pull                  Skip Ollama model pull
  --wizard                   Interactive wizard mode
  -h, --help                 Show this help
USAGE
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --domain) DOMAIN="${2:-}"; shift 2 ;;
    --profile) PROFILE="${2:-standard}"; shift 2 ;;
    --model) OLLAMA_MODEL="${2:-phi3:mini}"; shift 2 ;;
    --no-pull) NO_PULL=1; shift ;;
    --wizard) WIZARD=1; shift ;;
    -h|--help) usage; exit 0 ;;
    *) err "Unknown arg: $1"; usage; exit 1 ;;
  esac
done

if [[ $WIZARD -eq 1 ]]; then
  echo
  echo "🜁 Alchemical Install Wizard"
  echo "----------------------------"
  read -r -p "Dominio [localhost]: " input_domain || true
  DOMAIN="${input_domain:-$DOMAIN}"
  read -r -p "Perfil (standard|min) [${PROFILE}]: " input_profile || true
  PROFILE="${input_profile:-$PROFILE}"

  if [[ "$PROFILE" == "min" && "$OLLAMA_MODEL" == "phi3:mini" ]]; then
    OLLAMA_MODEL="tinyllama:1.1b"
  fi

  read -r -p "Modelo Ollama [${OLLAMA_MODEL}]: " input_model || true
  OLLAMA_MODEL="${input_model:-$OLLAMA_MODEL}"
  read -r -p "¿Pull del modelo ahora? (Y/n): " input_pull || true
  if [[ "${input_pull:-Y}" =~ ^[Nn]$ ]]; then NO_PULL=1; fi
  echo
fi

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
cd "$ROOT"

log "[1/6] Preflight"
command -v docker >/dev/null || { err "Docker missing"; exit 1; }
docker compose version >/dev/null || { err "Docker Compose missing"; exit 1; }

log "[2/6] Preparing runtime directories"
mkdir -p "$ROOT/.runtime" || true

log "[3/6] Generating .env"
cat > .env <<ENV
ALCHEMICAL_DOMAIN=${DOMAIN}
ALCHEMICAL_PROFILE=${PROFILE}
ALCHEMICAL_MODEL=${OLLAMA_MODEL}
ENV

log "[4/6] Building and starting platform"
if [[ "$PROFILE" == "min" ]]; then
  log "Low-RAM profile activo (2GB target): core + gateway + 2 agentes"
  docker compose up -d --build caddy redis chromadb ollama alchemical-gateway velktharion synapsara
else
  docker compose up -d --build
fi

log "[5/6] Health check"
docker compose ps

log "[6/6] Pull local model (${OLLAMA_MODEL})"
if [[ $NO_PULL -eq 0 ]]; then
  if docker compose ps ollama >/dev/null 2>&1; then
    docker compose exec -T ollama ollama pull "$OLLAMA_MODEL" || warn "Model pull failed, continuing"
  else
    warn "Ollama service not detected"
  fi
else
  warn "Skipping model pull (--no-pull)"
fi

echo
echo "✅ Alchemical ecosystem ready"
echo "Domain: ${DOMAIN}"
echo "Profile: ${PROFILE}"
echo "Model: ${OLLAMA_MODEL}"
echo "Health checks:"
echo "  curl http://localhost/velktharion/health"
echo "  curl http://localhost/synapsara/health"
echo "  docker compose ps"
