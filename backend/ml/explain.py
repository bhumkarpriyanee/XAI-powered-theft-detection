import shap
import joblib
import pandas as pd
from backend.db import engine
from backend.ml.features import add_features
 
# Load model at module level
model = joblib.load("backend/ml/model.pkl")
 
feature_cols = [
    "last_power",
    "power_mean_24h",
    "power_std_24h",
    "power_min_24h",
    "power_max_24h",
    "hour",
]
 
def explain_customer(customer_id: int) -> dict:
    # Read all meter data
    df = pd.read_sql("SELECT * FROM meter_data", engine)
    if df.empty:
        return {"error": "No data available"}
 
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
 
    if customer_id not in df_agg.index:
        return {"error": f"Customer {customer_id} not found"}
 
    X = df_agg[feature_cols]
 
    # SHAP explanation
    explainer = shap.TreeExplainer(model)
    shap_values = explainer.shap_values(X)
 
    idx = list(df_agg.index).index(customer_id)
 
    # Handle both binary (array) and multi-class (list) XGBoost outputs
    if isinstance(shap_values, list):
        customer_shap = shap_values[1][idx]
    else:
        customer_shap = shap_values[idx]
 
    # Prediction for this customer
    row = X.iloc[[idx]]
    is_theft = int(model.predict(row)[0])
    probability = float(model.predict_proba(row)[0][1])
 
    # FIXED: return features + shap_values as flat lists (not dicts)
    # so CustomerDetail.jsx Bar chart receives the right shape
    return {
        "customer_id": customer_id,
        "is_theft": is_theft,
        "probability": probability,
        "features": feature_cols,                          # list of strings → chart labels
        "shap_values": customer_shap.tolist(),             # list of floats  → chart data
        "feature_values": X.iloc[idx].tolist(),            # raw values for tooltip/debug
        "base_value": float(explainer.expected_value),
    }