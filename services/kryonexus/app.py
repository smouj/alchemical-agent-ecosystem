import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'kryonexus')
app = FastAPI(title=SERVICE)

def response(endpoint: str, payload: dict):
    return {
        'service': SERVICE,
        'endpoint': endpoint,
        'timestamp': datetime.now(timezone.utc).isoformat(),
        'confidence': 0.9,
        'provenance': ['local'],
        'input': payload
    }

@app.get('/health')
async def health():
    return {'status':'ok','service':SERVICE}

@app.post('/search')
async def ep_0(payload: dict):
    return response('/search', payload)

@app.websocket('/search')
async def ws_search(ws: WebSocket):
    await ws.accept();
    while True:
        q = await ws.receive_text();
        await ws.send_json({'query': q, 'results': [], 'latencyMs': 1})

