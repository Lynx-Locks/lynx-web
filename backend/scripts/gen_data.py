import requests
from faker import Faker
import json
# Function to generate random string
fake = Faker()

# Base URL of the API endpoint
base_url = "http://localhost:5001/api"

# Generate and send 100 users
for _ in range(100):
    name = fake.name()
    email = fake.email()

    payload = {
        "name": name,
        "email": email
    }

    response = requests.post(f"{base_url}/users", json=payload)

    if response.status_code == 200:
        print(f"User {name} with email {email} successfully created.")
    else:
        print(f"Failed to create user {name} with email {email}. Status code: {response.status_code}")

door_names = ["a", "b", "c", "d"]
doors = []

for door_name in door_names:
    payload = {
        "name": door_name,
        "description": f"Door {door_name}"
    }

    response = requests.post(f"{base_url}/doors", json=payload)

    data = json.loads(response.content)
    doors.append(data["id"])

    if response.status_code == 200:
        print(f"Door {door_name} successfully created.")
    else:
        print(f"Failed to create door {door_name}. Status code: {response.status_code}")

roles = [
    "Security",
    "CEO",
    "Janitor",
    "Delivery",
    "IT Specialist",
    "Human Resources",
    "Marketing Manager",
    "Accountant",
    "Customer Service",
    "Project Manager",
]

for role in roles:
    payload = {
        "name": role,
    }
    response = requests.post(f"{base_url}/roles", json=payload)

    data = json.loads(response.content)

    if response.status_code == 200:
        print(f"Role {role} successfully created.")
    else:
        print(f"Failed to create role {role}. Status code: {response.status_code}")
    
    # TODO: add role to doors
    
