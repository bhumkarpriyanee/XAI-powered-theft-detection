import pandas as pd

from datetime import datetime

def add_features(df: pd.DataFrame) -> pd.DataFrame:
    df["ts"] = pd.to_datetime(df["timestamp"])

    df["hour"] = df["ts"].dt.hour

    df["dayofweek"] = df["ts"].dt.dayofweek

    df.sort_values(["customer_id","ts"],inplace=True)

    for window in [12, 24, 48]:
        df[f"power_mean_{window}h"] = df.groupby("customer_id")["power"].transform(
            lambda x: x.rolling(window, min_periods=1).mean()
        )

    df["power_std_24h"] = df.groupby("customer_id")["power"].transform(
        lambda x: x.rolling(24, min_periods=3).std()
    )

    df["power_min_24h"] = df.groupby("customer_id")["power"].transform(
        lambda x: x.rolling(24, min_periods=3).min()
    )

    df["power_max_24h"] = df.groupby("customer_id")["power"].transform(
        lambda x: x.rolling(24, min_periods=3).max()
    )

    df["voltage_mean_24h"] = df.groupby("customer_id")["voltage"].transform(
        lambda x: x.rolling(24, min_periods=3).mean()
    )
    df["voltage_std_24h"] = df.groupby("customer_id")["voltage"].transform(
        lambda x: x.rolling(24, min_periods=3).std()
    )

    # NEW: power factor proxy (theft often causes mismatch)
    df["power_per_volt"] = df["power"] / df["voltage"].clip(lower=1)

    # NEW: ratio of current hour to customer's own average (relative usage)
    df["power_ratio"] = df["power"] / df.groupby("customer_id")["power"].transform("mean").clip(lower=0.01)
    
    return df