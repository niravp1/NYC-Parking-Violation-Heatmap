
#!/bin/sh
# Wait for Postgres
while ! nc -z db 5432; do
  echo "Waiting for Postgres..."
  sleep 1
done

# Start the backend
uvicorn backend.main:app --host 0.0.0.0 --port 8000