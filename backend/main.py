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

    allow_origins = ["http://localhost:5173"],
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
    return JSONResponse(df.reset_index().to_dict(orient="records"))

@app.get("/api/explain/{customer_id}")
def get_explanation(customer_id:int):
    explanation=explain_customer(customer_id)
    return explanation