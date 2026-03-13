import requests
import base64
import json

# Configuration
API_URL = "http://localhost:8000/api/payme/"
SECRET_KEY = "YOUR_PAYME_SECRET_KEY"  # Replace with actual secret key for testing

def test_payme_api():
    # Basic Auth header
    auth_str = f"Paycom:{SECRET_KEY}"
    encoded_auth = base64.b64encode(auth_str.encode()).decode()
    headers = {
        "Authorization": f"Basic {encoded_auth}",
        "Content-Type": "application/json"
    }

    # 1. CheckPerformTransaction
    payload = {
        "method": "CheckPerformTransaction",
        "params": {
            "amount": 1000000, # 10,000.00 sum in tiyin
            "account": {"order_id": "ABC12345"} # Replace with real order number
        },
        "id": 1
    }
    
    # print("Testing CheckPerformTransaction...")
    # response = requests.post(API_URL, json=payload, headers=headers)
    # print(response.json())

    # 2. CreateTransaction
    payload = {
        "method": "CreateTransaction",
        "params": {
            "id": "trans_123",
            "time": 1710300000000,
            "amount": 1000000,
            "account": {"order_id": "ABC12345"}
        },
        "id": 2
    }
    # print("\nTesting CreateTransaction...")
    # response = requests.post(API_URL, json=payload, headers=headers)
    # print(response.json())

    # 3. PerformTransaction
    payload = {
        "method": "PerformTransaction",
        "params": {
            "id": "trans_123"
        },
        "id": 3
    }
    # print("\nTesting PerformTransaction...")
    # response = requests.post(API_URL, json=payload, headers=headers)
    # print(response.json())

if __name__ == "__main__":
    print("Payme API Test Script Created. Update order_id and run against local server.")
