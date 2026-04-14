import numpy as np
from datetime import datetime, timedelta

def calculate_returns(prices):
    """Calculate returns from price series"""
    if len(prices) < 2:
        return []
    return [(prices[i] - prices[i-1]) / prices[i-1] for i in range(1, len(prices))]

def calculate_volatility(returns, annualize=True):
    """Calculate volatility from returns"""
    if len(returns) < 2:
        return 0
    vol = np.std(returns)
    return vol * np.sqrt(252) if annualize else vol

def calculate_sharpe_ratio(returns, risk_free_rate=0.02):
    """Calculate Sharpe ratio"""
    if len(returns) < 2:
        return 0
    excess_returns = np.mean(returns) - risk_free_rate / 252
    return excess_returns / (np.std(returns) + 1e-10)

def calculate_max_drawdown(prices):
    """Calculate maximum drawdown"""
    if len(prices) < 2:
        return 0
    peak = prices[0]
    max_dd = 0
    for price in prices:
        if price > peak:
            peak = price
        dd = (peak - price) / peak
        if dd > max_dd:
            max_dd = dd
    return max_dd

def generate_date_range(start_date, periods, freq='D'):
    """Generate date range"""
    dates = []
    current = datetime.strptime(start_date, '%Y-%m-%d') if isinstance(start_date, str) else start_date
    
    for i in range(periods):
        dates.append(current.strftime('%Y-%m-%d'))
        if freq == 'D':
            current += timedelta(days=1)
        elif freq == 'W':
            current += timedelta(weeks=1)
        elif freq == 'M':
            current += timedelta(days=30)
    
    return dates

def safe_divide(numerator, denominator, default=0):
    """Safe division with default value"""
    try:
        return numerator / denominator if denominator != 0 else default
    except:
        return default
