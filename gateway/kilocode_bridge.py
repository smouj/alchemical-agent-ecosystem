"""
gateway/kilocode_bridge.py
━━━━━━━━━━━━━━━━━━━━━━━━━━
KiloCode Local Engine Bridge
Gateway → KiloCode serve (port 4096) proxy layer

Alchemical Agent Ecosystem — KiloCode Integration
"""

import asyncio
import json
import logging
import os
import subprocess
import time
from typing import AsyncIterator, Optional

import httpx
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query, Request
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

logger = logging.getLogger("alchemical.kilocode")

# ── Configuration ──────────────────────────────────────────────────────────────
KILOCODE_SERVER_URL = os.getenv("KILOCODE_SERVER_URL", "http://localhost:4096")
KILOCODE_SERVER_PASSWORD = os.getenv("KILOCODE_SERVER_PASSWORD", "")
KILOCODE_SERVER_USERNAME = os.getenv("KILOCODE_SERVER_USERNAME", "kilo")
KILOCODE_TIMEOUT = float(os.getenv("KILOCODE_TIMEOUT", "30"))
KILOCODE_DEFAULT_DIRECTORY = os.getenv("KILOCODE_DEFAULT_DIRECTORY", "/workspace")

# ── Alchemical Status Labels ───────────────────────────────────────────────────
ALCHEMICAL_STATUS = {
    "running": "En Transmutación KiloCode",
    "idle": "Esencia Vinculada",
    "error": "Conjuro Fracturado",
    "completed": "Transmutación Completa",
    "aborted": "Ritual Interrumpido",
    "active": "Forja Arcana Activa",
    "offline": "Forja en Reposo",
    "connecting": "Invocando la Forja...",
}

# ── Engine state cache ─────────────────────────────────────────────────────────
_engine_state = {
    "status": "unknown",
    "last_check": 0.0,
    "session_count": 0,
    "version": None,
}

router = APIRouter(prefix="/kilo", tags=["KiloCode Engine"])


# ── Pydantic Models ────────────────────────────────────────────────────────────

class KiloSessionCreate(BaseModel):
    directory: Optional[str] = Field(default=None, description="Working directory for the session")
    agent: Optional[str] = Field(default=None, description="Agent mode: architect|code|debug|ask|orchestrator")
    model: Optional[str] = Field(default=None, description="Model override, e.g. anthropic/claude-sonnet-4-20250514")
    title: Optional[str] = Field(default=None, description="Optional session title")


class KiloTaskRequest(BaseModel):
    text: str = Field(..., description="The task or prompt to send to KiloCode")
    agent: Optional[str] = Field(default=None, description="Agent mode override")
    model: Optional[str] = Field(default=None, description="Model override")


class KiloRunRequest(BaseModel):
    text: str = Field(..., description="Task to execute autonomously")
    directory: Optional[str] = Field(default=None, description="Working directory")
    auto: bool = Field(default=True, description="Fully autonomous mode (no permission prompts)")
    model: Optional[str] = Field(default=None, description="Model to use")
    agent: Optional[str] = Field(default="code", description="Agent mode")


class KiloStatusResponse(BaseModel):
    status: str
    alchemical_label: str
    session_count: int
    version: Optional[str]
    server_url: str
    last_check: float


# ── HTTP Client factory ────────────────────────────────────────────────────────

def _kilo_client(timeout: Optional[float] = KILOCODE_TIMEOUT) -> httpx.AsyncClient:
    """Build httpx client for kilo serve with optional basic auth."""
    auth = None
    if KILOCODE_SERVER_PASSWORD:
        auth = (KILOCODE_SERVER_USERNAME, KILOCODE_SERVER_PASSWORD)
    return httpx.AsyncClient(
        base_url=KILOCODE_SERVER_URL,
        auth=auth,
        timeout=timeout,
        headers={"Content-Type": "application/json"},
    )


async def _check_engine_health() -> dict:
    """Check if kilo serve is running. Returns state dict."""
    global _engine_state
    try:
        async with _kilo_client(timeout=5.0) as client:
            resp = await client.get("/session")
            if resp.status_code == 200:
                data = resp.json()
                sessions = data if isinstance(data, list) else data.get("sessions", [])
                _engine_state.update({
                    "status": "active",
                    "session_count": len(sessions),
                    "last_check": time.time(),
                })
                return _engine_state
    except Exception as e:
        logger.debug(f"KiloCode engine health check failed: {e}")
    _engine_state.update({"status": "offline", "last_check": time.time(), "session_count": 0})
    return _engine_state


async def _require_engine():
    """Dependency: raises 503 if kilo serve is offline."""
    state = await _check_engine_health()
    if state["status"] != "active":
        raise HTTPException(
            status_code=503,
            detail={
                "error": "KiloCode engine offline",
                "alchemical_label": ALCHEMICAL_STATUS["offline"],
                "hint": f"Start the forge: kilo serve --port 4096 --hostname 0.0.0.0",
                "server_url": KILOCODE_SERVER_URL,
            },
        )
    return state


# ── Background Health Watcher ──────────────────────────────────────────────────

async def kilocode_health_watcher():
    """Background coroutine: polls kilo serve every 30s and logs state changes."""
    prev_status = None
    while True:
        state = await _check_engine_health()
        if state["status"] != prev_status:
            if state["status"] == "active":
                logger.info(
                    "KiloCode Forge: %s (%d sessions active)",
                    ALCHEMICAL_STATUS["active"],
                    state["session_count"],
                )
            else:
                logger.warning("KiloCode Forge: %s", ALCHEMICAL_STATUS["offline"])
            prev_status = state["status"]
        await asyncio.sleep(30)


# ── SSE Proxy Helper ───────────────────────────────────────────────────────────

async def _proxy_sse(client: httpx.AsyncClient, path: str) -> AsyncIterator[str]:
    """Stream SSE events from kilo serve, augmenting with alchemical labels."""
    async with client.stream("GET", path, headers={"Accept": "text/event-stream"}) as resp:
        async for line in resp.aiter_lines():
            if line.startswith("data:"):
                raw = line[5:].strip()
                try:
                    event = json.loads(raw)
                    # Augment with alchemical label
                    etype = event.get("type", "")
                    if "session" in etype:
                        event["alchemical_context"] = "Sesión Arcana"
                    elif "message" in etype:
                        event["alchemical_context"] = "Transmisión del Éter"
                    elif "tool" in etype:
                        event["alchemical_context"] = "Invocación de Habilidad"
                    elif "heartbeat" in etype:
                        event["alchemical_context"] = "Pulso de la Forja"
                    yield f"data: {json.dumps(event)}\n\n"
                except json.JSONDecodeError:
                    yield f"data: {raw}\n\n"
            elif line:
                yield f"{line}\n\n"


# ── Routes ─────────────────────────────────────────────────────────────────────

@router.get("/status", response_model=KiloStatusResponse, summary="KiloCode Engine Status")
async def get_kilo_status():
    """
    Check the status of the local KiloCode engine (kilo serve).
    Returns alchemical status label and session count.
    """
    state = await _check_engine_health()
    return KiloStatusResponse(
        status=state["status"],
        alchemical_label=ALCHEMICAL_STATUS.get(state["status"], "Estado Desconocido"),
        session_count=state["session_count"],
        version=state.get("version"),
        server_url=KILOCODE_SERVER_URL,
        last_check=state["last_check"],
    )


@router.get("/agents", summary="List KiloCode Agent Modes")
async def list_kilo_agents(_state=Depends(_require_engine)):
    """List available KiloCode agent modes (Plan/Code/Debug/Orchestrator/Ask + custom)."""
    async with _kilo_client() as client:
        try:
            resp = await client.get("/agent")
            resp.raise_for_status()
            agents = resp.json()
            # Augment with alchemical labels
            alchemical_modes = {
                "architect": "Arquitecto Arcano",
                "code": "Codificador del Éter",
                "debug": "Oráculo de Errores",
                "ask": "Sabio Consultado",
                "orchestrator": "Alquimista Mayor",
            }
            for agent in (agents if isinstance(agents, list) else []):
                agent_id = agent.get("id", "").lower()
                if agent_id in alchemical_modes:
                    agent["alchemical_name"] = alchemical_modes[agent_id]
            return {"agents": agents, "count": len(agents) if isinstance(agents, list) else 0}
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.get("/skills", summary="List KiloCode Skills")
async def list_kilo_skills(_state=Depends(_require_engine)):
    """List available KiloCode skills (tools/capabilities)."""
    async with _kilo_client() as client:
        try:
            resp = await client.get("/skill")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.get("/models", summary="List KiloCode Models")
async def list_kilo_models(_state=Depends(_require_engine)):
    """List models available through the KiloCode engine."""
    async with _kilo_client() as client:
        try:
            # KiloCode exposes provider info; get path info first
            resp = await client.get("/path")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


# ── Session Management ─────────────────────────────────────────────────────────

@router.get("/sessions", summary="List KiloCode Sessions")
async def list_kilo_sessions(
    directory: Optional[str] = Query(default=None, description="Filter by working directory"),
    _state=Depends(_require_engine),
):
    """List all active KiloCode sessions (Arcane Sessions)."""
    params = {}
    if directory:
        params["directory"] = directory
    async with _kilo_client() as client:
        try:
            resp = await client.get("/session", params=params)
            resp.raise_for_status()
            sessions = resp.json()
            # Augment each session with alchemical label
            session_list = sessions if isinstance(sessions, list) else sessions.get("sessions", [])
            for s in session_list:
                raw_status = s.get("status", "idle")
                s["alchemical_label"] = ALCHEMICAL_STATUS.get(raw_status, "Sesión Arcana")
            return {"sessions": session_list, "count": len(session_list)}
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.post("/sessions", status_code=201, summary="Create KiloCode Session")
async def create_kilo_session(
    body: KiloSessionCreate,
    _state=Depends(_require_engine),
):
    """
    Open a new KiloCode Arcane Session.
    Optionally specify directory, agent mode, model, and title.
    """
    payload: dict = {}
    if body.directory:
        payload["directory"] = body.directory
    if body.agent:
        payload["agent"] = body.agent
    if body.model:
        payload["model"] = body.model
    if body.title:
        payload["title"] = body.title

    async with _kilo_client() as client:
        try:
            resp = await client.post("/session", json=payload if payload else {})
            resp.raise_for_status()
            session = resp.json()
            session["alchemical_label"] = ALCHEMICAL_STATUS["idle"]
            session["alchemical_context"] = "Sesión Arcana Creada"
            return session
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.get("/sessions/{session_id}", summary="Get KiloCode Session")
async def get_kilo_session(session_id: str, _state=Depends(_require_engine)):
    """Get details of a specific KiloCode session."""
    async with _kilo_client() as client:
        try:
            resp = await client.get(f"/session/{session_id}")
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Session not found in the Arcane Registry")
            resp.raise_for_status()
            session = resp.json()
            raw_status = session.get("status", "idle")
            session["alchemical_label"] = ALCHEMICAL_STATUS.get(raw_status, "Sesión Arcana")
            return session
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.delete("/sessions/{session_id}", status_code=204, summary="Delete KiloCode Session")
async def delete_kilo_session(session_id: str, _state=Depends(_require_engine)):
    """Close and delete a KiloCode session from the Arcane Registry."""
    async with _kilo_client() as client:
        try:
            resp = await client.delete(f"/session/{session_id}")
            if resp.status_code == 404:
                raise HTTPException(status_code=404, detail="Session not found")
            resp.raise_for_status()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


@router.post("/sessions/{session_id}/abort", summary="Abort KiloCode Session")
async def abort_kilo_session(session_id: str, _state=Depends(_require_engine)):
    """Interrupt active AI processing in a KiloCode session."""
    async with _kilo_client() as client:
        try:
            resp = await client.post(f"/session/{session_id}/abort")
            resp.raise_for_status()
            return {
                "status": "aborted",
                "alchemical_label": ALCHEMICAL_STATUS["aborted"],
                "session_id": session_id,
            }
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


# ── Task Execution ─────────────────────────────────────────────────────────────

@router.post("/sessions/{session_id}/task", summary="Send Task to KiloCode Session")
async def send_kilo_task(
    session_id: str,
    body: KiloTaskRequest,
    _state=Depends(_require_engine),
):
    """
    Send a task/prompt to an active KiloCode session.
    Returns a streaming SSE response with real-time AI execution events.
    This is the primary way to interact with KiloCode agents.
    """
    payload = {"text": body.text}
    if body.agent:
        payload["agent"] = body.agent
    if body.model:
        payload["model"] = body.model

    async def event_generator():
        # Emit start event
        yield f"data: {json.dumps({'type': 'alchemical.task.start', 'session_id': session_id, 'text': body.text, 'alchemical_label': ALCHEMICAL_STATUS['running']})}\n\n"

        client = _kilo_client(timeout=300.0)  # 5-min timeout for long tasks
        try:
            async with client.stream(
                "POST",
                f"/session/{session_id}/message",
                json=payload,
                headers={"Accept": "text/event-stream"},
            ) as resp:
                async for line in resp.aiter_lines():
                    if line.startswith("data:"):
                        raw = line[5:].strip()
                        try:
                            event = json.loads(raw)
                            etype = event.get("type", "")
                            # Add alchemical context
                            if "tool" in etype:
                                event["alchemical_context"] = "Invocación de Habilidad"
                            elif "message" in etype:
                                event["alchemical_context"] = "Transmisión del Éter"
                            elif "error" in etype:
                                event["alchemical_context"] = ALCHEMICAL_STATUS["error"]
                            yield f"data: {json.dumps(event)}\n\n"
                        except json.JSONDecodeError:
                            yield f"data: {raw}\n\n"
                    elif line:
                        yield f"{line}\n\n"
        except Exception as e:
            yield f"data: {json.dumps({'type': 'alchemical.error', 'error': str(e), 'alchemical_label': ALCHEMICAL_STATUS['error']})}\n\n"
        finally:
            await client.aclose()

        # Emit completion event
        yield f"data: {json.dumps({'type': 'alchemical.task.complete', 'session_id': session_id, 'alchemical_label': ALCHEMICAL_STATUS['completed']})}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


@router.get("/sessions/{session_id}/messages", summary="Get Session Messages")
async def get_session_messages(session_id: str, _state=Depends(_require_engine)):
    """Retrieve all messages and tool results from a KiloCode session."""
    async with _kilo_client() as client:
        try:
            resp = await client.get(f"/session/{session_id}/message")
            resp.raise_for_status()
            return resp.json()
        except httpx.HTTPError as e:
            raise HTTPException(status_code=502, detail=f"KiloCode proxy error: {e}")


# ── Real-time Events ───────────────────────────────────────────────────────────

@router.get("/events", summary="KiloCode Real-time SSE Event Stream")
async def kilo_event_stream(request: Request, _state=Depends(_require_engine)):
    """
    SSE stream proxying all real-time events from the KiloCode engine.
    Events include session updates, message chunks, tool calls, and heartbeats.
    Connect once to monitor all active KiloCode sessions.
    """
    async def event_generator():
        yield f"data: {json.dumps({'type': 'alchemical.connected', 'message': 'Conectado a la Forja Arcana', 'server': KILOCODE_SERVER_URL})}\n\n"

        client = _kilo_client(timeout=None)  # No timeout for SSE
        try:
            async for chunk in _proxy_sse(client, "/event"):
                if await request.is_disconnected():
                    break
                yield chunk
        except Exception as e:
            yield f"data: {json.dumps({'type': 'alchemical.error', 'error': str(e)})}\n\n"
        finally:
            await client.aclose()

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )


# ── Quick Run ─────────────────────────────────────────────────────────────────

@router.post("/run", status_code=202, summary="Autonomous KiloCode Run")
async def kilo_run(body: KiloRunRequest, background_tasks: BackgroundTasks):
    """
    Fire-and-forget autonomous task execution via KiloCode.
    If kilo serve is running, creates a session and sends the task.
    If kilo serve is offline, attempts to run via CLI subprocess.
    Returns immediately with a job_id.
    """
    import uuid
    job_id = str(uuid.uuid4())[:8]

    state = await _check_engine_health()

    if state["status"] == "active":
        # Use the running server
        async def _run_via_server():
            try:
                async with _kilo_client() as client:
                    # Create session
                    session_resp = await client.post("/session", json={
                        "directory": body.directory or KILOCODE_DEFAULT_DIRECTORY,
                    })
                    session_resp.raise_for_status()
                    session = session_resp.json()
                    session_id = session.get("id")

                    # Send task
                    task_payload = {"text": body.text}
                    if body.agent:
                        task_payload["agent"] = body.agent
                    if body.model:
                        task_payload["model"] = body.model

                    await client.post(f"/session/{session_id}/message", json=task_payload)
                    logger.info("KiloCode job %s dispatched -> session %s", job_id, session_id)
            except Exception as e:
                logger.error("KiloCode job %s failed: %s", job_id, e)

        background_tasks.add_task(_run_via_server)
        return {
            "job_id": job_id,
            "status": "dispatched",
            "alchemical_label": "Ritual Invocado",
            "engine": "server",
        }
    else:
        # Fallback: CLI subprocess
        def _run_via_cli():
            try:
                cmd = ["kilo", "run"]
                if body.auto:
                    cmd.append("--auto")
                if body.model:
                    cmd.extend(["--model", body.model])
                cmd.append(body.text)

                cwd = body.directory or KILOCODE_DEFAULT_DIRECTORY
                result = subprocess.run(
                    cmd,
                    cwd=cwd,
                    capture_output=True,
                    text=True,
                    timeout=300,
                )
                if result.returncode != 0:
                    logger.error("KiloCode CLI job %s failed: %s", job_id, result.stderr)
                else:
                    logger.info("KiloCode CLI job %s completed", job_id)
            except FileNotFoundError:
                logger.error("KiloCode CLI not found. Install: npm install -g @kilocode/cli")
            except subprocess.TimeoutExpired:
                logger.error("KiloCode CLI job %s timed out", job_id)

        background_tasks.add_task(_run_via_cli)
        return {
            "job_id": job_id,
            "status": "dispatched",
            "alchemical_label": "Ritual Invocado (via CLI)",
            "engine": "cli",
            "warning": "kilo serve is offline; using CLI fallback",
        }


# ── Config & Health ────────────────────────────────────────────────────────────

@router.get("/config", summary="KiloCode Engine Configuration")
async def get_kilo_config():
    """Get current KiloCode engine configuration and path info."""
    state = await _check_engine_health()
    config = {
        "engine_status": state["status"],
        "alchemical_label": ALCHEMICAL_STATUS.get(state["status"], "Desconocido"),
        "server_url": KILOCODE_SERVER_URL,
        "default_directory": KILOCODE_DEFAULT_DIRECTORY,
        "timeout": KILOCODE_TIMEOUT,
        "auth_enabled": bool(KILOCODE_SERVER_PASSWORD),
        "session_count": state["session_count"],
    }

    if state["status"] == "active":
        async with _kilo_client() as client:
            try:
                path_resp = await client.get("/path")
                if path_resp.status_code == 200:
                    config["paths"] = path_resp.json()
            except Exception:
                pass

    return config
