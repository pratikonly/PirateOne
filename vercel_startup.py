import os
import django
from django.core.management import call_command

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "pirateone_backend.settings")
django.setup()

call_command("collectstatic", interactive=False, verbosity=0)
