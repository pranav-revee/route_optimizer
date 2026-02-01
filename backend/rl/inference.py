from stable_baselines3 import DQN
from backend.rl.environment import TravelOptEnv
import os

class TravelAgent:
    def __init__(self, model_path="backend/models/dqn_travel_agent.zip"):
        self.env = TravelOptEnv()
        self.model = None
        self.load_model(model_path)
        
        self.action_map = {
            0: "UBER_DIRECT",
            1: "TRAIN+UBER",
            2: "TRAIN+BIKE",
            3: "WAIT+TRAIN"
        }

    def load_model(self, path):
        if os.path.exists(path):
            self.model = DQN.load(path)
            print(f"Loaded DQN model from {path}")
        else:
            print(f"Warning: Model not found at {path}. Using random actions.")
            self.model = None

    def predict(self, context=None):
        """
        Predicts optimal travel mode based on current environment state.
        If context is provided, it might override the env's random state (future feature).
        For now, it uses the env's current state mechanism.
        """
        # Reset env to get fresh state (mock data fetch)
        obs, _ = self.env.reset()
        
        if self.model:
            action, _ = self.model.predict(obs, deterministic=True)
        else:
            action = self.env.action_space.sample()
            
        # Get simulated result step to see metrics
        _, reward, _, _, info = self.env.step(action)
        
        return {
            "action_id": int(action),
            "recommendation": self.action_map[int(action)],
            "metrics": info,
            "raw_state": obs.tolist()
        }

if __name__ == "__main__":
    agent = TravelAgent()
    print(agent.predict())
