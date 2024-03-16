import os
import requests
from faker import Faker

# Function to generate random string
fake = Faker()

# Base URL of the API endpoint
base_url = os.environ.get("BASE_URL", "http://localhost:5001/api")

# Generate 100 users
for _ in range(100):
    name = fake.name()
    email = name.replace(" ", "").lower() + "@example.com"

    payload = {
        "name": name,
        "email": email
    }

    response = requests.post(f"{base_url}/users", json=payload)

    if response.status_code == 200:
        print(f"User {name} with email {email} successfully created.")
    else:
        print(f"Failed to create user {name} with email {email}. Status code: {response.status_code}")

