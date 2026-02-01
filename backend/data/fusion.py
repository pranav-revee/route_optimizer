from .load_flights import FlightLoader
from .load_transit import TransitLoader
from .load_bikes import MicroMobilityLoader
from datetime import datetime

class DataFusionEngine:
    def __init__(self):
        self.flight_loader = FlightLoader()
        self.transit_loader = TransitLoader()
        self.micro_loader = MicroMobilityLoader()

    def get_journey_context(self, origin_airport: str, destination_city_zone: str):
        """
        Aggregates all data to build a snapshot of the world for the RL agent.
        """
        # 1. Get Flight Status
        arrivals = self.flight_loader.get_latest_arrivals(origin_airport)
        # Assume we are optimizing for the average passenger on the latest delayed flight or just a generic snapshot
        avg_flight_delay = arrivals['delay_min'].mean() if not arrivals.empty else 0
        
        # 2. Get Transit Options
        now = datetime.now()
        transit_options = self.transit_loader.get_next_departures(origin_airport, now)
        next_train_wait = 0
        if not transit_options.empty:
            next_train = transit_options.iloc[0]
            next_train_wait = (next_train['departure_time'] - now).total_seconds() / 60
        
        # 3. Get Micro Mobility
        rideshare_status = self.micro_loader.get_availability(origin_airport)
        
        # Construct State Vector equivalent
        # [flight_delay, train_wait_time, uber_surge, weather_score(mock)]
        return {
            'timestamp': now.isoformat(),
            'origin': origin_airport,
            'flight_delay_min': float(avg_flight_delay),
            'next_train_wait_min': float(next_train_wait),
            'uber_wait_min': rideshare_status['uber_wait_min'],
            'uber_surge': rideshare_status['uber_surge_multiplier'],
            'traffic_condition': 'Heavy' if rideshare_status['uber_surge_multiplier'] > 1.5 else 'Normal'
        }

if __name__ == "__main__":
    engine = DataFusionEngine()
    print(engine.get_journey_context('EWR', 'Manhattan'))
