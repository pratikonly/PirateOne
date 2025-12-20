#!/bin/bash
set -e

echo "=== Starting build.sh ==="

echo "=== Installing dependencies ==="
pip install -r requirements.txt

echo "=== Running migrations ==="
python manage.py migrate --noinput

echo "=== Running collectstatic with verbosity ==="
python manage.py collectstatic --noinput --clear --verbosity 3

echo "=== build.sh completed successfully ==="