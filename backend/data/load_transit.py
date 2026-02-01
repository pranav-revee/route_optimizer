import pandas as pd
from datetime import datetime, timedelta

class TransitLoader:
    def __init__(self):
        self.train_schedule = pd.DataFrame()

    def load_mock_schedule(self):
        """
        Generates mock NJ Transit / LIRR schedule from airports to city centers.
        """
        routes = [
            {'route_id': 'NJT_NEC', 'from': 'EWR', 'to': 'NY_PENN', 'base_duration_min': 30, 'price': 15.0},
            {'route_id': 'LIRR_JAM', 'from': 'JFK', 'to': 'NY_PENN', 'base_duration_min': 35, 'price': 11.0},
            {'route_id': 'M60_SBS', 'from': 'LGA', 'to': 'HARLEM', 'base_duration_min': 40, 'price': 2.90},
        ]
        
        schedule = []
        base_time = datetime.now()
        
        # Generate trains every 15 mins for next 4 hours
        for i in range(16): 
            departure_time = base_time + timedelta(minutes=i*15)
            
            for route in routes:
                trip = route.copy()
                trip['departure_time'] = departure_time
                trip['arrival_time'] = departure_time + timedelta(minutes=route['base_duration_min'])
                
                # Random transit delay
                import numpy as np
                delay = int(np.random.exponential(scale=5)) # 5 min avg delay
                trip['delay_min'] = delay
                trip['real_arrival_time'] = trip['arrival_time'] + timedelta(minutes=delay)
                
                schedule.append(trip)
                
        self.train_schedule = pd.DataFrame(schedule)
        return self.train_schedule

    def get_next_departures(self, airport_code: str, current_time: datetime, limit=3):
        if self.train_schedule.empty:
            self.load_mock_schedule()
            
        relevant = self.train_schedule[
            (self.train_schedule['from'] == airport_code) & 
            (self.train_schedule['departure_time'] > current_time)
        ]
        return relevant.sort_values('departure_time').head(limit)

if __name__ == "__main__":
    loader = TransitLoader()
    print(loader.load_mock_schedule().head())
