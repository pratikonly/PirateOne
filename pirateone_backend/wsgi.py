import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

import vercel_startup  # noqa

application = get_wsgi_application()
app = application  