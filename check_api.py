import requests
import json

try:
    res = requests.get("http://localhost:8000/api/customers")
    data = res.json()
    print(f"Total customers returned: {len(data)}")
    theft_count = sum(1 for c in data if c['is_theft'] == 1)
    normal_count = sum(1 for c in data if c['is_theft'] == 0)
    print(f"Theft: {theft_count}, Normal: {normal_count}")
    if len(data) > 0:
        print("First 2 samples:")
        print(json.dumps(data[:2], indent=2))
except Exception as e:
    print(f"Error: {e}")
