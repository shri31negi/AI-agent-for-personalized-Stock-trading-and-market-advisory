# TradeMind AI Integration Module

Production-ready AI system for stock prediction, investor profiling, and portfolio recommendations.

## Features

- **Stock Prediction**: LSTM, ARIMA, Prophet models with ensemble support
- **Investor Profiling**: Risk scoring, behavior analysis, profile segmentation
- **Portfolio Recommendations**: Asset allocation, stock selection, strategy mapping
- **Clean API**: JSON-based interface for Node.js backend integration

## Installation

```bash
cd ai_integration
pip install -r requirements.txt
```

## Usage

### From Python

```python
from services.prediction_service import get_stock_prediction
from services.profiling_service import build_investor_profile
from services.recommendation_service import generate_recommendation

# Stock prediction
prices = [100, 102, 105, 107, 110, 112, 115]
prediction = get_stock_prediction(prices, model_type='lstm')

# Investor profiling
user_data = {
    'trades_per_month': 10,
    'avg_position_size_pct': 15,
    'portfolio_value': 50000,
    'age': 35,
    'experience_years': 5
}
profile = build_investor_profile(user_data)

# Portfolio recommendation
recommendation = generate_recommendation(
    profile['profile'], 
    market_data={'stocks': [], 'conditions': {'trend': 'bullish'}},
    portfolio_value=50000
)
```

### From Node.js

```javascript
const { spawn } = require('child_process');

// Call Python service
const python = spawn('python', ['ai_integration/main.py', 'predict', '--data', 'prices.json']);

python.stdout.on('data', (data) => {
  const result = JSON.parse(data.toString());
  console.log(result);
});
```

## Module Structure

```
ai_integration/
├── models/              # ML models (LSTM, ARIMA, Prophet)
├── preprocessing/       # Data cleaning, feature engineering, indicators
├── profiling/          # Risk scoring, behavior analysis, segmentation
├── recommendation/     # Portfolio allocation, stock selection, strategies
├── services/           # Main service layer (entry points)
├── pipelines/          # Training and inference pipelines
├── api_bridge/         # Request validation, response formatting
├── utils/              # Constants, helpers, logger
├── config/             # Configuration files
└── main.py            # Main entry point
```

## API Reference

### Prediction Service
- `get_stock_prediction(data, model_type, periods)` - Get price predictions
- `get_technical_analysis(data)` - Calculate technical indicators

### Profiling Service
- `build_investor_profile(user_data)` - Build complete investor profile
- `update_profile(current_profile, new_data)` - Update existing profile

### Recommendation Service
- `generate_recommendation(profile, market_data, portfolio_value)` - Generate portfolio recommendations
- `get_rebalancing_advice(current_portfolio, target_profile, portfolio_value)` - Get rebalancing actions

## Profile Output Format

```json
{
  "risk_score": 65,
  "stability_score": 70,
  "discipline_score": 75,
  "profile_type": "Moderate",
  "characteristics": {
    "risk_tolerance": "Medium",
    "recommended_allocation": {"stocks": 60, "bonds": 30, "cash": 10},
    "max_position_size": 10
  }
}
```

## Configuration

Edit `config/model_config.yaml` and `config/feature_config.yaml` to customize model parameters and feature engineering settings.
