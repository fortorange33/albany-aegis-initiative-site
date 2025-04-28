# Cloudflare Configuration and Secrets Management

This directory contains configurations and documentation related to managing secrets for the FastAPI application using Cloudflare.

## Secrets Configuration

The `secrets_config.yaml` file is used to define the secrets required for the application, including the JWT secret key and Cloudflare Access AUD value. Ensure that this file is properly configured before deploying the application.

## JWT Validation

The application uses Cloudflare Access for JWT validation. The `verify_token` function in the FastAPI application fetches JWKs and caches them for efficient token validation. This enhances security by ensuring that tokens are validated against the correct keys.

## Environment Variables

For local development, use the `.env.example` file as a template to create a `.env` file. This file should contain the necessary environment variables, including those for Cloudflare Secrets Store.

## Security Key Rotation

It is important to regularly rotate your security keys. Documentation for the key rotation process will be added here in the future. Please ensure that you follow best practices for managing and rotating your secrets.

## Deployment

Before deploying the application, ensure that all configurations are set correctly and that the CI checks pass. This includes verifying that TypeScript compiles without errors and that all dependencies are correctly installed.

For any questions or issues related to Cloudflare configuration, please refer to the official Cloudflare documentation or reach out to the development team.