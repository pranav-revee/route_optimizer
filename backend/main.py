from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Uber Travel Optimizer",
    description="Multi-modal travel optimization using DQN and LLMs",
    version="0.1.0"
)

# CORS Configuration for Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from pydantic import BaseModel
from typing import List, Optional
from backend.rl.inference import TravelAgent
from backend.llm.agent import ChatAgent

# Initialize Agents
optimizer_agent = TravelAgent()
chat_agent = ChatAgent()  # Will use fallback until LLM model is downloaded

class OptimizationRequest(BaseModel):
    origin: str = "EWR"
    destination: str = "Manhattan"

class ChatMessage(BaseModel):
    message: str
    
class ChatResponse(BaseModel):
    response: str
    intent: str
    optimization: Optional[dict] = None
    using_llm: bool = False

@app.get("/")
async def root():
    return {"message": "Travel Optimizer API is online. Use /docs for documentation."}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "llm_available": chat_agent.llm is not None}

@app.post("/optimize")
async def optimize_journey(request: OptimizationRequest):
    """
    Returns the optimal travel mode based on current data.
    """
    prediction = optimizer_agent.predict()
    return prediction

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage):
    """
    Chat with the Travel Assistant. Supports natural language queries.
    """
    result = chat_agent.chat(request.message)
    return ChatResponse(**result)

@app.post("/chat/clear")
async def clear_chat():
    """Clear conversation history."""
    chat_agent.clear_history()
    return {"status": "cleared"}

@app.post("/simulate")
async def simulate(num_scenarios: int = 100):
    """
    Run batch simulations comparing RL agent vs baseline.
    Returns aggregate metrics for visualization.
    """
    from backend.simulation import run_batch_simulation, get_simulation_summary
    results = run_batch_simulation(num_scenarios)
    summary = get_simulation_summary(results)
    return {
        "summary": summary,
        "sample_results": [r.model_dump() for r in results[:10]]  # First 10 for viz
    }
