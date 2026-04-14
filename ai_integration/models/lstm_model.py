import numpy as np
import json
from pathlib import Path

class LSTMModel:
    def __init__(self, model_path=None):
        self.model = None
        self.model_path = model_path
        self.sequence_length = 60
        
    def load_model(self):
        """Load trained LSTM model from disk"""
        if self.model_path and Path(self.model_path).exists():
            try:
                import tensorflow as tf
                self.model = tf.keras.models.load_model(self.model_path)
                return True
            except Exception as e:
                print(f"Error loading model: {e}")
                return False
        return False
    
    def predict(self, data):
        """
        Predict stock trends using LSTM
        Args:
            data: numpy array of shape (samples, sequence_length, features)
        Returns:
            dict with predictions and confidence
        """
        if self.model is None:
            # Fallback: simple moving average prediction
            return self._fallback_predict(data)
        
        try:
            predictions = self.model.predict(data)
            return {
                "predictions": predictions.tolist(),
                "model_type": "LSTM",
                "confidence": float(np.mean(predictions))
            }
        except Exception as e:
            return {"error": str(e), "model_type": "LSTM"}
    
    def _fallback_predict(self, data):
        """Simple fallback when model not loaded"""
        try:
            # Handle different data shapes
            if isinstance(data, np.ndarray):
                if len(data.shape) == 3:
                    last_values = data[:, -1, 0]
                elif len(data.shape) == 2:
                    last_values = data[-1, 0] if data.shape[0] > 0 else 0
                else:
                    last_values = data[-1] if len(data) > 0 else 0
            else:
                last_values = data[-1] if len(data) > 0 else 0
            
            # Calculate simple trend-based prediction
            if isinstance(last_values, np.ndarray):
                last_value = float(last_values[0]) if len(last_values) > 0 else 0.0
            else:
                last_value = float(last_values)
            
            # Simple momentum-based prediction
            trend = 1.02  # 2% upward bias
            prediction = last_value * trend
            
            return {
                "predictions": [float(prediction)],
                "model_type": "LSTM_fallback",
                "confidence": 0.65
            }
        except Exception as e:
            return {
                "predictions": [0.0],
                "model_type": "LSTM_fallback",
                "confidence": 0.0,
                "error": str(e)
            }
