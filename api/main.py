from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError

app = FastAPI(title="AAI Crime-Risk API", version="0.1.0")

class PredictionRequest(BaseModel):
    tract_fips: str
    forecast_horizon: int = 30

class PredictionResponse(BaseModel):
    violent_risk: float
    property_risk: float
    top_drivers: list[str]

def verify_token(token: str):
    # placeholder — replace with Cloudflare Access validation
    try:
        return jwt.decode(token, "dev-secret", algorithms=["HS256"])
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/predict/tract", response_model=PredictionResponse)
def predict(req: PredictionRequest, token=Depends(verify_token)):
    # TODO: load model, feature-engineering, inference
    return PredictionResponse(
        violent_risk=0.23,
        property_risk=0.41,
        top_drivers=["past_30d_violent", "pct_rented", "holiday_flag"],
    )
