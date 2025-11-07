#!/bin/bash

python3 << 'EOF'
import os

tmdb_key = os.environ.get('TMDB_API_KEY', '')
with open('config.js', 'w') as f:
    f.write(f'''window.CONFIG = {{
    TMDB_API_KEY: '{tmdb_key}'
}};
''')
print('Config generated')
EOF

python3 server.py
