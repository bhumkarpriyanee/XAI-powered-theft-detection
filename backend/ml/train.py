import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier

from backend.ml.features import add_features

df = pd.read_csv("backend/data/raw_power_data.csv")

df = add_features(df)

df_agg = df.groupby("customer_id").agg(last_power = ("power","last"),
                                       power_mean_24h = ("power_std_24h","last"),
                                       power_std_24h = ("power_min_24h","last"),
                                       power_max_24h = ("power_max_24h","last"),
                                       hour = ("hour","last"),
                                       is_theft = ("is_theft","last")
                                       ).dropna()

X = df_agg[[
    "last_power",
    "power_mean_24h",
    "power_std_24h",
    "power_min_24h",
    "power_max_24h",
    "hour"
]]
y = df_agg["is_theft"]

X_train, X_test, y_train, y_test = train_test_split(X,y,test_size=0.2, random_state=42)

model = XGBClassifier(
    n_estimators = 150,
    max_depth = 6,
    learning_rate = 0.1,
    random_state = 42
)

model.fit(X_train, y_train)

model_path = "backend/ml/model.pkl"
joblib.dump(model, model_path)
print(f"Model trained and saved as {model_path}")