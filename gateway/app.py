import os
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI(title="alchemical-gateway")

MAP = {
  "velktharion": "http://velktharion:7401",
  "synapsara": "http://synapsara:7402",
  "kryonexus": "http://kryonexus:7403",
  "noctumbra-mail": "http://noctumbra-mail:7404",
  "temporaeth": "http://temporaeth:7405",
  "vaeloryn-conclave": "http://vaeloryn-conclave:7406",
  "ignivox": "http://ignivox:7407",
  "auralith": "http://auralith:7408",
  "resonvyr": "http://resonvyr:7409",
  "fluxenrath": "http://fluxenrath:7410",
}

@app.get('/health')
async def health():
    return {"status":"ok","service":"gateway"}

@app.post('/dispatch/{agent}/{action}')
async def dispatch(agent: str, action: str, payload: dict):
    base = MAP.get(agent)
    if not base:
        raise HTTPException(404, f"Unknown agent: {agent}")
    url = f"{base}/{action}"
    async with httpx.AsyncClient(timeout=30) as cli:
        try:
            r = await cli.post(url, json=payload)
            return {"agent": agent, "action": action, "status": r.status_code, "result": r.json()}
        except Exception as e:
            raise HTTPException(502, f"Dispatch error: {e}")
