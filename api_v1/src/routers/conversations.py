from fastapi import APIRouter, HTTPException
from ..models.conversation import Conversation, Message
from ..services.conversation_manager import ConversationManager

router = APIRouter()
conversation_manager = ConversationManager()

@router.post("/", response_model=Conversation)
async def create_conversation(initial_message: Message):
    try:
        conversation = conversation_manager.create_conversation(initial_message)
        return conversation
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{conversation_id}/messages", response_model=Conversation)
async def add_message(conversation_id: str, message: Message):
    try:
        conversation = conversation_manager.add_message(conversation_id, message)
        return conversation
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    try:
        conversation = conversation_manager.get_conversation(conversation_id)
        return conversation
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))