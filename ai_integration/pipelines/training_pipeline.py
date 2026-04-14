import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from preprocessing.data_cleaning import handle_missing_values, normalize_data
from preprocessing.feature_engineering import create_lag_features, create_rolling_features
import numpy as np

def prepare_training_data(raw_data, sequence_length=60):
    """
    Prepare data for model training
    Args:
        raw_data: raw time series data
        sequence_length: length of sequences for LSTM
    Returns:
        processed training data
    """
    # Clean data
    cleaned = handle_missing_values(raw_data)
    
    # Normalize
    normalized, scaler_params = normalize_data(cleaned)
    
    # Create sequences
    X, y = [], []
    for i in range(len(normalized) - sequence_length):
        X.append(normalized[i:i+sequence_length])
        y.append(normalized[i+sequence_length])
    
    return np.array(X), np.array(y), scaler_params

def train_lstm_model(X_train, y_train, epochs=50, batch_size=32):
    """
    Train LSTM model
    Args:
        X_train, y_train: training data
        epochs, batch_size: training parameters
    Returns:
        trained model
    """
    try:
        import tensorflow as tf
        from tensorflow import keras
        
        model = keras.Sequential([
            keras.layers.LSTM(50, return_sequences=True, input_shape=(X_train.shape[1], X_train.shape[2])),
            keras.layers.Dropout(0.2),
            keras.layers.LSTM(50, return_sequences=False),
            keras.layers.Dropout(0.2),
            keras.layers.Dense(25),
            keras.layers.Dense(1)
        ])
        
        model.compile(optimizer='adam', loss='mse')
        model.fit(X_train, y_train, epochs=epochs, batch_size=batch_size, validation_split=0.2, verbose=1)
        
        return model
    except Exception as e:
        print(f"Training failed: {e}")
        return None

def save_model(model, model_path, scaler_params=None):
    """Save trained model and scaler"""
    Path(model_path).parent.mkdir(parents=True, exist_ok=True)
    
    if model:
        model.save(model_path)
    
    if scaler_params:
        import json
        scaler_path = str(model_path).replace('.h5', '_scaler.json')
        with open(scaler_path, 'w') as f:
            json.dump(scaler_params, f)
