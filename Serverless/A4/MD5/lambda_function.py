import hashlib
import json

def lambda_handler(event, context):
    try:
        value = event['value']
        hashed_value = hashlib.md5(value.encode()).hexdigest()
        response = {
            'action': 'md5',
            'hashed_value': hashed_value
        }
        return response
    except Exception as e:
        return {
            'error': str(e)
        }