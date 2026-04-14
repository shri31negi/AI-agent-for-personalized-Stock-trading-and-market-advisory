#!/usr/bin/env python3
"""
TradeMind AI - Flask API Server
Simple HTTP API for Node.js backend integration
"""

try:
    from flask import Flask, request, jsonify
    from flask_cors import CORS
    FLASK_AVAILABLE = True
except ImportError:
    FLASK_AVAILABLE = False
    print("Flask not installed. Install with: pip install flask flask-cors")

import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent))

from services.prediction_service import get_stock_prediction, get_technical_analysis
from services.profiling_service import build_investor_profile, update_profile
from services.recommendation_service import generate_recommendation, get_rebalancing_advice
from api_bridge.response_formatter import format_success_response, format_error_response
from utils.logger import setup_logger

# Initialize logger
logger = setup_logger('api_server')

if FLASK_AVAILABLE:
    app = Flask(__name__)
    CORS(app)  # Enable CORS for frontend access

    @app.route('/health', methods=['GET'])
    def health_check():
        """Health check endpoint"""
        return jsonify({
            'status': 'healthy',
            'service': 'TradeMind AI',
            'version': '1.0.0'
        })

    @app.route('/api/predict', methods=['POST'])
    def predict():
        """Stock prediction endpoint"""
        try:
            data = request.json
            
            if not data or 'prices' not in data:
                return jsonify(format_error_response('Missing prices data', 400)), 400
            
            prices = data['prices']
            model_type = data.get('model_type', 'lstm')
            
            result = get_stock_prediction(prices, model_type)
            
            logger.info(f"Prediction request: {len(prices)} prices, model: {model_type}")
            
            return jsonify(format_success_response(result, "Prediction generated"))
        
        except Exception as e:
            logger.error(f"Prediction error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.route('/api/technical-analysis', methods=['POST'])
    def technical_analysis():
        """Technical analysis endpoint"""
        try:
            data = request.json
            
            if not data:
                return jsonify(format_error_response('Missing data', 400)), 400
            
            indicators = get_technical_analysis(data)
            
            return jsonify(format_success_response(indicators, "Technical analysis complete"))
        
        except Exception as e:
            logger.error(f"Technical analysis error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.route('/api/profile', methods=['POST'])
    def create_profile():
        """Create investor profile endpoint"""
        try:
            data = request.json
            
            required_fields = ['trades_per_month', 'avg_position_size_pct', 'portfolio_value']
            if not all(field in data for field in required_fields):
                return jsonify(format_error_response(f'Missing required fields: {required_fields}', 400)), 400
            
            result = build_investor_profile(data)
            
            if result['success']:
                logger.info(f"Profile created: {result['profile']['profile_type']}")
                return jsonify(format_success_response(result['profile'], "Profile created"))
            else:
                return jsonify(format_error_response(result.get('error', 'Profile creation failed'), 500)), 500
        
        except Exception as e:
            logger.error(f"Profile creation error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.route('/api/profile/update', methods=['PUT'])
    def update_user_profile():
        """Update investor profile endpoint"""
        try:
            data = request.json
            
            if 'current_profile' not in data or 'new_data' not in data:
                return jsonify(format_error_response('Missing current_profile or new_data', 400)), 400
            
            result = update_profile(data['current_profile'], data['new_data'])
            
            if result['success']:
                return jsonify(format_success_response(result, "Profile updated"))
            else:
                return jsonify(format_error_response(result.get('error', 'Update failed'), 500)), 500
        
        except Exception as e:
            logger.error(f"Profile update error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.route('/api/recommend', methods=['POST'])
    def recommend():
        """Portfolio recommendation endpoint"""
        try:
            data = request.json
            
            if 'profile' not in data or 'market_data' not in data:
                return jsonify(format_error_response('Missing profile or market_data', 400)), 400
            
            profile = data['profile']
            market_data = data['market_data']
            portfolio_value = data.get('portfolio_value', 10000)
            
            result = generate_recommendation(profile, market_data, portfolio_value)
            
            if result['success']:
                logger.info(f"Recommendation generated for {profile.get('profile_type')}")
                return jsonify(format_success_response(result['recommendation'], "Recommendation generated"))
            else:
                return jsonify(format_error_response(result.get('error', 'Recommendation failed'), 500)), 500
        
        except Exception as e:
            logger.error(f"Recommendation error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.route('/api/rebalance', methods=['POST'])
    def rebalance():
        """Portfolio rebalancing endpoint"""
        try:
            data = request.json
            
            required = ['current_portfolio', 'target_profile', 'portfolio_value']
            if not all(field in data for field in required):
                return jsonify(format_error_response(f'Missing required fields: {required}', 400)), 400
            
            result = get_rebalancing_advice(
                data['current_portfolio'],
                data['target_profile'],
                data['portfolio_value']
            )
            
            if result['success']:
                return jsonify(format_success_response(result, "Rebalancing advice generated"))
            else:
                return jsonify(format_error_response(result.get('error', 'Rebalancing failed'), 500)), 500
        
        except Exception as e:
            logger.error(f"Rebalancing error: {e}")
            return jsonify(format_error_response(str(e), 500)), 500

    @app.errorhandler(404)
    def not_found(error):
        return jsonify(format_error_response('Endpoint not found', 404)), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify(format_error_response('Internal server error', 500)), 500

    if __name__ == '__main__':
        print("="*60)
        print("TradeMind AI - API Server")
        print("="*60)
        print("\nAvailable endpoints:")
        print("  GET  /health                  - Health check")
        print("  POST /api/predict             - Stock prediction")
        print("  POST /api/technical-analysis  - Technical indicators")
        print("  POST /api/profile             - Create investor profile")
        print("  PUT  /api/profile/update      - Update profile")
        print("  POST /api/recommend           - Portfolio recommendation")
        print("  POST /api/rebalance           - Rebalancing advice")
        print("\nStarting server on http://localhost:5000")
        print("="*60 + "\n")
        
        app.run(host='0.0.0.0', port=5000, debug=True)
else:
    print("Flask is not installed. Install with:")
    print("  pip install flask flask-cors")
