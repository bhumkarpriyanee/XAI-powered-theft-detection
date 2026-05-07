import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report
 
from backend.ml.features import add_features
 
# Load raw data — must have columns: customer_id, timestamp, power, is_theft
df = pd.read_csv("backend/data/raw_power_data.csv")
 
df = add_features(df)
 
# Aggregate to one row per customer
df_agg = df.groupby("customer_id").agg(
    last_power=("power", "last"),
    power_mean_24h=("power_mean_24h", "last"),   # FIXED: was pulling wrong column
    power_std_24h=("power_std_24h", "last"),     # FIXED: was pulling wrong column
    power_min_24h=("power_min_24h", "last"),     # FIXED: was missing entirely
    power_max_24h=("power_max_24h", "last"),
    hour=("hour", "last"),
    is_theft=("is_theft", "last"),
).dropna()
 
feature_cols = [
    "last_power",
    "power_mean_24h",
    "power_std_24h",
    "power_min_24h",
    "power_max_24h",
    "hour",
]
 
X = df_agg[feature_cols]
y = df_agg["is_theft"]
 
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
 
model = XGBClassifier(
    n_estimators=150,
    max_depth=6,
    learning_rate=0.1,
    random_state=42,
    eval_metric="logloss",
)
 
model.fit(X_train, y_train)
 
# Quick evaluation
y_pred = model.predict(X_test)
print(classification_report(y_test, y_pred))
 
model_path = "backend/ml/model.pkl"
joblib.dump(model, model_path)
print(f"Model trained and saved as {model_path}")