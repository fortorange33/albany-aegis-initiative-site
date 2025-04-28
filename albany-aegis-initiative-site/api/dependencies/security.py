from jose import jwt, JWTError
import os
import httpx
from fastapi import HTTPException

JWK_URL = "https://YOUR_CLOUDFLARE_ACCOUNT.cloudflareaccess.com/cdn-cgi/access/certs"
CACHE = {}

def get_jwks():
    if "jwks" not in CACHE:
        response = httpx.get(JWK_URL)
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail="Failed to fetch JWKs")
        CACHE["jwks"] = response.json()
    return CACHE["jwks"]

def verify_token(token: str):
    secret_key = os.environ.get("JWT_SECRET_KEY")
    if not secret_key:
        raise Exception("JWT_SECRET_KEY not set")
    
    jwks = get_jwks()
    try:
        # Decode the JWT using the JWKs
        return jwt.decode(token, jwks, algorithms=["RS256"], options={"verify_aud": False})
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid credentials")