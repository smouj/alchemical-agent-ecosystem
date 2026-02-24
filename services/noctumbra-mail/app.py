import os
from datetime import datetime, timezone
from fastapi import FastAPI, WebSocket
from fastapi.responses import PlainTextResponse

SERVICE = os.getenv('SERVICE_NAME', 'noctumbra-mail')
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

@app.post('/send')
async def ep_0(payload: dict):
    return response('/send', payload)

@app.post('/classify')
async def ep_1(payload: dict):
    return response('/classify', payload)

@app.post('/draft')
async def ep_2(payload: dict):
    return response('/draft', payload)

@app.post('/unsubscribe')
async def ep_3(payload: dict):
    return response('/unsubscribe', payload)


