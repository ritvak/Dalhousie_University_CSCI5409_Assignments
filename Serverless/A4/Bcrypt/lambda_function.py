import bcrypt

def lambda_handler(event, context):
    try:
        value = event['value'].encode()
        salt = bcrypt.gensalt()
        hashed_value = bcrypt.hashpw(value, salt)
        response = {
            'action': 'bcrypt',
            'hashed_value': hashed_value.decode()  # Convert bytes to string for JSON serialization
        }
        return response
    except Exception as e:
        return {
            'error': str(e)
        }