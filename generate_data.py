import os
import numpy as np
import pandas as pd
 
# ── Config ────────────────────────────────────────────────────────────────────
N_NORMAL    = 40          # normal customers
N_THEFT     = 10          # theft customers
DAYS        = 30          # days of history per customer
FREQ        = "1h"        # one reading per hour  →  24 readings/day
RANDOM_SEED = 42
OUTPUT_PATH = "backend/data/raw_power_data.csv"
# ──────────────────────────────────────────────────────────────────────────────
 
rng = np.random.default_rng(RANDOM_SEED)
 
def normal_customer(customer_id: int, timestamps: pd.DatetimeIndex) -> pd.DataFrame:
    """Realistic household: higher load in morning + evening, stable voltage."""
    n = len(timestamps)
    hour = timestamps.hour
 
    # Base load shaped by time of day
    base = (
        2.0                                          # always-on appliances
        + 1.5 * np.exp(-((hour - 7) ** 2) / 8)     # morning peak  ~07:00
        + 2.0 * np.exp(-((hour - 19) ** 2) / 8)    # evening peak  ~19:00
    )
    noise   = rng.normal(0, 0.15, n)
    power   = np.clip(base + noise, 0.3, 8.0)       # kW
 
    voltage = rng.normal(230, 3, n)                  # V  (stable)
    current = power * 1000 / voltage                 # I = P / V
 
    return pd.DataFrame({
        "customer_id": customer_id,
        "timestamp":   timestamps,
        "voltage":     voltage.round(2),
        "current":     current.round(3),
        "power":       power.round(3),
        "is_theft":    0,
    })
 
 
def theft_customer(customer_id: int, timestamps: pd.DatetimeIndex) -> pd.DataFrame:
    """
    Theft pattern: unusually LOW or FLAT power draw despite voltage present.
    Meter is bypassed / tampered → reported power << actual consumption.
    Also adds occasional voltage dips (meter bypass side-effect).
    """
    n = len(timestamps)
    hour = timestamps.hour
 
    # Flat, suppressed power (meter under-reports)
    base  = rng.uniform(0.1, 0.6, n)                # suspiciously low
    spike = rng.choice([0, 1], size=n, p=[0.85, 0.15])  # occasional spikes
    power = np.clip(base + spike * rng.uniform(0.5, 1.5, n), 0.05, 3.0)
 
    # Voltage dips due to illegal tap
    voltage = rng.normal(218, 8, n)                  # lower + noisier
    current = power * 1000 / np.clip(voltage, 180, 260)
 
    return pd.DataFrame({
        "customer_id": customer_id,
        "timestamp":   timestamps,
        "voltage":     voltage.round(2),
        "current":     current.round(3),
        "power":       power.round(3),
        "is_theft":    1,
    })
 
 
def main():
    os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
 
    end   = pd.Timestamp("2024-06-30")
    start = end - pd.Timedelta(days=DAYS)
    timestamps = pd.date_range(start, end, freq=FREQ)
 
    frames = []
 
    for cid in range(1, N_NORMAL + 1):
        frames.append(normal_customer(cid, timestamps))
 
    for cid in range(N_NORMAL + 1, N_NORMAL + N_THEFT + 1):
        frames.append(theft_customer(cid, timestamps))
 
    df = pd.concat(frames, ignore_index=True)
 
    # Shuffle rows so customers aren't grouped
    df = df.sample(frac=1, random_state=RANDOM_SEED).reset_index(drop=True)
 
    df.to_csv(OUTPUT_PATH, index=False)
 
    # ── Summary ───────────────────────────────────────────────────────────────
    print(f"✅  Saved {len(df):,} rows → {OUTPUT_PATH}")
    print(f"    Customers : {df['customer_id'].nunique()} total")
    print(f"    Normal    : {N_NORMAL}  (is_theft=0)")
    print(f"    Theft     : {N_THEFT}   (is_theft=1)")
    print(f"    Date range: {timestamps[0].date()} → {timestamps[-1].date()}")
    print(f"    Readings  : {len(timestamps)} per customer ({DAYS} days × 24 h)")
    print()
    print("Next steps:")
    print("  1.  python -m backend.ml.train")
    print("  2.  uvicorn backend.main:app --reload --port 8000")
    print("  3.  cd Dashboard && npm run dev")
 
 
if __name__ == "__main__":
    main()