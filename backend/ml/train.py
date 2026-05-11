import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier
from sklearn.metrics import classification_report, f1_score
import optuna
 
from backend.ml.features import add_features
 
# 1. Load raw data — must have columns: customer_id, timestamp, power, is_theft
df = pd.read_csv("backend/data/raw_power_data.csv")
df = add_features(df)
 
# 2. Aggregate to one row per customer
# We use 'last' for most values to represent the current state
df_agg = df.groupby("customer_id").agg(
    last_power=("power", "last"),
    power_mean_24h=("power_mean_24h", "last"),
    power_std_24h=("power_std_24h", "last"),
    power_min_24h=("power_min_24h", "last"),
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
 
# Calculate scale_pos_weight for imbalanced data
theft_count = (y == 1).sum()
normal_count = (y == 0).sum()
scale_weight = normal_count / theft_count if theft_count > 0 else 1
 
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)
 
# 3. Define Optuna objective for hyperparameter tuning
def objective(trial):
    params = {
        "n_estimators":  trial.suggest_int("n_estimators", 50, 300),
        "max_depth":     trial.suggest_int("max_depth", 3, 10),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3),
        "subsample":     trial.suggest_float("subsample", 0.6, 1.0),
        "scale_pos_weight": scale_weight,
        "eval_metric": "logloss",
        "random_state": 42,
    }
    m = XGBClassifier(**params)
    m.fit(X_train, y_train)
    preds = m.predict(X_test)
    return f1_score(y_test, preds)
 
# 4. Run optimization
study = optuna.create_study(direction="maximize")
study.optimize(objective, n_trials=30)
print("Best params:", study.best_params)
 
# 5. Train final model with best parameters
model = XGBClassifier(
    scale_pos_weight=scale_weight,
    eval_metric="logloss",
    random_state=42,
    **study.best_params,
)
 
model.fit(X_train, y_train)
 
# 6. Quick evaluation
y_pred = model.predict(X_test)
print("\nFinal Model Performance:")
print(classification_report(y_test, y_pred))
 
model_path = "backend/ml/model.pkl"
joblib.dump(model, model_path)
print(f"Model trained and saved as {model_path}")
