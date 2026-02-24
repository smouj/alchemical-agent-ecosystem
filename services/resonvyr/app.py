import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'resonvyr')
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

@app.post('/voice')
async def ep_0(payload: dict):
    return response('/voice', payload)

@app.websocket('/voice')
async def ws_voice(ws: WebSocket):
    await ws.accept();
    while True:
        msg = await ws.receive_text();
        await ws.send_json({'heard': msg, 'intent': 'unknown'})

