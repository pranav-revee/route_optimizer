"""
Chat Agent that uses the DQN optimizer as a tool.
Falls back to rule-based responses if LLM is not available.
"""
import os
import json
from typing import Optional, List, Dict
from backend.rl.inference import TravelAgent
from backend.llm.prompts import SYSTEM_PROMPT, format_optimization_result

class ChatAgent:
    def __init__(self, model_path: Optional[str] = None):
        self.optimizer = TravelAgent()
        self.llm = None
        self.conversation_history: List[Dict] = []
        
        # Try to load LLM if available
        if model_path and os.path.exists(model_path):
            try:
                from llama_cpp import Llama
                print(f"Loading LLM from {model_path}...")
                self.llm = Llama(
                    model_path=model_path,
                    n_ctx=2048,
                    n_threads=4,  # CPU-only, optimized for M-series
                    n_gpu_layers=0,  # Force CPU for portability
                    verbose=False
                )
                print("LLM loaded successfully (CPU-only mode)")
            except Exception as e:
                print(f"LLM not available: {e}. Using rule-based responses.")
        else:
            print("No LLM model found. Using rule-based responses.")
    
    def _detect_intent(self, message: str) -> str:
        """Simple intent detection."""
        message_lower = message.lower()
        
        travel_keywords = ["get to", "travel", "going to", "route", "how do i", 
                          "best way", "cheapest", "fastest", "optimize", 
                          "airport", "flight", "train", "uber"]
        
        if any(kw in message_lower for kw in travel_keywords):
            return "OPTIMIZE"
        return "CHAT"
    
    def _extract_journey_params(self, message: str) -> dict:
        """Extract origin/destination from message. Simplified for MVP."""
        # Default values
        params = {"origin": "EWR", "destination": "Manhattan"}
        
        message_lower = message.lower()
        
        # Airport detection
        if "jfk" in message_lower:
            params["origin"] = "JFK"
        elif "lga" in message_lower or "laguardia" in message_lower:
            params["origin"] = "LGA"
        elif "ewr" in message_lower or "newark" in message_lower:
            params["origin"] = "EWR"
        
        # Destination detection
        if "brooklyn" in message_lower:
            params["destination"] = "Brooklyn"
        elif "queens" in message_lower:
            params["destination"] = "Queens"
        elif "manhattan" in message_lower or "nyc" in message_lower or "city" in message_lower:
            params["destination"] = "Manhattan"
            
        return params
    
    def _generate_llm_response(self, user_message: str, optimization_result: Optional[dict] = None) -> str:
        """Generate response using LLM if available."""
        if not self.llm:
            return None
            
        # Build context
        context = SYSTEM_PROMPT + "\n\n"
        
        if optimization_result:
            context += f"[TOOL RESULT]\n{json.dumps(optimization_result)}\n\n"
        
        # Add conversation history (last 4 turns)
        for turn in self.conversation_history[-4:]:
            context += f"User: {turn['user']}\nAssistant: {turn['assistant']}\n\n"
        
        context += f"User: {user_message}\nAssistant:"
        
        try:
            response = self.llm(
                context,
                max_tokens=256,
                temperature=0.7,
                stop=["User:", "\n\n\n"]
            )
            return response["choices"][0]["text"].strip()
        except Exception as e:
            print(f"LLM generation failed: {e}")
            return None
    
    def _generate_rule_response(self, intent: str, optimization_result: Optional[dict] = None) -> str:
        """Fallback rule-based response generation."""
        if intent == "OPTIMIZE" and optimization_result:
            return format_optimization_result(optimization_result)
        
        return "I'm your travel assistant! Tell me where you're trying to go (e.g., 'How do I get from JFK to Manhattan?') and I'll find the optimal route considering current conditions."
    
    def chat(self, user_message: str) -> dict:
        """
        Main chat interface. Returns response with metadata.
        """
        intent = self._detect_intent(user_message)
        optimization_result = None
        
        # Run optimization if travel intent detected
        if intent == "OPTIMIZE":
            params = self._extract_journey_params(user_message)
            optimization_result = self.optimizer.predict()
            optimization_result["journey_params"] = params
        
        # Try LLM first, fall back to rules
        response_text = self._generate_llm_response(user_message, optimization_result)
        
        if not response_text:
            response_text = self._generate_rule_response(intent, optimization_result)
        
        # Store in history
        self.conversation_history.append({
            "user": user_message,
            "assistant": response_text
        })
        
        return {
            "response": response_text,
            "intent": intent,
            "optimization": optimization_result,
            "using_llm": self.llm is not None
        }

    def clear_history(self):
        """Clear conversation history."""
        self.conversation_history = []


# Pre-generated responses for common scenarios (cold-start optimization)
CACHED_RESPONSES = {
    "jfk_manhattan_normal": {
        "response": "For JFK to Manhattan right now, I'd recommend taking the AirTrain to Jamaica, then the LIRR to Penn Station. It's about 45 minutes total and costs $16.75. Uber would be faster (35 min) but you're looking at $65-80 with current traffic. The train's the smart play here - predictable timing and you can grab a coffee at Penn.",
        "recommendation": "TRAIN+UBER"
    },
    "ewr_manhattan_surge": {
        "response": "Newark to Manhattan? Train is your friend today. NJ Transit to Penn Station is 30 minutes, $15.25. I'm seeing 2.1x surge on Uber right now which would put you at $90+. Take the train, save $75, use that for dinner. If you need door-to-door, grab a CitiBike from Penn - docks are full right now.",
        "recommendation": "TRAIN+BIKE"
    },
    "lga_manhattan_normal": {
        "response": "LaGuardia's tricky since there's no rail. Your options: M60 bus to subway ($2.90, 50 min) or Uber ($35-45, 25 min). If you're not in a rush, the bus+subway combo is honestly fine - saves you $40. But if you've got bags or you're tired, Uber's worth it here.",
        "recommendation": "UBER_DIRECT"
    }
}


if __name__ == "__main__":
    agent = ChatAgent()
    print(agent.chat("How do I get from JFK to Manhattan?"))
