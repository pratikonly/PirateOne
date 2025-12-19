"""
WSGI config for pirateone_backend project.

It exposes the WSGI callable as variables named ``application``, ``app``, and ``handler``
so that Vercel can find it.
"""

import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

application = get_wsgi_application()
app = application          # Vercel looks for 'app' or 'handler'
handler = application      # Some configurations prefer 'handler'