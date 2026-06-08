# MIR Consulting — backend Dockerfile (FastAPI + Python 3.11).
# Use this for any container host: Fly.io, Railway, AWS ECS, GCP Cloud Run,
# DigitalOcean App Platform, or a plain VPS with `docker run`.
#
# Build:  docker build -t mir-consulting-api -f backend/Dockerfile backend
# Run:    docker run -p 8001:8001 --env-file backend/.env mir-consulting-api

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

# OS deps reportlab/pillow need at runtime
RUN apt-get update && apt-get install -y --no-install-recommends \
        libjpeg62-turbo zlib1g libfreetype6 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . .

EXPOSE 8001

# $PORT is injected on most PaaS; fall back to 8001 for local docker runs.
CMD ["sh", "-c", "uvicorn server:app --host 0.0.0.0 --port ${PORT:-8001}"]
