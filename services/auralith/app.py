import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'auralith')
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

@app.post('/metrics')
async def ep_0(payload: dict):
    return response('/metrics', payload)

@app.post('/live')
async def ep_1(payload: dict):
    return response('/live', payload)

@app.get('/metrics')
async def metrics():
    return PlainTextResponse('alchemical_up 1\n')

