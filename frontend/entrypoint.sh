#!/bin/sh
set -e
# Print backend URL for debugging
echo "Using this URL as backendURL: ${VITE_BACKEND_URL}"
# Execute nginx as main process
exec nginx -g 'daemon off;'
