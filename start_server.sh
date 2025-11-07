
#!/bin/bash

# Generate config.js with API key from environment
cat > config.js << EOF
window.CONFIG = {
    TMDB_API_KEY: '${TMDB_API_KEY:-d56ba8afb5eca855e13f2507f36f9a62}'
};
EOF

echo "Config generated"

# Start API server in background
python3 api_server.py &

# Start frontend server
python3 server.py
