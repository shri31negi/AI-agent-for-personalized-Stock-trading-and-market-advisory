import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from preprocessing.data_cleaning import handle_missing_values, normalize_data
from preprocessing.technical_indicators import calculate_rsi, calculate_macd
from models.model_loader import ModelLoader
import numpy as np

def run_inference(input_data, model_type='lstm'):
    """
    Run complete inference pipeline
    Args:
        input_data: raw input data
        model_type: model to use
    Returns:
        formatted prediction
    """
    # Step 1: Preprocess
    cleaned = handle_missing_values(input_data)
    normalized, _ = normalize_data(cleaned)
    
    # Step 2: Load model and predict
    loader = ModelLoader()
    model = loader.get_model(model_type)
    prediction = model.predict(normalized)
    
    # Step 3: Format output
    return format_prediction_output(prediction, input_data)

def format_prediction_output(prediction, original_data):
    """
    Format prediction for API response
    Args:
        prediction: model prediction
        original_data: original input
    Returns:
        formatted dict
    """
    return {
        'prediction': prediction.get('predictions', []),
        'confidence': prediction.get('confidence', 0.7),
        'model_type': prediction.get('model_type'),
        'timestamp': str(np.datetime64('now')),
        'input_summary': {
            'data_points': len(original_data),
            'last_value': float(original_data[-1]) if len(original_data) > 0 else None
        }
    }
