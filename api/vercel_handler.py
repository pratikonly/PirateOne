import os
import sys
from pathlib import Path
from http.server import BaseHTTPRequestHandler
from io import BytesIO

# Add the project directory to the path
BASE_DIR = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(BASE_DIR))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'pirateone_backend.settings')

import django
from django.core.wsgi import get_wsgi_application

django.setup()
app = get_wsgi_application()


class Handler(BaseHTTPRequestHandler):
    """Vercel handler for Django WSGI application"""
    
    def do_GET(self):
        self.handle_request('GET')
    
    def do_POST(self):
        self.handle_request('POST')
    
    def do_PUT(self):
        self.handle_request('PUT')
    
    def do_DELETE(self):
        self.handle_request('DELETE')
    
    def do_PATCH(self):
        self.handle_request('PATCH')
    
    def do_HEAD(self):
        self.handle_request('HEAD')
    
    def do_OPTIONS(self):
        self.handle_request('OPTIONS')
    
    def handle_request(self, method):
        """Handle incoming request and pass to Django WSGI"""
        # Build environ dict
        environ = {
            'REQUEST_METHOD': method,
            'SCRIPT_NAME': '',
            'PATH_INFO': self.path.split('?')[0],
            'QUERY_STRING': self.path.split('?')[1] if '?' in self.path else '',
            'CONTENT_TYPE': self.headers.get('content-type', ''),
            'CONTENT_LENGTH': self.headers.get('content-length', '0'),
            'SERVER_NAME': self.headers.get('host', 'localhost').split(':')[0],
            'SERVER_PORT': self.headers.get('host', 'localhost').split(':')[1] if ':' in self.headers.get('host', '') else '80',
            'SERVER_PROTOCOL': 'HTTP/1.1',
            'wsgi.version': (1, 0),
            'wsgi.url_scheme': 'https',
            'wsgi.input': BytesIO(),
            'wsgi.errors': sys.stderr,
            'wsgi.multithread': True,
            'wsgi.multiprocess': False,
            'wsgi.run_once': False,
        }
        
        # Add headers to environ
        for header, value in self.headers.items():
            header_key = f'HTTP_{header.upper().replace("-", "_")}'
            if header.upper() not in ('CONTENT-TYPE', 'CONTENT-LENGTH'):
                environ[header_key] = value
        
        # Call Django WSGI app
        response_started = False
        response_status = None
        response_headers = []
        
        def start_response(status, headers, exc_info=None):
            nonlocal response_started, response_status, response_headers
            if exc_info:
                try:
                    if response_started:
                        raise exc_info[1].with_traceback(exc_info[2])
                finally:
                    exc_info = None
            elif response_headers:
                raise RuntimeError('Response already started')
            
            response_started = True
            response_status = int(status.split()[0])
            response_headers = headers
            return lambda s: None
        
        # Get response from Django
        response_data = b''
        try:
            app_iter = app(environ, start_response)
            for data in app_iter:
                response_data += data
            if hasattr(app_iter, 'close'):
                app_iter.close()
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-Type', 'text/plain')
            self.end_headers()
            self.wfile.write(str(e).encode())
            return
        
        # Send response
        if response_status:
            self.send_response(response_status)
            for header, value in response_headers:
                self.send_header(header, value)
            self.end_headers()
            if response_data:
                self.wfile.write(response_data)
