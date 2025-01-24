import uuid
from typing import Dict
from ..models.conversation import Conversation, Message
from .learning_graph import LearningGraphManager

class ConversationManager:
    def __init__(self):
        self._conversations: Dict[str, Conversation] = {}
        self._learning_graph = LearningGraphManager()

    def create_conversation(self, initial_message: Message) -> Conversation:
        conversation_id = str(uuid.uuid4())
        conversation = Conversation(
            id=conversation_id,
            messages=[initial_message]
        )
        
        # Process initial message through learning graph
        learning_patterns = self._learning_graph.process_message(conversation)
        conversation.learning_patterns = learning_patterns
        
        self._conversations[conversation_id] = conversation
        return conversation

    def add_message(self, conversation_id: str, message: Message) -> Conversation:
        if conversation_id not in self._conversations:
            raise ValueError("Conversation not found")
        
        conversation = self._conversations[conversation_id]
        conversation.messages.append(message)
        
        # Process message through learning graph
        learning_patterns = self._learning_graph.process_message(conversation)
        conversation.learning_patterns.update(learning_patterns)
        
        return conversation

    def get_conversation(self, conversation_id: str) -> Conversation:
        if conversation_id not in self._conversations:
            raise ValueError("Conversation not found")
        
        return self._conversations[conversation_id]