import requests
import sys

BASE_URL = "http://localhost:8000"

def test_login():
    # 1. Register a test user
    email = "test_vortex@example.com"
    password = "password123"
    try:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json={
            "username": "vortex_tester",
            "email": email,
            "password": password,
            "role": "buyer"
        })
        if reg_res.status_code == 200:
            print("Registration: OK")
        elif reg_res.status_code == 400 and "already registered" in reg_res.text:
             print("Registration: User exists (OK)")
        else:
             print(f"Registration Failed: {reg_res.text}")
             return
    except Exception as e:
        print(f"Connection failed: {e}")
        return

    # 2. Try Login
    try:
        login_res = requests.post(f"{BASE_URL}/auth/login", json={
            "email": email,
            "password": password
        })
        
        if login_res.status_code == 200:
            print("LOGIN SUCCESS! Token received.")
            print(f"Response: {login_res.json().keys()}")
        else:
            print(f"LOGIN FAILED: {login_res.status_code} - {login_res.text}")
            
    except Exception as e:
         print(f"Login request failed: {e}")

if __name__ == "__main__":
    test_login()
