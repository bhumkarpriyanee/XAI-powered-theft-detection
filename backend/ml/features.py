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
    
    return df