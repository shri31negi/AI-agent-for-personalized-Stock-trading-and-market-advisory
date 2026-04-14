#!/usr/bin/env python3
"""
Quick test suite for TradeMind AI module
"""

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

def test_imports():
    """Test all imports work"""
    print("Testing imports...")
    try:
        from services.prediction_service import get_stock_prediction
        from services.profiling_service import build_investor_profile
        from services.recommendation_service import generate_recommendation
        print("✓ All imports successful")
        return True
    except Exception as e:
        print(f"✗ Import failed: {e}")
        return False

def test_prediction():
    """Test stock prediction"""
    print("\nTesting stock prediction...")
    try:
        from services.prediction_service import get_stock_prediction
        
        prices = [100, 102, 105, 107, 110]
        result = get_stock_prediction(prices, 'lstm')
        
        assert 'prediction' in result
        assert 'confidence' in result
        assert result['prediction'] > 0
        
        print(f"✓ Prediction: ${result['prediction']:.2f}, Confidence: {result['confidence']:.2%}")
        return True
    except Exception as e:
        print(f"✗ Prediction failed: {e}")
        return False

def test_profiling():
    """Test investor profiling"""
    print("\nTesting investor profiling...")
    try:
        from services.profiling_service import build_investor_profile
        
        user_data = {
            'trades_per_month': 10,
            'avg_position_size_pct': 15,
            'portfolio_value': 50000
        }
        
        result = build_investor_profile(user_data)
        
        assert result['success'] == True
        assert 'profile' in result
        assert 'profile_type' in result['profile']
        
        print(f"✓ Profile: {result['profile']['profile_type']}, Risk: {result['profile']['risk_score']}/100")
        return True
    except Exception as e:
        print(f"✗ Profiling failed: {e}")
        return False

def test_recommendation():
    """Test portfolio recommendation"""
    print("\nTesting portfolio recommendation...")
    try:
        from services.recommendation_service import generate_recommendation
        
        profile = {
            'profile_type': 'Moderate',
            'risk_score': 50,
            'characteristics': {
                'recommended_allocation': {'stocks': 60, 'bonds': 30, 'cash': 10},
                'max_position_size': 10
            }
        }
        
        market_data = {
            'stocks': [
                {'symbol': 'AAPL', 'price': 150, 'volatility': 0.2, 'beta': 1.2}
            ],
            'conditions': {'trend': 'neutral', 'volatility': 'medium'}
        }
        
        result = generate_recommendation(profile, market_data, 10000)
        
        assert result['success'] == True
        assert 'recommendation' in result
        
        print(f"✓ Recommendation generated successfully")
        return True
    except Exception as e:
        print(f"✗ Recommendation failed: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("="*60)
    print("TradeMind AI - Module Test Suite")
    print("="*60)
    
    tests = [
        test_imports,
        test_prediction,
        test_profiling,
        test_recommendation
    ]
    
    results = []
    for test in tests:
        results.append(test())
    
    print("\n" + "="*60)
    passed = sum(results)
    total = len(results)
    
    if passed == total:
        print(f"✓ All tests passed ({passed}/{total})")
        print("="*60)
        print("\nModule is ready to use!")
        return 0
    else:
        print(f"✗ Some tests failed ({passed}/{total} passed)")
        print("="*60)
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())
