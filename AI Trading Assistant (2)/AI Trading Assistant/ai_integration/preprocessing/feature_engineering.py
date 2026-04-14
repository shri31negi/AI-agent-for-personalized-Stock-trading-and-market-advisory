import numpy as np
import pandas as pd

def create_lag_features(data, lags=[1, 2, 3, 5, 10]):
    """
    Create lagged features for time series
    Args:
        data: pandas DataFrame with time series
        lags: list of lag periods
    Returns:
        DataFrame with lag features
    """
    df = data.copy()
    
    for col in df.select_dtypes(include=[np.number]).columns:
        for lag in lags:
            df[f'{col}_lag_{lag}'] = df[col].shift(lag)
    
    return df

def create_rolling_features(data, windows=[5, 10, 20, 50]):
    """
    Create rolling window features
    Args:
        data: pandas DataFrame
        windows: list of window sizes
    Returns:
        DataFrame with rolling features
    """
    df = data.copy()
    
    for col in df.select_dtypes(include=[np.number]).columns:
        for window in windows:
            df[f'{col}_rolling_mean_{window}'] = df[col].rolling(window=window).mean()
            df[f'{col}_rolling_std_{window}'] = df[col].rolling(window=window).std()
            df[f'{col}_rolling_min_{window}'] = df[col].rolling(window=window).min()
            df[f'{col}_rolling_max_{window}'] = df[col].rolling(window=window).max()
    
    return df

def create_price_features(df):
    """
    Create price-based features
    Args:
        df: DataFrame with OHLC data
    Returns:
        DataFrame with price features
    """
    result = df.copy()
    
    if 'close' in result.columns:
        if 'open' in result.columns:
            result['price_change'] = result['close'] - result['open']
            result['price_change_pct'] = (result['close'] - result['open']) / result['open'] * 100
        
        result['returns'] = result['close'].pct_change()
        result['log_returns'] = np.log(result['close'] / result['close'].shift(1))
        
        if 'high' in result.columns and 'low' in result.columns:
            result['daily_range'] = result['high'] - result['low']
            result['daily_range_pct'] = (result['high'] - result['low']) / result['close'] * 100
    
    if 'volume' in result.columns:
        result['volume_change'] = result['volume'].pct_change()
        result['volume_ma_ratio'] = result['volume'] / result['volume'].rolling(20).mean()
    
    return result

def create_temporal_features(df, date_column='date'):
    """
    Create time-based features
    Args:
        df: DataFrame with date column
        date_column: name of date column
    Returns:
        DataFrame with temporal features
    """
    result = df.copy()
    
    if date_column in result.columns:
        result[date_column] = pd.to_datetime(result[date_column])
        result['day_of_week'] = result[date_column].dt.dayofweek
        result['day_of_month'] = result[date_column].dt.day
        result['month'] = result[date_column].dt.month
        result['quarter'] = result[date_column].dt.quarter
        result['year'] = result[date_column].dt.year
        result['is_month_start'] = result[date_column].dt.is_month_start.astype(int)
        result['is_month_end'] = result[date_column].dt.is_month_end.astype(int)
    
    return result
