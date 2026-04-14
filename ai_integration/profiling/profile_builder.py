from .risk_scoring import calculate_risk_score
from .behavior_analysis import calculate_stability_score, calculate_discipline_score
from .segmentation import classify_investor_profile, get_profile_characteristics

def build_user_profile(user_data):
    """
    Build complete user profile
    Args:
        user_data: dict with user trading history and preferences
    Returns:
        complete profile dict
    """
    risk_score = calculate_risk_score(user_data)
    stability_score = calculate_stability_score(user_data)
    discipline_score = calculate_discipline_score(user_data)
    
    profile_type = classify_investor_profile(risk_score, stability_score, discipline_score)
    characteristics = get_profile_characteristics(profile_type)
    
    profile = {
        "risk_score": int(risk_score),
        "stability_score": int(stability_score),
        "discipline_score": int(discipline_score),
        "profile_type": profile_type,
        "characteristics": characteristics,
        "metadata": {
            "age": user_data.get('age'),
            "experience_years": user_data.get('experience_years'),
            "portfolio_value": user_data.get('portfolio_value')
        }
    }
    
    return profile
