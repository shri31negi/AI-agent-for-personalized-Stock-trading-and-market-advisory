def validate_prediction_request(data):
    """Validate prediction request"""
    required = ['prices']
    
    if not all(field in data for field in required):
        return False, f"Missing required fields: {required}"
    
    if not isinstance(data['prices'], list) or len(data['prices']) < 10:
        return False, "Prices must be a list with at least 10 data points"
    
    return True, "Valid"

def validate_profiling_request(data):
    """Validate profiling request"""
    required = ['trades_per_month', 'avg_position_size_pct', 'portfolio_value']
    
    if not all(field in data for field in required):
        return False, f"Missing required fields: {required}"
    
    if data['portfolio_value'] <= 0:
        return False, "Portfolio value must be positive"
    
    return True, "Valid"

def validate_recommendation_request(data):
    """Validate recommendation request"""
    required = ['profile', 'market_data']
    
    if not all(field in data for field in required):
        return False, f"Missing required fields: {required}"
    
    if 'profile_type' not in data['profile']:
        return False, "Profile must contain profile_type"
    
    return True, "Valid"
