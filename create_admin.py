import requests
import sys

BASE_URL = "http://localhost:8000"

def create_admin():
    email = "admin@vortex.com"
    password = "adminpassword"
    username = "admin"
    
    # 1. Register
    print(f"Creating admin user: {email} / {password}")
    try:
        reg_res = requests.post(f"{BASE_URL}/auth/register", json={
            "username": username,
            "email": email,
            "password": password,
            "role": "admin"
        })
        if reg_res.status_code == 200:
            print("Admin Registration: OK")
        elif reg_res.status_code == 400 and "already registered" in reg_res.text:
             print("Admin already exists. Trying to login to verify.")
        else:
             print(f"Admin Creation Failed: {reg_res.text}")
             return

    except Exception as e:
        print(f"Connection failed: {e}")

if __name__ == "__main__":
    create_admin()
