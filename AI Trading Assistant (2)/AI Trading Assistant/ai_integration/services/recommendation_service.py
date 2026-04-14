import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from recommendation.portfolio_allocator import allocate_portfolio, calculate_position_sizes
from recommendation.stock_selector import select_top_stocks
from recommendation.strategy_mapper import map_strategy_to_profile, generate_action_plan

def generate_recommendation(profile, market_data, portfolio_value=10000):
    """
    Generate complete portfolio recommendation
    Args:
        profile: user profile dict
        market_data: dict with available stocks and market conditions
        portfolio_value: total portfolio value
    Returns:
        complete recommendation dict
    """
    try:
        # Get portfolio allocation
        allocation = allocate_portfolio(profile, portfolio_value)
        
        # Select stocks
        available_stocks = market_data.get('stocks', [])
        selected_stocks = select_top_stocks(available_stocks, profile, count=10)
        
        # Calculate position sizes
        positions = calculate_position_sizes(profile, selected_stocks, portfolio_value)
        
        # Get strategy
        strategy = map_strategy_to_profile(profile.get('profile_type', 'Moderate'))
        
        # Generate action plan
        market_conditions = market_data.get('conditions', {'trend': 'neutral', 'volatility': 'medium'})
        action_plan = generate_action_plan(profile, market_conditions)
        
        return {
            'success': True,
            'recommendation': {
                'allocation': allocation,
                'selected_stocks': selected_stocks[:5],
                'positions': positions[:5],
                'strategy': strategy,
                'action_plan': action_plan
            }
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def get_rebalancing_advice(current_portfolio, target_profile, portfolio_value):
    """
    Get portfolio rebalancing recommendations
    Args:
        current_portfolio: current allocation dict
        target_profile: target user profile
        portfolio_value: total portfolio value
    Returns:
        rebalancing advice
    """
    try:
        from recommendation.portfolio_allocator import rebalance_portfolio
        
        target_allocation = target_profile.get('characteristics', {}).get('recommended_allocation', {})
        
        actions = rebalance_portfolio(current_portfolio, target_allocation, portfolio_value)
        
        return {
            'success': True,
            'rebalancing_actions': actions,
            'target_allocation': target_allocation
        }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
