import numpy as np

def calculate_risk_score(user_data):
    """
    Calculate user risk score (0-100)
    Args:
        user_data: dict with user trading history and preferences
    Returns:
        risk score (0=conservative, 100=aggressive)
    """
    score = 50  # baseline
    
    # Trading frequency factor
    trades_per_month = user_data.get('trades_per_month', 5)
    if trades_per_month > 20:
        score += 15
    elif trades_per_month > 10:
        score += 10
    elif trades_per_month < 3:
        score -= 10
    
    # Position size factor
    avg_position_size = user_data.get('avg_position_size_pct', 10)
    if avg_position_size > 30:
        score += 20
    elif avg_position_size > 15:
        score += 10
    elif avg_position_size < 5:
        score -= 15
    
    # Leverage usage
    uses_leverage = user_data.get('uses_leverage', False)
    leverage_ratio = user_data.get('leverage_ratio', 1.0)
    if uses_leverage and leverage_ratio > 2:
        score += 15
    elif uses_leverage:
        score += 8
    
    # Asset class diversity
    asset_classes = user_data.get('asset_classes', ['stocks'])
    if 'crypto' in asset_classes:
        score += 10
    if 'options' in asset_classes or 'futures' in asset_classes:
        score += 15
    if 'bonds' in asset_classes:
        score -= 5
    
    # Historical volatility preference
    avg_volatility = user_data.get('portfolio_volatility', 0.15)
    if avg_volatility > 0.30:
        score += 15
    elif avg_volatility > 0.20:
        score += 8
    elif avg_volatility < 0.10:
        score -= 10
    
    # Loss tolerance
    max_drawdown_tolerance = user_data.get('max_drawdown_tolerance', 15)
    if max_drawdown_tolerance > 30:
        score += 10
    elif max_drawdown_tolerance < 10:
        score -= 10
    
    # Age and experience
    age = user_data.get('age', 35)
    experience_years = user_data.get('experience_years', 2)
    
    if age < 30 and experience_years > 3:
        score += 5
    elif age > 55:
        score -= 10
    
    if experience_years < 1:
        score -= 15
    elif experience_years > 5:
        score += 5
    
    # Investment horizon
    horizon = user_data.get('investment_horizon', 'medium')
    if horizon == 'short':
        score += 10
    elif horizon == 'long':
        score -= 5
    
    # Clamp score between 0 and 100
    return max(0, min(100, score))

def calculate_volatility_tolerance(user_data):
    """Calculate user's volatility tolerance"""
    risk_score = calculate_risk_score(user_data)
    
    if risk_score >= 70:
        return {'level': 'high', 'max_volatility': 0.40}
    elif risk_score >= 40:
        return {'level': 'medium', 'max_volatility': 0.25}
    else:
        return {'level': 'low', 'max_volatility': 0.15}

def calculate_loss_capacity(user_data):
    """Calculate maximum acceptable loss"""
    portfolio_value = user_data.get('portfolio_value', 10000)
    risk_score = calculate_risk_score(user_data)
    
    if risk_score >= 70:
        max_loss_pct = 0.25
    elif risk_score >= 40:
        max_loss_pct = 0.15
    else:
        max_loss_pct = 0.08
    
    return {
        'max_loss_pct': max_loss_pct,
        'max_loss_amount': portfolio_value * max_loss_pct
    }
