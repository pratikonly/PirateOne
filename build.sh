#!/bin/bash
set -e

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Running migrations ==="
python manage.py migrate --noinput

echo "=== Collecting static files (detailed output) ==="
python manage.py collectstatic --noinput --clear --verbosity 3

echo "=== Build completed successfully ==="