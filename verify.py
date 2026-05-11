"""
verify.py  —  run this to test your entire system end to end
Place in project root. API must be running first:
    uvicorn backend.main:app --reload --port 8000

Then in a second terminal:
    python verify.py
"""

import requests
from datetime import datetime, timedelta
import sys

BASE = "http://localhost:8000"
PASS = "\033[92m PASS \033[0m"
FAIL = "\033[91m FAIL \033[0m"
WARN = "\033[93m WARN \033[0m"

def section(title):
    print(f"\n{'='*50}")
    print(f"  {title}")
    print(f"{'='*50}")

def check(label, condition, detail=""):
    status = PASS if condition else FAIL
    print(f"  [{status}] {label}")
    if detail:
        print(f"         {detail}")
    return condition

# ── Step 1: Check API is alive ───────────────────────────────────────────────
section("1. API health check")
try:
    r = requests.get(f"{BASE}/docs", timeout=5)
    check("API is reachable", r.status_code == 200,
          f"http://localhost:8000/docs returned {r.status_code}")
except Exception as e:
    print(f"  [{FAIL}] Cannot reach API — is it running?")
    print(f"         Run: uvicorn backend.main:app --reload --port 8000")
    print(f"         Error: {e}")
    sys.exit(1)

# ── Step 2: Send normal customer readings ────────────────────────────────────
section("2. Sending NORMAL customer readings (customer #101)")
print("  Sending 48 readings (2 days, stable household load)...")
errors = 0
for i in range(48):
    ts = (datetime.now() - timedelta(hours=i)).strftime("%Y-%m-%dT%H:%M:%S")
    hour = (datetime.now() - timedelta(hours=i)).hour
    # Realistic: higher load in morning (7-9am) and evening (6-9pm)
    if 7 <= hour <= 9:
        power = 3.2
    elif 18 <= hour <= 21:
        power = 4.1
    else:
        power = 1.8 + (i % 5) * 0.1   # slight natural variation
    r = requests.post(f"{BASE}/api/data", json={
        "customer_id": 101,
        "timestamp":   ts,
        "voltage":     229.5 + (i % 3) * 0.4,   # stable voltage
        "current":     power * 1000 / 230,
        "power":       round(power, 2),
    })
    if r.status_code != 200:
        errors += 1
check("All 48 normal readings sent", errors == 0,
      f"{errors} errors" if errors else "customer 101 saved to DB")

# ── Step 3: Send theft customer readings ─────────────────────────────────────
section("3. Sending THEFT customer readings (customer #102)")
print("  Sending 48 readings (flat, suspiciously low power)...")
errors = 0
for i in range(48):
    ts = (datetime.now() - timedelta(hours=i)).strftime("%Y-%m-%dT%H:%M:%S")
    r = requests.post(f"{BASE}/api/data", json={
        "customer_id": 102,
        "timestamp":   ts,
        "voltage":     214.0 + (i % 4) * 0.5,   # lower, noisier voltage
        "current":     0.9 + (i % 2) * 0.1,
        "power":       round(0.18 + (i % 3) * 0.02, 2),   # flat, very low
    })
    if r.status_code != 200:
        errors += 1
check("All 48 theft readings sent", errors == 0,
      f"{errors} errors" if errors else "customer 102 saved to DB")

# ── Step 4: Check predictions ────────────────────────────────────────────────
section("4. Checking predictions")
r = requests.get(f"{BASE}/api/customers")
check("Predictions endpoint responds", r.status_code == 200,
      f"HTTP {r.status_code}")

customers = r.json()
check("Got customer list", len(customers) > 0,
      f"Found {len(customers)} customer(s) with predictions")

print("\n  All customers and their predictions:")
print(f"  {'ID':>6}  {'is_theft':>10}  {'probability':>12}  {'verdict':>14}")
print(f"  {'-'*6}  {'-'*10}  {'-'*12}  {'-'*14}")

cust_map = {c["customer_id"]: c for c in customers}
for c in sorted(customers, key=lambda x: x["customer_id"]):
    verdict = "FLAGGED" if c["is_theft"] == 1 else "normal"
    bar = "█" * int(c["probability"] * 10)
    print(f"  {c['customer_id']:>6}  {str(c['is_theft']):>10}  "
          f"{c['probability']*100:>10.1f}%  {verdict:>14}  {bar}")

# Check our two test customers specifically
c101 = cust_map.get(101)
c102 = cust_map.get(102)

if c101:
    check("Customer 101 (normal) has low probability",
          c101["probability"] < 0.6,
          f"probability = {c101['probability']*100:.1f}% "
          f"({'OK - low risk' if c101['probability'] < 0.6 else 'WARN - model flagged normal customer'})")
else:
    print(f"  [{WARN}] Customer 101 not in predictions (need more data points)")

if c102:
    check("Customer 102 (theft) has high probability",
          c102["probability"] > 0.5,
          f"probability = {c102['probability']*100:.1f}% "
          f"({'OK - correctly flagged' if c102['probability'] > 0.5 else 'WARN - model missed theft customer'})")
else:
    print(f"  [{WARN}] Customer 102 not in predictions (need more data points)")

# ── Step 5: Check explanation ─────────────────────────────────────────────────
section("5. Checking SHAP explanation for customer 102")
r = requests.get(f"{BASE}/api/explain/102")
check("Explain endpoint responds", r.status_code == 200,
      f"HTTP {r.status_code}")

exp = r.json()
if "error" in exp:
    print(f"  [{FAIL}] Explanation error: {exp['error']}")
else:
    check("Has features list",    "features"     in exp, str(exp.get("features", [])))
    check("Has shap_values list", "shap_values"  in exp)
    check("Has probability",      "probability"  in exp,
          f"{exp.get('probability', 0)*100:.1f}%")
    check("Has is_theft flag",    "is_theft"     in exp,
          f"is_theft = {exp.get('is_theft')}")

    print("\n  SHAP feature breakdown for customer 102:")
    feats = exp.get("features", [])
    shapv = exp.get("shap_values", [])
    for f, s in zip(feats, shapv):
        direction = "→ theft" if s > 0 else "→ normal"
        bar = ("▲ " if s > 0 else "▼ ") + "█" * min(int(abs(s) * 5), 10)
        print(f"    {f:<22} {s:>+.4f}  {bar}  {direction}")

# ── Step 6: Summary ──────────────────────────────────────────────────────────
section("6. Summary")
print("  Your system is working if you see:")
print("  ✓ Customer 101 (normal)  — low probability (<60%)")
print("  ✓ Customer 102 (theft)   — high probability (>50%)")
print("  ✓ SHAP values show power_std_24h pushing toward theft")
print()
print("  Open your dashboard: http://localhost:5173")
print("  Open API docs:        http://localhost:8000/docs")
print()
print("  If customer 101 is being flagged as theft too,")
print("  it means your model needs more varied normal training data.")
print("  Re-run: python generate_data.py && python -m backend.ml.train")