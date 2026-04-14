import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from models.model_loader import ModelLoader
from preprocessing.data_cleaning import handle_missing_values, normalize_data
from preprocessing.technical_indicators import calculate_rsi, calculate_macd, calculate_moving_averages
import numpy as np

def get_stock_prediction(data, model_type='lstm', periods=5):
    """
    Get stock price prediction
    Args:
        data: historical price data (dict or array)
        model_type: 'lstm', 'arima', 'prophet', or 'ensemble'
        periods: number of periods to predict
    Returns:
        prediction dict with forecasts and confidence
    """
    try:
        # Preprocess data
        if isinstance(data, dict):
            prices = data.get('close', data.get('prices', []))
        else:
            prices = data
        
        prices = np.array(prices)
        
        # Handle missing values
        if len(prices) > 0:
            prices = handle_missing_values(prices, method='forward_fill')
        else:
            return {
                'error': 'No price data provided',
                'prediction': 0.0,
                'confidence': 0.0,
                'model_type': model_type
            }
        
        # Load model
        loader = ModelLoader()
        
        if model_type == 'ensemble':
            predictions = loader.predict_ensemble(prices)
            
            # Average predictions
            all_preds = []
            for pred in predictions.values():
                if 'predictions' in pred and pred['predictions']:
                    pred_val = pred['predictions'][0] if isinstance(pred['predictions'], list) else pred['predictions']
                    if pred_val is not None:
                        all_preds.append(float(pred_val))
            
            avg_prediction = np.mean(all_preds) if all_preds else float(prices[-1])
            
            return {
                'prediction': float(avg_prediction),
                'predictions': predictions,
                'model_type': 'ensemble',
                'confidence': 0.75
            }
        else:
            model = loader.get_model(model_type)
            result = model.predict(prices)
            
            # Extract prediction value
            pred_value = None
            if 'predictions' in result and result['predictions']:
                pred_value = result['predictions'][0] if isinstance(result['predictions'], list) else result['predictions']
            
            # Fallback to last price if prediction is None
            if pred_value is None:
                pred_value = float(prices[-1])
            
            return {
                'prediction': float(pred_value),
                'model_type': model_type,
                'confidence': result.get('confidence', 0.7),
                'details': result
            }
    
    except Exception as e:
        # Return safe fallback
        try:
            fallback_price = float(data[-1]) if isinstance(data, (list, np.ndarray)) and len(data) > 0 else 0.0
        except:
            fallback_price = 0.0
            
        return {
            'error': str(e),
            'prediction': fallback_price,
            'confidence': 0.0,
            'model_type': model_type
        }

def get_technical_analysis(data):
    """
    Get technical analysis indicators
    Args:
        data: price data dict with OHLC
    Returns:
        technical indicators dict
    """
    try:
        import pandas as pd
        
        if isinstance(data, dict):
            df = pd.DataFrame(data)
        else:
            df = data
        
        indicators = {}
        
        # RSI
        indicators['rsi'] = calculate_rsi(df).iloc[-1] if len(df) > 14 else None
        
        # MACD
        macd = calculate_macd(df)
        indicators['macd'] = {
            'macd': float(macd['macd'].iloc[-1]) if len(df) > 26 else None,
            'signal': float(macd['signal'].iloc[-1]) if len(df) > 26 else None
        }
        
        # Moving Averages
        mas = calculate_moving_averages(df, periods=[20, 50])
        indicators['moving_averages'] = {
            'sma_20': float(mas['sma_20'].iloc[-1]) if len(df) > 20 else None,
            'sma_50': float(mas['sma_50'].iloc[-1]) if len(df) > 50 else None
        }
        
        return indicators
    
    except Exception as e:
        return {'error': str(e)}
