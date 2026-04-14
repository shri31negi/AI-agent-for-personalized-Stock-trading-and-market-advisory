import numpy as np
import pandas as pd
from pathlib import Path

class ProphetModel:
    def __init__(self):
        self.model = None
        self.fitted = False
        
    def load_model(self, model_path=None):
        """Load trained Prophet model"""
        if model_path and Path(model_path).exists():
            try:
                import pickle
                with open(model_path, 'rb') as f:
                    self.model = pickle.load(f)
                self.fitted = True
                return True
            except Exception as e:
                print(f"Error loading Prophet model: {e}")
                return False
        return False
    
    def predict(self, data, periods=30):
        """
        Predict using Prophet
        Args:
            data: DataFrame with 'ds' (date) and 'y' (value) columns
            periods: number of periods to forecast
        Returns:
            dict with predictions and components
        """
        try:
            if not self.fitted:
                return self._fallback_predict(data, periods)
            
            future = self.model.make_future_dataframe(periods=periods)
            forecast = self.model.predict(future)
            
            return {
                "predictions": forecast['yhat'].tail(periods).tolist(),
                "lower_bound": forecast['yhat_lower'].tail(periods).tolist(),
                "upper_bound": forecast['yhat_upper'].tail(periods).tolist(),
                "model_type": "Prophet",
                "periods": periods
            }
        except Exception as e:
            return self._fallback_predict(data, periods)
    
    def _fallback_predict(self, data, periods):
        """Fallback prediction using simple exponential smoothing"""
        if isinstance(data, pd.DataFrame) and 'y' in data.columns:
            values = data['y'].values
        else:
            values = np.array(data)
        
        if len(values) < 2:
            base = float(values[-1]) if len(values) > 0 else 100.0
            return {
                "predictions": [base] * periods,
                "model_type": "Prophet_fallback"
            }
        
        alpha = 0.3
        smoothed = [values[0]]
        for val in values[1:]:
            smoothed.append(alpha * val + (1 - alpha) * smoothed[-1])
        
        last_value = smoothed[-1]
        trend = (smoothed[-1] - smoothed[-min(10, len(smoothed))]) / min(10, len(smoothed))
        
        predictions = [float(last_value + trend * (i + 1)) for i in range(periods)]
        
        return {
            "predictions": predictions,
            "model_type": "Prophet_fallback",
            "periods": periods
        }
