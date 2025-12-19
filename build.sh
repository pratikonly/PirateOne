#!/bin/bash
set -e

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating admin superuser..."
python manage.py shell << 'END'
from django.contrib.auth import get_user_model
User = get_user_model()

if not User.objects.filter(username='admin').exists():
    User.objects.create_superuser(
        username='admin',
        email='admin@cineverse.com',
        password='admin123'
    )
    print("Admin superuser created successfully!")
else:
    print("Admin superuser already exists!")
END

echo "Collecting static files..."
python manage.py collectstatic --noinput --clear

echo "Build completed!"
