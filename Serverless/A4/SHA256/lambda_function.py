import hashlib
import json

def lambda_handler(event, context):
    try:
        value = event['value']
        hashed_value = hashlib.sha256(value.encode()).hexdigest()
        response = {
            'action': 'sha256',
            'hashed_value': hashed_value
        }
        return response
    except Exception as e:
        return {
            'error': str(e)
        }