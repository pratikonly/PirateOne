import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

application = get_wsgi_application()

# Vercel now requires one of these two
handler = application   # This satisfies Vercel's detection
# app = application    # You can use this instead if you prefer