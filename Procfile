# Procfile — works for Heroku, Railway, Fly.io and most PaaS hosts.
# `$PORT` is injected by the host. Frontend is built separately and served as static.
web: cd backend && uvicorn server:app --host 0.0.0.0 --port $PORT
