import pandas as pd
import numpy as np
from datetime import datetime, timedelta

class FlightLoader:
    def __init__(self):
        self.data = pd.DataFrame()

    def load_mock_data(self, num_flights=100):
        """
        Generates mock flight data simulating arrivals at EWR/JFK/LGA.
        """
        airports = ['EWR', 'JFK', 'LGA']
        origins = ['LHR', 'FRA', 'CDG', 'HND', 'LAX']
        
        data = []
        base_time = datetime.now()
        
        for _ in range(num_flights):
            flight = {
                'flight_id': f"FL{np.random.randint(1000, 9999)}",
                'origin': np.random.choice(origins),
                'destination': np.random.choice(airports),
                'scheduled_arrival': base_time + timedelta(minutes=np.random.randint(-60, 180)),
                'delay_min': max(0, int(np.random.normal(15, 30))),  # Skewed delay
                'status': np.random.choice(['On Time', 'Delayed', 'Cancelled'], p=[0.7, 0.2, 0.1])
            }
            # Adjust arrival time for delay
            flight['actual_arrival'] = flight['scheduled_arrival'] + timedelta(minutes=flight['delay_min'])
            data.append(flight)
            
        self.data = pd.DataFrame(data)
        return self.data

    def get_latest_arrivals(self, airport_code: str):
        """
        Filter for latest arrivals at a specific airport.
        """
        if self.data.empty:
            self.load_mock_data()
            
        return self.data[self.data['destination'] == airport_code]

if __name__ == "__main__":
    loader = FlightLoader()
    print(loader.load_mock_data().head())
