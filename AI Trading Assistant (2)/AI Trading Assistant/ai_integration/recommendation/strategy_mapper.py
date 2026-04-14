def map_strategy_to_profile(profile_type):
    """
    Map trading strategy to profile type
    Args:
        profile_type: investor profile type
    Returns:
        strategy dict
    """
    strategies = {
        "Conservative": {
            "strategy_name": "Income & Preservation",
            "approach": "Buy and hold",
            "rebalancing_frequency": "Quarterly",
            "tactics": [
                "Focus on dividend-paying stocks",
                "Maintain high bond allocation",
                "Avoid speculative positions",
                "Use dollar-cost averaging"
            ],
            "risk_management": {
                "stop_loss": "8-10%",
                "position_sizing": "Equal weight or market cap weighted",
                "diversification": "High (15-20 positions)"
            }
        },
        "Cautious": {
            "strategy_name": "Balanced Growth",
            "approach": "Core-satellite",
            "rebalancing_frequency": "Quarterly",
            "tactics": [
                "Core holdings in index funds",
                "Satellite positions in quality stocks",
                "Limited exposure to growth",
                "Regular rebalancing"
            ],
            "risk_management": {
                "stop_loss": "10-12%",
                "position_sizing": "Tiered based on conviction",
                "diversification": "Medium-High (12-15 positions)"
            }
        },
        "Moderate": {
            "strategy_name": "Growth & Income",
            "approach": "Blend",
            "rebalancing_frequency": "Monthly",
            "tactics": [
                "Mix of growth and value stocks",
                "Sector rotation based on trends",
                "Moderate trading frequency",
                "Technical and fundamental analysis"
            ],
            "risk_management": {
                "stop_loss": "12-15%",
                "position_sizing": "Risk-adjusted",
                "diversification": "Medium (10-12 positions)"
            }
        },
        "Balanced": {
            "strategy_name": "Adaptive Allocation",
            "approach": "Tactical",
            "rebalancing_frequency": "Monthly",
            "tactics": [
                "Adjust allocation based on market conditions",
                "Use momentum indicators",
                "Active sector rotation",
                "Opportunistic trading"
            ],
            "risk_management": {
                "stop_loss": "15%",
                "position_sizing": "Volatility-adjusted",
                "diversification": "Medium (8-12 positions)"
            }
        },
        "Aggressive": {
            "strategy_name": "Growth Momentum",
            "approach": "Active trading",
            "rebalancing_frequency": "Weekly",
            "tactics": [
                "Focus on high-growth stocks",
                "Momentum and trend following",
                "Swing trading opportunities",
                "Technical analysis driven"
            ],
            "risk_management": {
                "stop_loss": "15-20%",
                "position_sizing": "Concentrated positions",
                "diversification": "Low-Medium (6-10 positions)"
            }
        },
        "Speculative": {
            "strategy_name": "High Risk/Reward",
            "approach": "Aggressive trading",
            "rebalancing_frequency": "Daily/Weekly",
            "tactics": [
                "Small-cap and volatile stocks",
                "Options strategies",
                "Short-term trades",
                "High conviction bets"
            ],
            "risk_management": {
                "stop_loss": "20-25%",
                "position_sizing": "Highly concentrated",
                "diversification": "Low (4-8 positions)"
            }
        }
    }
    
    return strategies.get(profile_type, strategies["Moderate"])

def generate_action_plan(profile, market_conditions):
    """
    Generate actionable trading plan
    Args:
        profile: user profile
        market_conditions: current market state
    Returns:
        action plan dict
    """
    profile_type = profile.get('profile_type', 'Moderate')
    strategy = map_strategy_to_profile(profile_type)
    
    market_trend = market_conditions.get('trend', 'neutral')
    volatility = market_conditions.get('volatility', 'medium')
    
    actions = []
    
    if market_trend == 'bullish':
        if profile_type in ['Aggressive', 'Speculative']:
            actions.append("Increase equity exposure")
            actions.append("Consider growth stocks")
        else:
            actions.append("Maintain current allocation")
            actions.append("Consider gradual increase in equity")
    
    elif market_trend == 'bearish':
        if profile_type in ['Conservative', 'Cautious']:
            actions.append("Increase cash and bond allocation")
            actions.append("Focus on defensive sectors")
        else:
            actions.append("Reduce position sizes")
            actions.append("Implement tighter stop losses")
    
    if volatility == 'high':
        actions.append("Reduce position sizes by 20-30%")
        actions.append("Increase cash reserves")
    
    return {
        "strategy": strategy,
        "market_conditions": market_conditions,
        "recommended_actions": actions,
        "next_review": strategy['rebalancing_frequency']
    }
