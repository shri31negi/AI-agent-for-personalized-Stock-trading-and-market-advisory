import numpy as np

def filter_stocks_by_risk(stocks, risk_score):
    """
    Filter stocks based on user risk tolerance
    Args:
        stocks: list of stock dicts with risk metrics
        risk_score: user risk score (0-100)
    Returns:
        filtered stocks
    """
    filtered = []
    
    for stock in stocks:
        stock_volatility = stock.get('volatility', 0.2)
        stock_beta = stock.get('beta', 1.0)
        
        stock_risk = (stock_volatility * 100 + abs(stock_beta - 1) * 50)
        
        if risk_score >= 70:
            if stock_risk <= 100:
                filtered.append({**stock, 'risk_level': stock_risk})
        elif risk_score >= 40:
            if stock_risk <= 60:
                filtered.append({**stock, 'risk_level': stock_risk})
        else:
            if stock_risk <= 40:
                filtered.append({**stock, 'risk_level': stock_risk})
    
    return filtered

def rank_stocks(stocks, profile):
    """
    Rank stocks based on profile preferences
    Args:
        stocks: list of stocks
        profile: user profile
    Returns:
        ranked stocks
    """
    risk_score = profile.get('risk_score', 50)
    profile_type = profile.get('profile_type', 'Moderate')
    
    scored_stocks = []
    for stock in stocks:
        score = 0
        
        # Momentum score
        momentum = stock.get('momentum', 0)
        score += momentum * 20
        
        # Value score
        pe_ratio = stock.get('pe_ratio', 20)
        if pe_ratio < 15:
            score += 15
        elif pe_ratio < 25:
            score += 10
        
        # Growth score
        growth_rate = stock.get('growth_rate', 0)
        score += growth_rate * 10
        
        # Dividend yield (for conservative profiles)
        if profile_type in ['Conservative', 'Cautious']:
            dividend_yield = stock.get('dividend_yield', 0)
            score += dividend_yield * 30
        
        # Volatility adjustment
        volatility = stock.get('volatility', 0.2)
        if risk_score < 40 and volatility > 0.3:
            score -= 20
        
        scored_stocks.append({**stock, 'recommendation_score': score})
    
    return sorted(scored_stocks, key=lambda x: x['recommendation_score'], reverse=True)

def select_top_stocks(stocks, profile, count=10):
    """
    Select top N stocks for recommendation
    Args:
        stocks: list of stocks
        profile: user profile
        count: number of stocks to select
    Returns:
        top stocks
    """
    filtered = filter_stocks_by_risk(stocks, profile.get('risk_score', 50))
    ranked = rank_stocks(filtered, profile)
    
    return ranked[:count]
