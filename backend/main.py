from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.db import Base, engine, SessionLocal, MeterData
from fastapi.responses import JSONResponse

app = FastAPI(
    title = "Elecricity Theft XAI Backend",
    description = "Backend for theft detection + XAI dashboard."
)

app.add_middleware(
    CORSMiddleware,

    allow_origins = ["http://localhost:5173",
                     "https://your-dashboard.vercel.app",
                     ],
    allow_credentials = True,
    allow_methods = ["*"],

    allow_headers = ["*"],
)

@app.on_event("startup")
def startup():

    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

from backend.ml.predict import run_predictions
from backend.ml.explain import explain_customer

# Global settings (in-memory for demo)
SYSTEM_SETTINGS = {
    "detection_threshold": 0.5
}

@app.post("/api/data")
def receive_meter_data(
    data: dict,
    db: Session = Depends(get_db)
):
    record = MeterData(
        customer_id = data["customer_id"],
        timestamp = data["timestamp"],
        voltage = data["voltage"],
        current = data["current"],
        power = data["power"]
    )

    db.add(record)
    db.commit()

    return {"status":"ok"}

@app.get("/api/customers")
def get_customers():
    df = run_predictions()
    if not df.empty:
        # Assign mock zones based on customer_id
        df['zone'] = [f"Zone {(cid % 4) + 1}" for cid in df.index]
        # Re-apply threshold from settings
        df['is_theft'] = (df['probability'] >= SYSTEM_SETTINGS["detection_threshold"]).astype(int)
    return JSONResponse(df.reset_index().to_dict(orient="records"))

@app.get("/api/settings")
def get_settings():
    return SYSTEM_SETTINGS

@app.post("/api/settings")
def update_settings(settings: dict):
    if "detection_threshold" in settings:
        SYSTEM_SETTINGS["detection_threshold"] = float(settings["detection_threshold"])
    return {"status": "updated", "settings": SYSTEM_SETTINGS}

@app.get("/api/stats")
def get_stats():
    df = run_predictions()
    if df.empty:
        return {
            "total_customers": 0,
            "flagged_today": 0,
            "resolved_cases": 0,
            "average_risk": 0
        }
    
    total = int(len(df))
    # Apply global threshold for statistics consistency
    flagged = int((df['probability'] >= SYSTEM_SETTINGS["detection_threshold"]).sum())
    avg_risk = float(df['probability'].mean()) * 100
    
    return {
        "total_customers": total,
        "flagged_today": flagged,
        "resolved_cases": 12,  # Mock resolved cases
        "average_risk": round(avg_risk, 1)
    }

@app.get("/api/explain/{customer_id}")
def get_explanation(customer_id:int):
    explanation=explain_customer(customer_id)
    return explanation