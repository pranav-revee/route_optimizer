"""
Simulation endpoint for A/B testing and batch comparisons.
"""
import numpy as np
from typing import List
from pydantic import BaseModel
from backend.rl.inference import TravelAgent
from backend.data.fusion import DataFusionEngine

class SimulationResult(BaseModel):
    scenario_id: int
    baseline_time: float
    baseline_cost: float
    agent_time: float
    agent_cost: float
    time_saved: float
    cost_saved: float
    recommendation: str

def run_batch_simulation(num_scenarios: int = 100) -> List[SimulationResult]:
    """
    Runs batch simulations comparing RL agent vs baseline heuristic.
    """
    agent = TravelAgent()
    results = []
    
    for i in range(num_scenarios):
        # Agent prediction
        prediction = agent.predict()
        agent_time = prediction["metrics"]["time"]
        agent_cost = prediction["metrics"]["cost"]
        
        # Baseline: Always take Uber (naive approach)
        baseline_time = 45 + np.random.normal(0, 10)  # ~45 min avg
        surge = np.random.choice([1.0, 1.2, 1.5, 2.0], p=[0.5, 0.3, 0.1, 0.1])
        baseline_cost = 60 * surge
        
        results.append(SimulationResult(
            scenario_id=i,
            baseline_time=baseline_time,
            baseline_cost=baseline_cost,
            agent_time=agent_time,
            agent_cost=agent_cost,
            time_saved=baseline_time - agent_time,
            cost_saved=baseline_cost - agent_cost,
            recommendation=prediction["recommendation"]
        ))
    
    return results

def get_simulation_summary(results: List[SimulationResult]) -> dict:
    """Aggregate simulation results."""
    avg_time_saved = np.mean([r.time_saved for r in results])
    avg_cost_saved = np.mean([r.cost_saved for r in results])
    
    # Count recommendations
    rec_counts = {}
    for r in results:
        rec_counts[r.recommendation] = rec_counts.get(r.recommendation, 0) + 1
    
    return {
        "total_simulations": len(results),
        "avg_time_saved_min": round(avg_time_saved, 2),
        "avg_cost_saved_usd": round(avg_cost_saved, 2),
        "recommendation_distribution": rec_counts,
        "agent_win_rate_time": round(sum(1 for r in results if r.time_saved > 0) / len(results) * 100, 1),
        "agent_win_rate_cost": round(sum(1 for r in results if r.cost_saved > 0) / len(results) * 100, 1)
    }

if __name__ == "__main__":
    results = run_batch_simulation(50)
    print(get_simulation_summary(results))
