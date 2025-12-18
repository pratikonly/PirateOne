import os
import sys
from pathlib import Path

# Add the project directory to the path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

import django
from django.core.wsgi import get_wsgi_application

django.setup()
app = get_wsgi_application()

def handler(event, context):
    """Vercel serverless handler for Django"""
    from werkzeug.wrappers import Request, Response
    
    # Convert Vercel event to WSGI environ
    environ = {
        'REQUEST_METHOD': event.get('httpMethod', 'GET'),
        'SCRIPT_NAME': '',
        'PATH_INFO': event.get('path', '/'),
        'QUERY_STRING': event.get('queryStringParameters', '') or '',
        'CONTENT_TYPE': event.get('headers', {}).get('content-type', ''),
        'CONTENT_LENGTH': event.get('headers', {}).get('content-length', '0'),
        'SERVER_NAME': event.get('headers', {}).get('host', 'localhost'),
        'SERVER_PORT': '443',
        'SERVER_PROTOCOL': 'HTTP/1.1',
        'wsgi.version': (1, 0),
        'wsgi.url_scheme': 'https',
        'wsgi.input': None,
        'wsgi.errors': sys.stderr,
        'wsgi.multithread': True,
        'wsgi.multiprocess': False,
        'wsgi.run_once': False,
    }
    
    # Add headers
    for key, value in event.get('headers', {}).items():
        key = key.upper().replace('-', '_')
        if key not in ('CONTENT_TYPE', 'CONTENT_LENGTH'):
            environ[f'HTTP_{key}'] = value
    
    # Call Django WSGI app
    response_data = []
    response_status = None
    response_headers = {}
    
    def start_response(status, headers, exc_info=None):
        nonlocal response_status, response_headers
        response_status = int(status.split()[0])
        response_headers = dict(headers)
        return lambda s: response_data.append(s)
    
    app_iter = app(environ, start_response)
    try:
        for data in app_iter:
            response_data.append(data)
    finally:
        if hasattr(app_iter, 'close'):
            app_iter.close()
    
    # Format response for Vercel
    body = b''.join(response_data).decode('utf-8', errors='replace')
    
    return {
        'statusCode': response_status or 200,
        'headers': response_headers,
        'body': body,
    }
