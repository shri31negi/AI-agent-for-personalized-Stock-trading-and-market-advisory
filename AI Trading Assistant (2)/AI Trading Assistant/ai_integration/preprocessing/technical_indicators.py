import numpy as np
import pandas as pd

def calculate_rsi(data, period=14):
    """
    Calculate Relative Strength Index
    Args:
        data: price series
        period: RSI period
    Returns:
        RSI values
    """
    if isinstance(data, pd.DataFrame):
        prices = data['close'] if 'close' in data.columns else data.iloc[:, 0]
    else:
        prices = pd.Series(data)
    
    delta = prices.diff()
    gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
    loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
    
    rs = gain / (loss + 1e-10)
    rsi = 100 - (100 / (1 + rs))
    
    return rsi

def calculate_macd(data, fast=12, slow=26, signal=9):
    """
    Calculate MACD (Moving Average Convergence Divergence)
    Args:
        data: price series
        fast, slow, signal: MACD parameters
    Returns:
        dict with MACD, signal, and histogram
    """
    if isinstance(data, pd.DataFrame):
        prices = data['close'] if 'close' in data.columns else data.iloc[:, 0]
    else:
        prices = pd.Series(data)
    
    ema_fast = prices.ewm(span=fast, adjust=False).mean()
    ema_slow = prices.ewm(span=slow, adjust=False).mean()
    
    macd_line = ema_fast - ema_slow
    signal_line = macd_line.ewm(span=signal, adjust=False).mean()
    histogram = macd_line - signal_line
    
    return {
        'macd': macd_line,
        'signal': signal_line,
        'histogram': histogram
    }

def calculate_moving_averages(data, periods=[20, 50, 200]):
    """
    Calculate Simple and Exponential Moving Averages
    Args:
        data: price series
        periods: list of MA periods
    Returns:
        dict with SMA and EMA for each period
    """
    if isinstance(data, pd.DataFrame):
        prices = data['close'] if 'close' in data.columns else data.iloc[:, 0]
    else:
        prices = pd.Series(data)
    
    result = {}
    for period in periods:
        result[f'sma_{period}'] = prices.rolling(window=period).mean()
        result[f'ema_{period}'] = prices.ewm(span=period, adjust=False).mean()
    
    return result

def calculate_bollinger_bands(data, period=20, std_dev=2):
    """
    Calculate Bollinger Bands
    Args:
        data: price series
        period: moving average period
        std_dev: number of standard deviations
    Returns:
        dict with upper, middle, and lower bands
    """
    if isinstance(data, pd.DataFrame):
        prices = data['close'] if 'close' in data.columns else data.iloc[:, 0]
    else:
        prices = pd.Series(data)
    
    middle_band = prices.rolling(window=period).mean()
    std = prices.rolling(window=period).std()
    
    upper_band = middle_band + (std * std_dev)
    lower_band = middle_band - (std * std_dev)
    
    return {
        'upper': upper_band,
        'middle': middle_band,
        'lower': lower_band
    }

def calculate_atr(data, period=14):
    """
    Calculate Average True Range
    Args:
        data: DataFrame with high, low, close
        period: ATR period
    Returns:
        ATR values
    """
    if not isinstance(data, pd.DataFrame):
        return None
    
    if not all(col in data.columns for col in ['high', 'low', 'close']):
        return None
    
    high_low = data['high'] - data['low']
    high_close = np.abs(data['high'] - data['close'].shift())
    low_close = np.abs(data['low'] - data['close'].shift())
    
    true_range = pd.concat([high_low, high_close, low_close], axis=1).max(axis=1)
    atr = true_range.rolling(window=period).mean()
    
    return atr

def calculate_stochastic(data, period=14, smooth_k=3, smooth_d=3):
    """
    Calculate Stochastic Oscillator
    Args:
        data: DataFrame with high, low, close
        period: lookback period
        smooth_k, smooth_d: smoothing periods
    Returns:
        dict with %K and %D
    """
    if not isinstance(data, pd.DataFrame):
        return None
    
    if not all(col in data.columns for col in ['high', 'low', 'close']):
        return None
    
    low_min = data['low'].rolling(window=period).min()
    high_max = data['high'].rolling(window=period).max()
    
    k = 100 * (data['close'] - low_min) / (high_max - low_min + 1e-10)
    k = k.rolling(window=smooth_k).mean()
    d = k.rolling(window=smooth_d).mean()
    
    return {'k': k, 'd': d}
