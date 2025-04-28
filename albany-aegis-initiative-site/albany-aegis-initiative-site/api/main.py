from fastapi import FastAPI, Depends, HTTPException
from pydantic import BaseModel
from jose import jwt, JWTError
import os
import httpx
import asyncio
from cachetools import TTLCache

app = FastAPI(title="AAI Crime-Risk API", version="0.1.0")

class PredictionRequest(BaseModel):
    tract_fips: str
    forecast_horizon: int = 30

class PredictionResponse(BaseModel):
    violent_risk: float
    property_risk: float
    top_drivers: list[str]

# Cache for JWKs
jwk_cache = TTLCache(maxsize=100, ttl=3600)

async def fetch_jwks():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://your-cloudflare-access-domain/.well-known/jwks.json")
        response.raise_for_status()
        return response.json()

async def get_jwks():
    if "jwks" not in jwk_cache:
        jwk_cache["jwks"] = await fetch_jwks()
    return jwk_cache["jwks"]

async def verify_token(token: str):
    jwks = await get_jwks()
    try:
        # Decode the JWT using the JWKs
        return jwt.decode(token, jwks, algorithms=["RS256"], options={"verify_aud": False})
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/predict/tract", response_model=PredictionResponse)
async def predict(req: PredictionRequest, token=Depends(verify_token)):
    # TODO: load model, feature-engineering, inference
    return PredictionResponse(
        violent_risk=0.23,
        property_risk=0.41,
        top_drivers=["past_30d_violent", "pct_rented", "holiday_flag"],
    )