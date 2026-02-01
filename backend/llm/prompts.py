"""
Prompt templates for the Travel Assistant Chat Agent.
"""

SYSTEM_PROMPT = """You are an intelligent travel assistant that helps users plan optimal multi-modal journeys. You have access to real-time data about:
- Flight delays and arrivals
- Train/transit schedules (NJ Transit, LIRR, etc.)
- Bike availability (CitiBike)
- Rideshare pricing and surge (Uber/Lyft)

When a user asks about getting somewhere, you:
1. Analyze their situation (origin, destination, time constraints)
2. Use the optimization tool to find the best route
3. Explain your recommendation in natural language
4. Mention cost savings, time tradeoffs, and any promos available

Be conversational but efficient. Give clear, actionable advice.
Always explain WHY you're recommending a specific route - not just what it is.

Example response style:
"Train's 15min slower than Uber but saves you $45, and there's surge pricing right now. Plus you can grab coffee at Penn Station while waiting - there's a Starbucks promo I spotted."
"""

OPTIMIZATION_TOOL_DESCRIPTION = """
Use this tool when the user wants to plan a journey or asks about the best way to get somewhere.
Input: JSON with 'origin' (airport code like EWR, JFK, LGA) and 'destination' (city zone like Manhattan, Brooklyn).
Output: Optimal route recommendation with time, cost, and comfort metrics.
"""

def format_optimization_result(result: dict) -> str:
    """Convert optimization result to natural language."""
    action_explanations = {
        "UBER_DIRECT": "taking Uber directly to your destination",
        "TRAIN+UBER": "taking the train and then a short Uber at the end",
        "TRAIN+BIKE": "taking the train and then grabbing a CitiBike for the last mile",
        "WAIT+TRAIN": "waiting a bit and then taking a later train with less rush"
    }
    
    rec = result.get("recommendation", "UBER_DIRECT")
    metrics = result.get("metrics", {})
    
    explanation = action_explanations.get(rec, rec)
    time_min = metrics.get("time", 0)
    cost = metrics.get("cost", 0)
    
    return f"""Based on current conditions, I recommend {explanation}.

**Estimated Time:** {time_min:.0f} minutes
**Estimated Cost:** ${cost:.0f}

This accounts for current flight delays, transit schedules, and rideshare surge pricing."""
