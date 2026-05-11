import pandas as pd
import requests
import time

# ── Config ────────────────────────────────────────────────────────────────────
CSV_PATH = "backend/data/raw_power_data.csv"
API_URL  = "http://localhost:8000/api/data"
# ──────────────────────────────────────────────────────────────────────────────

def main():
    print(f"Reading data from {CSV_PATH}...")
    try:
        df = pd.read_csv(CSV_PATH)
    except FileNotFoundError:
        print("CSV file not found. Run generate_data.py first.")
        return

    unique_customers = df['customer_id'].unique()
    print(f"Found {len(df)} readings for {len(unique_customers)} unique customers.")
    
    # Sort by timestamp to simulate real-time data entry
    df['ts_dt'] = pd.to_datetime(df['timestamp'])
    df = df.sort_values('ts_dt')
    
    count = 0
    total = len(df)
    
    print(f"Pushing {total} records to API at {API_URL}...")
    
    # We'll push in chunks or sequentially. Sequential is safer for simple SQLite.
    for index, row in df.iterrows():
        payload = {
            "customer_id": int(row['customer_id']),
            "timestamp":   str(row['timestamp']),
            "voltage":     float(row['voltage']),
            "current":     float(row['current']),
            "power":       float(row['power'])
        }
        
        try:
            r = requests.post(API_URL, json=payload)
            if r.status_code == 200:
                count += 1
            else:
                print(f"Failed to push record {index}: {r.status_code}")
        except Exception as e:
            print(f"Error at record {index}: {e}")
            break
            
        if count % 100 == 0:
            print(f"Progress: {count}/{total} records pushed...")
            
    print(f"\n✅ Finished! Successfully pushed {count} records to the database.")
    print("Refresh your dashboard to see all customers.")

if __name__ == "__main__":
    main()
