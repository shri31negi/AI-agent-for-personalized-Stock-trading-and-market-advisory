import logging
from pathlib import Path
from datetime import datetime

def setup_logger(name='ai_integration', log_dir='logs', level=logging.INFO):
    """
    Setup logger for the module
    Args:
        name: logger name
        log_dir: directory for log files
        level: logging level
    Returns:
        configured logger
    """
    Path(log_dir).mkdir(exist_ok=True)
    
    logger = logging.getLogger(name)
    logger.setLevel(level)
    
    if not logger.handlers:
        # File handler
        log_file = Path(log_dir) / f"{name}_{datetime.now().strftime('%Y%m%d')}.log"
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(level)
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setLevel(level)
        
        # Formatter
        formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
        file_handler.setFormatter(formatter)
        console_handler.setFormatter(formatter)
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
    
    return logger

def log_prediction(logger, model_type, input_size, prediction, confidence):
    """Log prediction details"""
    logger.info(f"Prediction - Model: {model_type}, Input Size: {input_size}, Prediction: {prediction}, Confidence: {confidence}")

def log_profile(logger, profile_type, risk_score):
    """Log profile generation"""
    logger.info(f"Profile Generated - Type: {profile_type}, Risk Score: {risk_score}")

def log_error(logger, error, context=""):
    """Log error with context"""
    logger.error(f"Error in {context}: {str(error)}")
