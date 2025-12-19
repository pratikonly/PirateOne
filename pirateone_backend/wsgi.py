import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

application = get_wsgi_application()
app = application  # ← This is what Vercel expects for WSGI (Flask/Django)
# Do NOT add "handler = application" — it triggers the issubclass error!