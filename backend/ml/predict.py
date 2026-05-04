import pandas as pd
import joblib
from backend.db import engine
from backend.ml.features import add_features

# Load model at module level
model = joblib.load("backend/ml/model.pkl")

def run_predictions() -> pd.DataFrame:
    # Read data from database
    df = pd.read_sql("SELECT * FROM meter_data", engine)
    
    if df.empty:
        return pd.DataFrame()

    # Add features
    df = add_features(df)

    # Aggregate to customer level
    df_agg = df.groupby("customer_id").agg(
        last_power=("power", "last"),
        power_mean_24h=("power_mean_24h", "last"),
        power_std_24h=("power_std_24h", "last"),
        power_min_24h=("power_min_24h", "last"),
        power_max_24h=("power_max_24h", "last"),
        hour=("hour", "last"),
    ).dropna()
    
    if df_agg.empty:
        return pd.DataFrame()

    feature_cols = [
        "last_power",
        "power_mean_24h",
        "power_std_24h",
        "power_min_24h",
        "power_max_24h",
        "hour"
    ]
    
    # Predict
    X = df_agg[feature_cols]
    df_agg["prediction"] = model.predict(X)
    df_agg["probability"] = model.predict_proba(X)[:, 1]

    return df_agg
