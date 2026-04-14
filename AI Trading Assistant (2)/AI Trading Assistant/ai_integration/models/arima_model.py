import numpy as np
from pathlib import Path

class ARIMAModel:
    def __init__(self, order=(5, 1, 0)):
        self.order = order
        self.model = None
        self.fitted = False
        
    def load_model(self, model_path=None):
        """Load trained ARIMA model"""
        if model_path and Path(model_path).exists():
            try:
                import pickle
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.fitted = True
                return True
            except Exception as e:
                print(f"Error loading ARIMA model: {e}")
                return False
        return False
    
    def predict(self, data, steps=5):
        """
        Predict future values using ARIMA
        Args:
            data: time series data (1D array)
            steps: number of steps to forecast
        Returns:
            dict with predictions
        """
        try:
            if not self.fitted:
                return self._fallback_predict(data, steps)
            
            forecast = self.model.forecast(steps=steps)
            return {
                "predictions": forecast.tolist(),
                "model_type": "ARIMA",
                "order": self.order,
                "steps": steps
            }
        except Exception as e:
            return self._fallback_predict(data, steps)
    
    def _fallback_predict(self, data, steps):
        """Simple trend-based fallback"""
        if len(data) < 2:
            return {"predictions": [float(data[-1])] * steps, "model_type": "ARIMA_fallback"}
        
        recent_trend = (data[-1] - data[-min(5, len(data))]) / min(5, len(data))
        predictions = [float(data[-1] + recent_trend * (i + 1)) for i in range(steps)]
        
        return {
            "predictions": predictions,
            "model_type": "ARIMA_fallback",
            "steps": steps
        }
