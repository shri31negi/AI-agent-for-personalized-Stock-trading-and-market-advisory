import numpy as np
import pandas as pd

def handle_missing_values(data, method='forward_fill'):
    """
    Handle missing values in time series data
    Args:
        data: pandas DataFrame or numpy array
        method: 'forward_fill', 'backward_fill', 'interpolate', 'drop'
    Returns:
        cleaned data
    """
    if isinstance(data, pd.DataFrame):
        if method == 'forward_fill':
            return data.fillna(method='ffill').fillna(method='bfill')
        elif method == 'backward_fill':
            return data.fillna(method='bfill').fillna(method='ffill')
        elif method == 'interpolate':
            return data.interpolate(method='linear').fillna(method='bfill')
        elif method == 'drop':
            return data.dropna()
    elif isinstance(data, np.ndarray):
        # Handle 1D arrays
        if data.ndim == 1:
            if method == 'forward_fill':
                mask = np.isnan(data)
                if not mask.any():
                    return data
                idx = np.where(~mask, np.arange(len(data)), 0)
                np.maximum.accumulate(idx, out=idx)
                return data[idx]
        # Handle multi-dimensional arrays
        else:
            return data
    
    return data

def normalize_data(data, method='minmax'):
    """
    Normalize data
    Args:
        data: numpy array or pandas DataFrame
        method: 'minmax', 'zscore', 'robust'
    Returns:
        normalized data and scaler params
    """
    if isinstance(data, pd.DataFrame):
        values = data.values
    else:
        values = np.array(data)
    
    if method == 'minmax':
        min_val = np.min(values, axis=0)
        max_val = np.max(values, axis=0)
        normalized = (values - min_val) / (max_val - min_val + 1e-8)
        scaler_params = {'min': min_val.tolist(), 'max': max_val.tolist(), 'method': 'minmax'}
    
    elif method == 'zscore':
        mean = np.mean(values, axis=0)
        std = np.std(values, axis=0)
        normalized = (values - mean) / (std + 1e-8)
        scaler_params = {'mean': mean.tolist(), 'std': std.tolist(), 'method': 'zscore'}
    
    elif method == 'robust':
        median = np.median(values, axis=0)
        q75, q25 = np.percentile(values, [75, 25], axis=0)
        iqr = q75 - q25
        normalized = (values - median) / (iqr + 1e-8)
        scaler_params = {'median': median.tolist(), 'iqr': iqr.tolist(), 'method': 'robust'}
    
    else:
        normalized = values
        scaler_params = {'method': 'none'}
    
    if isinstance(data, pd.DataFrame):
        return pd.DataFrame(normalized, columns=data.columns, index=data.index), scaler_params
    
    return normalized, scaler_params

def remove_outliers(data, method='iqr', threshold=1.5):
    """
    Remove or cap outliers
    Args:
        data: pandas DataFrame or numpy array
        method: 'iqr', 'zscore'
        threshold: threshold for outlier detection
    Returns:
        data with outliers handled
    """
    if isinstance(data, pd.DataFrame):
        df = data.copy()
        for col in df.select_dtypes(include=[np.number]).columns:
            if method == 'iqr':
                Q1 = df[col].quantile(0.25)
                Q3 = df[col].quantile(0.75)
                IQR = Q3 - Q1
                lower = Q1 - threshold * IQR
                upper = Q3 + threshold * IQR
                df[col] = df[col].clip(lower, upper)
            elif method == 'zscore':
                mean = df[col].mean()
                std = df[col].std()
                df[col] = df[col].clip(mean - threshold * std, mean + threshold * std)
        return df
    
    return data
