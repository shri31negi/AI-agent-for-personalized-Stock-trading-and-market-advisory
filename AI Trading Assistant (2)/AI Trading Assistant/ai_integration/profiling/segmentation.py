def classify_investor_profile(risk_score, stability_score, discipline_score):
    """
    Classify investor into profile type
    Args:
        risk_score: 0-100
        stability_score: 0-100
        discipline_score: 0-100
    Returns:
        profile type string
    """
    composite_score = (risk_score * 0.5) + (stability_score * 0.25) + (discipline_score * 0.25)
    
    if risk_score >= 70:
        if discipline_score >= 60:
            return "Aggressive"
        else:
            return "Speculative"
    elif risk_score >= 40:
        if stability_score >= 60:
            return "Moderate"
        else:
            return "Balanced"
    else:
        if stability_score >= 60:
            return "Conservative"
        else:
            return "Cautious"

def get_profile_characteristics(profile_type):
    """
    Get characteristics for each profile type
    Args:
        profile_type: investor profile string
    Returns:
        dict with profile characteristics
    """
    profiles = {
        "Conservative": {
            "risk_tolerance": "Low",
            "recommended_allocation": {"stocks": 30, "bonds": 50, "cash": 20},
            "max_position_size": 5,
            "preferred_assets": ["blue_chip_stocks", "bonds", "dividend_stocks"],
            "trading_frequency": "Low",
            "description": "Focus on capital preservation and steady income"
        },
        "Cautious": {
            "risk_tolerance": "Low-Medium",
            "recommended_allocation": {"stocks": 40, "bonds": 40, "cash": 20},
            "max_position_size": 7,
            "preferred_assets": ["large_cap_stocks", "bonds", "etfs"],
            "trading_frequency": "Low-Medium",
            "description": "Balanced approach with emphasis on safety"
        },
        "Moderate": {
            "risk_tolerance": "Medium",
            "recommended_allocation": {"stocks": 60, "bonds": 30, "cash": 10},
            "max_position_size": 10,
            "preferred_assets": ["diversified_stocks", "etfs", "some_growth_stocks"],
            "trading_frequency": "Medium",
            "description": "Balanced growth and income strategy"
        },
        "Balanced": {
            "risk_tolerance": "Medium",
            "recommended_allocation": {"stocks": 55, "bonds": 25, "alternatives": 10, "cash": 10},
            "max_position_size": 12,
            "preferred_assets": ["mixed_cap_stocks", "etfs", "reits"],
            "trading_frequency": "Medium",
            "description": "Flexible approach adapting to market conditions"
        },
        "Aggressive": {
            "risk_tolerance": "High",
            "recommended_allocation": {"stocks": 80, "alternatives": 15, "cash": 5},
            "max_position_size": 20,
            "preferred_assets": ["growth_stocks", "small_cap", "sector_etfs"],
            "trading_frequency": "High",
            "description": "Growth-focused with higher risk tolerance"
        },
        "Speculative": {
            "risk_tolerance": "Very High",
            "recommended_allocation": {"stocks": 70, "alternatives": 25, "cash": 5},
            "max_position_size": 25,
            "preferred_assets": ["high_growth", "volatile_stocks", "options"],
            "trading_frequency": "Very High",
            "description": "High-risk, high-reward approach"
        }
    }
    
    return profiles.get(profile_type, profiles["Moderate"])
