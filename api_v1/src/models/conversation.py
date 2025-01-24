from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Any
from datetime import datetime

class Message(BaseModel):
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    role: str  # 'user' or 'system'

class Conversation(BaseModel):
    id: str
    messages: List[Message] = []
    learning_patterns: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)