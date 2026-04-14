from pathlib import Path
from .lstm_model import LSTMModel
from .arima_model import ARIMAModel
from .prophet_model import ProphetModel

class ModelLoader:
    def __init__(self, models_dir="trained_models"):
        self.models_dir = Path(models_dir)
        self.models = {}
        
    def load_all_models(self):
        """Load all available models"""
        model_configs = {
            "lstm": {"class": LSTMModel, "path": self.models_dir / "lstm_model.h5"},
            "arima": {"class": ARIMAModel, "path": self.models_dir / "arima_model.pkl"},
            "prophet": {"class": ProphetModel, "path": self.models_dir / "prophet_model.pkl"}
        }
        
        for name, config in model_configs.items():
            try:
                model = config["class"]()
                if config["path"].exists():
                    model.load_model(str(config["path"]))
                self.models[name] = model
            except Exception as e:
                print(f"Failed to load {name}: {e}")
                self.models[name] = config["class"]()
        
        return self.models
    
    def get_model(self, model_type):
        """Get specific model by type"""
        if model_type not in self.models:
            self.load_all_models()
        return self.models.get(model_type)
    
    def predict_ensemble(self, data, model_types=None):
        """Get predictions from multiple models and ensemble"""
        if model_types is None:
            model_types = ["lstm", "arima", "prophet"]
        
        predictions = {}
        for model_type in model_types:
            model = self.get_model(model_type)
            if model:
                predictions[model_type] = model.predict(data)
        
        return predictions
