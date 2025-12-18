#!/bin/bash
set -e

echo "Running Django migrations..."
python manage.py migrate --no-input

echo "Creating admin superuser..."
python manage.py shell << END
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
python manage.py collectstatic --no-input --clear

echo "Build completed successfully!"
