# Albany Aegis Initiative Site

## Overview
The Albany Aegis Initiative Site is a FastAPI application designed to provide crime risk predictions based on various input parameters. The application leverages Cloudflare Access for secure JWT validation and manages secrets through the Cloudflare Secrets Store.

## Features
- FastAPI framework for building APIs.
- JWT validation using Cloudflare Access.
- Prediction of violent and property crime risks.
- CI/CD integration with GitHub Actions.

## Setup Instructions

### Prerequisites
- Python 3.7 or higher
- Docker (for containerization)
- Cloudflare account for managing secrets and access

### Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/albany-aegis-initiative-site.git
   cd albany-aegis-initiative-site
   ```

2. Create a virtual environment and activate it:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   ```

3. Install the required dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Set up your environment variables:
   - Copy the `.env.example` to `.env` and fill in the necessary values.

### Running the Application
To run the FastAPI application locally, use:
```
uvicorn api.main:app --reload
```

### Docker
To build and run the application using Docker:
```
docker build -t aai-crime-risk-api .
docker run -p 8000:8000 aai-crime-risk-api
```

## Usage
Send a POST request to `/predict/tract` with the following JSON body:
```json
{
  "tract_fips": "12345",
  "forecast_horizon": 30
}
```

### Response
The response will include the predicted risks:
```json
{
  "violent_risk": 0.23,
  "property_risk": 0.41,
  "top_drivers": ["past_30d_violent", "pct_rented", "holiday_flag"]
}
```

## CI/CD
The project includes a GitHub Actions workflow for continuous integration. The workflow checks for TypeScript compilation errors before deployment.

## Security
Secrets are managed through Cloudflare Secrets Store. Ensure that the JWT secret key and Cloudflare Access AUD value are configured in `cloudflare/secrets_config.yaml`.

## Documentation
Further documentation on security key rotation and other configurations can be found in the `cloudflare/README.md` file.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.