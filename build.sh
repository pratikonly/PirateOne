#!/bin/bash
set -e

echo "Running Django migrations..."
python manage.py migrate --no-input

echo "Collecting static files..."
python manage.py collectstatic --no-input --clear

echo "Build completed successfully!"
