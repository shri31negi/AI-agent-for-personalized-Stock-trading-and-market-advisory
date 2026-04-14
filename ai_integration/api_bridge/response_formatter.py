import json
from datetime import datetime

def format_success_response(data, message="Success"):
    """Format successful API response"""
    return {
        'status': 'success',
        'message': message,
        'data': data,
        'timestamp': datetime.now().isoformat()
    }

def format_error_response(error, code=400):
    """Format error API response"""
    return {
        'status': 'error',
        'error': str(error),
        'code': code,
        'timestamp': datetime.now().isoformat()
    }

def format_prediction_response(prediction):
    """Format prediction response"""
    return format_success_response({
        'prediction': prediction.get('prediction'),
        'confidence': prediction.get('confidence'),
        'model_type': prediction.get('model_type'),
        'details': prediction.get('details', {})
    }, "Prediction generated successfully")

def format_profile_response(profile):
    """Format profile response"""
    return format_success_response({
        'profile': profile
    }, "Profile generated successfully")

def format_recommendation_response(recommendation):
    """Format recommendation response"""
    return format_success_response({
        'recommendation': recommendation
    }, "Recommendation generated successfully")

def to_json(response):
    """Convert response to JSON string"""
    return json.dumps(response, indent=2)
