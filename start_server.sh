#!/bin/bash

# Generate config.js
cat > config.js << 'EOF'
window.CONFIG = {
    TMDB_API_KEY: 'd56ba8afb5eca855e13f2507f36f9a62'
};
EOF

echo "Config generated"

# Set DATABASE_URL environment variable
export DATABASE_URL="postgresql://neondb_owner:npg_FAdfZ5uD2hiL@ep-dark-mountain-adl3jwkg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Start main server in background
python main.py &

# Start API server
python api_server.py