#!/bin/sh
set -e
# Write runtime environment variables for the frontend
cat <<EOF >/usr/share/nginx/html/env.js
window.env = {
  VITE_BACKEND_URL: "${VITE_BACKEND_URL}",
  VITE_GO_PRO: "${VITE_GO_PRO}",
  VITE_ADSENSE_CLIENT: "${VITE_ADSENSE_CLIENT}",
  VITE_ADSENSE_SLOT: "${VITE_ADSENSE_SLOT}",
  VITE_FIREBASE_CONFIG: "${VITE_FIREBASE_CONFIG}"
};
EOF

# Print backend URL for debugging
echo "Using this URL as backendURL: ${VITE_BACKEND_URL}"

# Execute nginx as main process
exec nginx -g 'daemon off;'
