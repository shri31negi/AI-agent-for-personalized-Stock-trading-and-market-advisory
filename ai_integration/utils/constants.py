PROFILE_TYPES = ['Conservative', 'Cautious', 'Moderate', 'Balanced', 'Aggressive', 'Speculative']

MODEL_TYPES = ['lstm', 'arima', 'prophet', 'ensemble']

ASSET_CLASSES = ['stocks', 'bonds', 'cash', 'alternatives', 'crypto', 'commodities']

RISK_LEVELS = {
    'low': (0, 30),
    'medium': (30, 70),
    'high': (70, 100)
}

TECHNICAL_INDICATORS = ['rsi', 'macd', 'sma', 'ema', 'bollinger_bands', 'atr', 'stochastic']

DEFAULT_SEQUENCE_LENGTH = 60
DEFAULT_PREDICTION_PERIODS = 5

MIN_DATA_POINTS = 10
RECOMMENDED_DATA_POINTS = 100
