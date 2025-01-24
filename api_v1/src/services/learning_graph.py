from typing import Dict, Any
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
import operator
from pydantic import BaseModel
from anthropic import Anthropic
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class LearningState(BaseModel):
    conversation_id: str
    messages: list
    learning_patterns: Dict[str, Any] = {}
    user_context: Dict[str, Any] = {}

class LearningGraphManager:
    def __init__(self):
        # Initialize Claude client
        self.claude_client = Anthropic(
            api_key=os.getenv('ANTHROPIC_API_KEY')
        )
        
        # Create the learning graph
        self.graph = self._create_learning_graph()

    def _create_learning_graph(self):
        def extract_learning_patterns(state: dict):
            """
            Extract learning patterns using Claude 3.5 Sonnet
            """
            try:
                # Prepare conversation context for pattern analysis
                conversation_context = " ".join([
                    msg['content'] for msg in state.get('messages', [])
                ])

                # Use Claude to analyze learning patterns
                response = self.claude_client.messages.create(
                    model="claude-3-5-sonnet-20240620",
                    max_tokens=1000,
                    messages=[
                        {
                            "role": "user", 
                            "content": f"""Analyze the following conversation for learning patterns:
                            Context: {conversation_context}
                            
                            Please identify:
                            1. Cognitive processing style
                            2. Metaphors or connections used
                            3. Learning breakthrough moments
                            4. Potential learning obstacles
                            5. Unique understanding approaches
                            
                            Provide insights in a structured JSON format."""
                        }
                    ]
                )

                # Parse Claude's response
                learning_patterns = self._parse_claude_response(response.content[0].text)
                
                return {
                    **state,
                    "learning_patterns": learning_patterns
                }
            except Exception as e:
                # Log error and return original state
                print(f"Error in pattern extraction: {e}")
                return state

        def update_user_context(state: dict):
            """
            Update broader user learning context
            """
            try:
                # Analyze accumulated learning patterns
                context_update = self._synthesize_user_context(state.get('learning_patterns', {}))
                
                return {
                    **state,
                    "user_context": context_update
                }
            except Exception as e:
                print(f"Error in context update: {e}")
                return state

        # Define graph workflow
        workflow = StateGraph(dict)
        workflow.add_node("extract_patterns", extract_learning_patterns)
        workflow.add_node("update_context", update_user_context)
        
        # Define graph edges
        workflow.set_entry_point("extract_patterns")
        workflow.add_edge("extract_patterns", "update_context")
        workflow.add_edge("update_context", END)

        # Compile the graph with memory saver
        return workflow.compile(checkpointer=MemorySaver())

    def _parse_claude_response(self, response: str) -> Dict[str, Any]:
        """
        Parse Claude's response into a structured learning pattern dict
        """
        try:
            # Implement robust parsing logic
            # Could use json.loads or a more sophisticated parsing method
            return {
                "cognitive_style": "TODO: Parse cognitive style",
                "metaphors": "TODO: Extract metaphors",
                "breakthrough_moments": "TODO: Identify breakthroughs",
                "learning_obstacles": "TODO: Identify obstacles"
            }
        except Exception as e:
            print(f"Parsing error: {e}")
            return {}

    def _synthesize_user_context(self, learning_patterns: Dict[str, Any]) -> Dict[str, Any]:
        """
        Synthesize broader user learning context from accumulated patterns
        """
        try:
            # Implement context synthesis logic
            return {
                "overall_learning_preference": "TODO: Synthesize preference",
                "growth_areas": "TODO: Identify growth potential"
            }
        except Exception as e:
            print(f"Context synthesis error: {e}")
            return {}

    def process_message(self, conversation):
        """
        Process a message through the learning graph
        """
        try:
            # Invoke the graph with current conversation state
            result = self.graph.invoke({
                "conversation_id": conversation.id,
                "messages": [msg.dict() for msg in conversation.messages]
            })

            return result.get('learning_patterns', {})
        except Exception as e:
            print(f"Graph processing error: {e}")
            return {}