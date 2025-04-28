from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError
import os

app = FastAPI(title="AAI Crime-Risk API", version="0.1.0")

class PredictionRequest(BaseModel):
    tract_fips: str
    forecast_horizon: int = 30

class PredictionResponse(BaseModel):
    violent_risk: float
    property_risk: float
    top_drivers: list[str]

def verify_token(token: str):
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key:
        raise Exception("JWT_SECRET_KEY not set")
    try:
        return jwt.decode(token, secret_key, algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    # TODO: load model, feature-engineering, inference
    # Example implementation (replace with actual model loading and inference):
    # model = load_model("path/to/model.pkl")
    # features = engineer_features(req.tract_fips, req.forecast_horizon)
    # violent_risk, property_risk = model.predict(features)
    violent_risk = 0.5  # Replace with actual prediction
    property_risk = 0.7 # Replace with actual prediction
    # Example implementation (replace with actual model loading and inference):
    # model = load_model("path/to/model.pkl")
    # features = engineer_features(req.tract_fips, req.forecast_horizon)
    # violent_risk, property_risk = model.predict(features)
    violent_risk = 0.5  # Replace with actual prediction
    property_risk = 0.7 # Replace with actual prediction
    # Example implementation (replace with actual model loading and inference):
    # model = load_model("path/to/model.pkl")
    # features = engineer_features(req.tract_fips, req.forecast_horizon)
    # violent_risk, property_risk = model.predict(features)
    violent_risk = 0.5  # Replace with actual prediction
    property_risk = 0.7 # Replace with actual prediction
    # Example implementation (replace with actual model loading and inference):
    # model = load_model("path/to/model.pkl")
    # features = engineer_features(req.tract_fips, req.forecast_horizon)
    # violent_risk, property_risk = model.predict(features)
    violent_risk = 0.5  # Replace with actual prediction
    property_risk = 0.7 # Replace with actual prediction
@app.post("/predict/tract", response_model=PredictionResponse)
def predict(req: PredictionRequest, token=Depends(verify_token)):
    # TODO: load model, feature-engineering, inference
    return PredictionResponse(
        violent_risk=0.23,
        property_risk=0.41,
        top_drivers=["past_30d_violent", "pct_rented", "holiday_flag"],
    )
