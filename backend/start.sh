#!/bin/bash
set -e

echo "Running collectstatic..."
python manage.py collectstatic --noinput

echo "Running migrations..."
python manage.py migrate --noinput

echo "Starting server..."
exec gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000}
