#!/usr/bin/env python3
"""
Example usage of TradeMind AI Integration Module
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from services.prediction_service import get_stock_prediction, get_technical_analysis
from services.profiling_service import build_investor_profile
from services.recommendation_service import generate_recommendation
import json

def example_stock_prediction():
    """Example: Stock price prediction"""
    print("=" * 60)
    print("EXAMPLE 1: Stock Price Prediction")
    print("=" * 60)
    
    # Sample historical prices
    prices = [100, 102, 101, 105, 107, 106, 108, 110, 109, 112, 
              115, 114, 116, 118, 120, 119, 122, 125, 124, 127]
    
    # Get prediction using LSTM
    result = get_stock_prediction(prices, model_type='lstm')
    print(f"\nModel: {result.get('model_type')}")
    
    if result.get('error'):
        print(f"Note: {result.get('error')}")
    
    prediction = result.get('prediction', 0.0)
    confidence = result.get('confidence', 0.0)
    
    print(f"Prediction: ${prediction:.2f}")
    print(f"Confidence: {confidence:.2%}")
    
    # Get ensemble prediction
    ensemble = get_stock_prediction(prices, model_type='ensemble')
    ensemble_pred = ensemble.get('prediction', 0.0)
    print(f"\nEnsemble Prediction: ${ensemble_pred:.2f}")

def example_technical_analysis():
    """Example: Technical indicators"""
    print("\n" + "=" * 60)
    print("EXAMPLE 2: Technical Analysis")
    print("=" * 60)
    
    # Sample OHLC data
    data = {
        'close': [100, 102, 101, 105, 107, 106, 108, 110, 109, 112, 
                  115, 114, 116, 118, 120, 119, 122, 125, 124, 127, 130],
        'high': [102, 104, 103, 107, 109, 108, 110, 112, 111, 114, 
                 117, 116, 118, 120, 122, 121, 124, 127, 126, 129, 132],
        'low': [99, 101, 100, 104, 106, 105, 107, 109, 108, 111, 
                114, 113, 115, 117, 119, 118, 121, 124, 123, 126, 129]
    }
    
    indicators = get_technical_analysis(data)
    
    if indicators.get('error'):
        print(f"Error: {indicators.get('error')}")
    else:
        rsi = indicators.get('rsi')
        macd_val = indicators.get('macd', {}).get('macd')
        sma_20 = indicators.get('moving_averages', {}).get('sma_20')
        
        if rsi is not None:
            print(f"\nRSI: {rsi:.2f}")
        if macd_val is not None:
            print(f"MACD: {macd_val:.2f}")
        if sma_20 is not None:
            print(f"SMA(20): ${sma_20:.2f}")

def example_investor_profiling():
    """Example: Investor profile generation"""
    print("\n" + "=" * 60)
    print("EXAMPLE 3: Investor Profiling")
    print("=" * 60)
    
    # Sample user data
    user_data = {
        'trades_per_month': 15,
        'avg_position_size_pct': 12,
        'portfolio_value': 50000,
        'uses_leverage': False,
        'leverage_ratio': 1.0,
        'asset_classes': ['stocks', 'etfs'],
        'portfolio_volatility': 0.18,
        'max_drawdown_tolerance': 15,
        'age': 35,
        'experience_years': 5,
        'investment_horizon': 'medium',
        'win_rate': 0.55,
        'uses_stop_loss': True,
        'stop_loss_adherence': 0.85
    }
    
    result = build_investor_profile(user_data)
    
    if result['success']:
        profile = result['profile']
        print(f"\nProfile Type: {profile['profile_type']}")
        print(f"Risk Score: {profile['risk_score']}/100")
        print(f"Stability Score: {profile['stability_score']}/100")
        print(f"Discipline Score: {profile['discipline_score']}/100")
        print(f"\nRisk Tolerance: {profile['characteristics']['risk_tolerance']}")
        print(f"Recommended Allocation: {profile['characteristics']['recommended_allocation']}")

def example_portfolio_recommendation():
    """Example: Portfolio recommendation"""
    print("\n" + "=" * 60)
    print("EXAMPLE 4: Portfolio Recommendation")
    print("=" * 60)
    
    # User profile
    profile = {
        'profile_type': 'Moderate',
        'risk_score': 55,
        'characteristics': {
            'risk_tolerance': 'Medium',
            'recommended_allocation': {'stocks': 60, 'bonds': 30, 'cash': 10},
            'max_position_size': 10
        }
    }
    
    # Market data
    market_data = {
        'stocks': [
            {'symbol': 'AAPL', 'price': 150, 'volatility': 0.20, 'beta': 1.2, 'momentum': 0.15},
            {'symbol': 'MSFT', 'price': 300, 'volatility': 0.18, 'beta': 1.1, 'momentum': 0.12},
            {'symbol': 'GOOGL', 'price': 2800, 'volatility': 0.22, 'beta': 1.3, 'momentum': 0.18},
            {'symbol': 'JNJ', 'price': 160, 'volatility': 0.12, 'beta': 0.7, 'momentum': 0.05},
            {'symbol': 'PG', 'price': 140, 'volatility': 0.10, 'beta': 0.6, 'momentum': 0.03}
        ],
        'conditions': {
            'trend': 'bullish',
            'volatility': 'medium'
        }
    }
    
    result = generate_recommendation(profile, market_data, portfolio_value=50000)
    
    if result['success']:
        rec = result['recommendation']
        print(f"\nStrategy: {rec['strategy']['strategy_name']}")
        print(f"Approach: {rec['strategy']['approach']}")
        print(f"\nTop Stock Recommendations:")
        for stock in rec['selected_stocks'][:3]:
            print(f"  - {stock['symbol']}: Score {stock.get('recommendation_score', 0):.1f}")
        
        print(f"\nRecommended Actions:")
        for action in rec['action_plan']['recommended_actions']:
            print(f"  • {action}")

if __name__ == "__main__":
    print("\n" + "=" * 60)
    print("TradeMind AI - Example Usage")
    print("=" * 60)
    
    example_stock_prediction()
    example_technical_analysis()
    example_investor_profiling()
    example_portfolio_recommendation()
    
    print("\n" + "=" * 60)
    print("Examples completed successfully!")
    print("=" * 60 + "\n")
