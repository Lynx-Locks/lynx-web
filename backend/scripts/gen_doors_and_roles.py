import os
import random
import requests
import json

base_url = os.environ.get("BASE_URL", "http://localhost:5001/api")

door_names = ["Demo Door", "Front Office", "Back Office", "Patio", "IT Room", "Conference Room"]
door_descs = ["The door in front of you", "Main entrance", "Back entrance", "Outside", "Where the IT magic happens", "Where meetings happen"]
doors = []


for i in range(len(door_names)):
    payload = {
        "name": door_names[i],
        "description": door_descs[i]
    }

    response = requests.post(f"{base_url}/doors", json=payload)

    data = json.loads(response.content)
    doors.append(data["id"])

    if response.status_code == 200:
        print(f"Door {door_names[i]} successfully created.")
    else:
        print(f"Failed to create door {door_names[i]}. Status code: {response.status_code}")


roles = [
    "Admin",
    "Security",
    "CEO",
    "Staff",
    "Janitor",
    "Delivery",
    "IT Specialist",
    "Human Resources",
    "Marketing Manager",
    "Accountant",
    "Customer Service",
    "Project Manager",
]

# Function to generate random door IDs
def generate_door_ids():
    ids = random.sample(doors, random.randint(1, 4))  # Random number of doors (1-4)
    return [
        {"id": door_id}
        for door_id in ids
    ]

formatted_roles = [{"name": role, "doors": generate_door_ids()} for role in roles]

for role in formatted_roles:
    response = requests.post(f"{base_url}/roles", json=role)

    data = json.loads(response.content)

    if response.status_code == 200:
        print(f"Role {role} successfully created.")
    else:
        print(f"Failed to create role {role}. Status code: {response.status_code}")