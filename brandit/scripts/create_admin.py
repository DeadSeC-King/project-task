import requests
import os
from dotenv import load_dotenv

load_dotenv('/app/backend/.env')

BACKEND_URL = "https://tradable-goods.preview.emergentagent.com"
API = f"{BACKEND_URL}/api"

admin_data = {
    "email": "admin@brandit.com",
    "password": "admin123",
    "name": "Brand IT Admin"
}

def create_admin():
    print("Creating admin user...")
    try:
        response = requests.post(f"{API}/admin/register", json=admin_data)
        if response.status_code == 200:
            print("✓ Admin created successfully!")
            print(f"  Email: {admin_data['email']}")
            print(f"  Password: {admin_data['password']}")
        else:
            print(f"✗ Failed: {response.text}")
    except Exception as e:
        print(f"✗ Error: {str(e)}")

if __name__ == "__main__":
    create_admin()
