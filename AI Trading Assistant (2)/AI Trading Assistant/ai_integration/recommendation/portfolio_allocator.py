import numpy as np

def allocate_portfolio(profile, portfolio_value):
    """
    Allocate portfolio based on user profile
    Args:
        profile: user profile dict
        portfolio_value: total portfolio value
    Returns:
        allocation dict
    """
    profile_type = profile.get('profile_type', 'Moderate')
    characteristics = profile.get('characteristics', {})
    recommended_allocation = characteristics.get('recommended_allocation', {})
    
    allocation = {}
    for asset_class, percentage in recommended_allocation.items():
        allocation[asset_class] = {
            'percentage': percentage,
            'amount': portfolio_value * (percentage / 100)
        }
    
    return {
        'profile_type': profile_type,
        'total_value': portfolio_value,
        'allocation': allocation
    }

def rebalance_portfolio(current_allocation, target_allocation, portfolio_value):
    """
    Calculate rebalancing actions
    Args:
        current_allocation: current portfolio allocation dict
        target_allocation: target allocation dict
        portfolio_value: total portfolio value
    Returns:
        rebalancing actions
    """
    actions = []
    
    for asset_class, target_pct in target_allocation.items():
        current_pct = current_allocation.get(asset_class, 0)
        difference = target_pct - current_pct
        
        if abs(difference) > 5:
            action_type = 'buy' if difference > 0 else 'sell'
            amount = abs(difference) * portfolio_value / 100
            
            actions.append({
                'asset_class': asset_class,
                'action': action_type,
                'amount': amount,
                'percentage_change': difference
            })
    
    return actions

def calculate_position_sizes(profile, stocks, portfolio_value):
    """
    Calculate position sizes for selected stocks
    Args:
        profile: user profile
        stocks: list of stock recommendations
        portfolio_value: total portfolio value
    Returns:
        position sizes for each stock
    """
    max_position_size = profile.get('characteristics', {}).get('max_position_size', 10)
    risk_score = profile.get('risk_score', 50)
    
    positions = []
    for stock in stocks:
        stock_risk = stock.get('risk_level', 50)
        
        if stock_risk > risk_score + 20:
            position_pct = max_position_size * 0.5
        elif stock_risk > risk_score:
            position_pct = max_position_size * 0.75
        else:
            position_pct = max_position_size
        
        positions.append({
            'symbol': stock.get('symbol'),
            'percentage': position_pct,
            'amount': portfolio_value * (position_pct / 100),
            'shares': int((portfolio_value * position_pct / 100) / stock.get('price', 1))
        })
    
    return positions
