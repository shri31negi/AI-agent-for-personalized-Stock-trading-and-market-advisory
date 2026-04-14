import numpy as np

def calculate_stability_score(user_data):
    """
    Calculate trading stability score (0-100)
    Args:
        user_data: dict with trading history
    Returns:
        stability score
    """
    score = 50
    
    # Consistency in trading frequency
    trades_variance = user_data.get('trades_variance', 5)
    if trades_variance < 3:
        score += 15
    elif trades_variance > 10:
        score -= 15
    
    # Portfolio turnover rate
    turnover_rate = user_data.get('portfolio_turnover', 0.5)
    if turnover_rate < 0.3:
        score += 10
    elif turnover_rate > 1.0:
        score -= 15
    
    # Holding period consistency
    avg_holding_days = user_data.get('avg_holding_days', 30)
    if avg_holding_days > 90:
        score += 15
    elif avg_holding_days < 7:
        score -= 10
    
    # Win rate consistency
    win_rate = user_data.get('win_rate', 0.5)
    if 0.45 <= win_rate <= 0.65:
        score += 10
    elif win_rate < 0.3 or win_rate > 0.8:
        score -= 10
    
    return max(0, min(100, score))

def calculate_discipline_score(user_data):
    """
    Calculate trading discipline score (0-100)
    Args:
        user_data: dict with trading behavior
    Returns:
        discipline score
    """
    score = 50
    
    # Stop loss usage
    uses_stop_loss = user_data.get('uses_stop_loss', False)
    stop_loss_adherence = user_data.get('stop_loss_adherence', 0.5)
    if uses_stop_loss and stop_loss_adherence > 0.8:
        score += 20
    elif uses_stop_loss:
        score += 10
    else:
        score -= 15
    
    # Take profit usage
    uses_take_profit = user_data.get('uses_take_profit', False)
    if uses_take_profit:
        score += 10
    
    # Emotional trading indicators
    revenge_trades = user_data.get('revenge_trades', 0)
    if revenge_trades == 0:
        score += 15
    elif revenge_trades > 5:
        score -= 20
    
    # Overtrading
    overtrading_score = user_data.get('overtrading_score', 0)
    score -= overtrading_score * 2
    
    # Plan adherence
    plan_adherence = user_data.get('plan_adherence', 0.5)
    score += (plan_adherence - 0.5) * 40
    
    return max(0, min(100, score))
