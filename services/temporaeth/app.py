import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'temporaeth')
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

@app.post('/caldav')
async def ep_0(payload: dict):
    return response('/caldav', payload)

@app.post('/plan')
async def ep_1(payload: dict):
    return response('/plan', payload)


