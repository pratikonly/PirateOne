#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Preparing Vercel static output..."
mkdir -p collected_static
cp -r staticfiles/* collected_static/
cp -r css/* collected_static/css/ 2>/dev/null || true
cp -r js/* collected_static/js/ 2>/dev/null || true

echo "Build completed!"
