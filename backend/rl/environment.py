import gymnasium as gym
from gymnasium import spaces
import numpy as np
from backend.data.fusion import DataFusionEngine

class TravelOptEnv(gym.Env):
    """
    Custom Environment that follows gym interface.
    The agent chooses a travel mode composition based on current conditions (delay, surge, etc.)
    """
    metadata = {'render.modes': ['console']}

    def __init__(self):
        super(TravelOptEnv, self).__init__()
        self.fusion = DataFusionEngine()
        
        # Actions: 0=Uber Directly, 1=Train+Uber, 2=Train+Bike, 3=Wait+Train
        self.action_space = spaces.Discrete(4)
        
        # Observation Space:
        # [flight_delay_min, next_train_wait_min, uber_surge, weather_score]
        # Normalized roughly to 0-1 or standard ranges for stability
        self.observation_space = spaces.Box(
            low=np.array([0, 0, 1.0, 0], dtype=np.float32),
            high=np.array([300, 60, 5.0, 1], dtype=np.float32),
            dtype=np.float32
        )
        
        self.current_state = None
        self.steps_remaining = 0

    def reset(self, seed=None, options=None):
        super().reset(seed=seed)
        
        # Get real (mock) data snapshot
        context = self.fusion.get_journey_context('EWR', 'Manhattan')
        
        self.current_state = np.array([
            context['flight_delay_min'],
            context['next_train_wait_min'],
            context['uber_surge'],
            0.8 # Mock weather good
        ], dtype=np.float32)
        
        self.steps_remaining = 1 # One-shot decision for this simplified version
        
        return self.current_state, {}

    def step(self, action):
        # Reward Engineering
        # Minimize Time & Cost, Maximize Comfort
        
        flight_delay = self.current_state[0]
        train_wait = self.current_state[1]
        surge = self.current_state[2]
        
        cost = 0
        time = 0
        comfort = 0
        
        if action == 0: # Uber Direct
            time = 45 # Base drive time
            cost = 60 * surge
            comfort = 10
        elif action == 1: # Train + Uber
            time = 30 + train_wait + 10 # Train ride + wait + last mile
            cost = 15 + (15 * 1.0) # Train tix + fixed short uber
            comfort = 5
        elif action == 2: # Train + Bike
            time = 30 + train_wait + 15 # Train + wait + bike
            cost = 15 + 5
            comfort = 3
        elif action == 3: # Wait + Train (e.g. coffee)
            time = 30 + train_wait + 30 # Train + wait + buffer
            cost = 15 + 5 # Coffee
            comfort = 7

        # Total Penalty (Minimize this)
        # Weighting: $1 = 1 point, 1 min = 1 point. Comfort = negative penalty.
        total_penalty = time + (cost * 1.5) - (comfort * 2)
        
        reward = -total_penalty
        
        self.steps_remaining -= 1
        terminated = True
        truncated = False
        
        info = {
            "time": time,
            "cost": cost,
            "comfort": comfort
        }
        
        return self.current_state, reward, terminated, truncated, info

    def render(self, mode='console'):
        if mode != 'console':
            raise NotImplementedError()
        pass

    def close(self):
        pass
