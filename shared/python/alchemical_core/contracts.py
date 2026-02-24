from pydantic import BaseModel, Field
from typing import Dict, Any

class AgentTask(BaseModel):
    task_id: str = Field(alias="taskId")
    agent: str
    intent: str
    payload: Dict[str, Any]

class AgentResult(BaseModel):
    task_id: str
    ok: bool
    confidence: float = 0.9
    data: Dict[str, Any]
