import pandas as pd
import numpy as np

class MicroMobilityLoader:
    def __init__(self):
        pass

    def get_availability(self, location: str):
        """
        Returns mock availability for Bikes (CitiBike) and RideShare (Uber/Lyft).
        """
        # Mock logic based on location "vibe"
        if location in ['EWR', 'JFK', 'LGA']:
            # Airports: High Uber availability, Low/No Bike
            return {
                'citibike_available': 0,
                'uber_wait_min': np.random.randint(2, 10),
                'uber_surge_multiplier': np.random.choice([1.0, 1.2, 1.5, 2.0], p=[0.5, 0.3, 0.1, 0.1]),
                'uber_est_price_to_city': np.random.randint(45, 90)
            }
        elif 'STATION' in location or 'PENN' in location:
            # Train stations: High Bike, High Uber
            return {
                'citibike_available': np.random.randint(5, 50),
                'uber_wait_min': np.random.randint(1, 5),
                'uber_surge_multiplier': 1.0,
                'uber_est_price_to_dest': np.random.randint(15, 30)
            }
        else:
             return {
                'citibike_available': np.random.randint(0, 10),
                'uber_wait_min': np.random.randint(5, 15),
                'uber_surge_multiplier': 1.0
            }

if __name__ == "__main__":
    loader = MicroMobilityLoader()
    print(loader.get_availability('JFK'))
    print(loader.get_availability('NY_PENN'))
