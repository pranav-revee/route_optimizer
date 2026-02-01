from stable_baselines3 import DQN
from backend.rl.environment import TravelOptEnv
import os

def train_agent():
    # 1. Create Environment
    env = TravelOptEnv()
    
    # 2. Instantiate Agent
    model = DQN(
        "MlpPolicy", 
        env, 
        verbose=1,
        learning_rate=0.001,
        buffer_size=10000,
        learning_starts=1000,
        batch_size=32,
        gamma=0.99,
        train_freq=4,
        gradient_steps=1,
        target_update_interval=1000,
        exploration_fraction=0.1,
        exploration_final_eps=0.02,
    )
    
    # 3. Train
    print("Starting DQN training...")
    try:
        model.learn(total_timesteps=10000, log_interval=100)
    except KeyboardInterrupt:
        print("Training interrupted manually.")
    
    # 4. Save Model
    save_path = os.path.join("backend", "models", "dqn_travel_agent")
    model.save(save_path)
    print(f"Model saved to {save_path}.zip")

    # 5. Evaluate (Quick Sanity Check)
    obs, _ = env.reset()
    print("Evaluating trained agent on one episode...")
    action, _states = model.predict(obs, deterministic=True)
    obs, reward, terminated, truncated, info = env.step(action)
    print(f"Action: {action}, Reward: {reward}, Info: {info}")

if __name__ == "__main__":
    train_agent()
