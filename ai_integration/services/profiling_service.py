import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from profiling.profile_builder import build_user_profile

def build_investor_profile(user_data):
    """
    Build complete investor profile
    Args:
        user_data: dict with user trading history and preferences
            Required fields:
                - trades_per_month: int
                - avg_position_size_pct: float
                - portfolio_value: float
            Optional fields:
                - uses_leverage: bool
                - leverage_ratio: float
                - asset_classes: list
                - portfolio_volatility: float
                - max_drawdown_tolerance: float
                - age: int
                - experience_years: int
                - investment_horizon: str
    Returns:
        complete profile dict
    """
    try:
        profile = build_user_profile(user_data)
        return {
            'success': True,
            'profile': profile
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

def update_profile(current_profile, new_data):
    """
    Update existing profile with new data
    Args:
        current_profile: existing profile dict
        new_data: new user data
    Returns:
        updated profile
    """
    try:
        # Merge current metadata with new data
        merged_data = {**current_profile.get('metadata', {}), **new_data}
        
        # Rebuild profile
        updated_profile = build_user_profile(merged_data)
        
        return {
            'success': True,
            'profile': updated_profile,
            'changes': {
                'risk_score_change': updated_profile['risk_score'] - current_profile.get('risk_score', 50),
                'profile_type_changed': updated_profile['profile_type'] != current_profile.get('profile_type')
            }
        }
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }
