#!/bin/sh
set -e

escape_js_string() {
  # Escape backslashes, double quotes and newlines so runtime env stays valid JS
  printf '%s' "$1" | sed ':a;N;$!ba;s/\\/\\\\/g;s/\n/\\n/g;s/"/\\"/g'
}

BACKEND_URL_ESC=$(escape_js_string "${VITE_BACKEND_URL}")
GO_PRO_ESC=$(escape_js_string "${VITE_GO_PRO}")
ADSENSE_CLIENT_ESC=$(escape_js_string "${VITE_ADSENSE_CLIENT}")
ADSENSE_SLOT_ESC=$(escape_js_string "${VITE_ADSENSE_SLOT}")
FIREBASE_CONFIG_ESC=$(escape_js_string "${VITE_FIREBASE_CONFIG}")
GA_ID_ESC=$(escape_js_string "${VITE_GA_ID}")

# Write runtime environment variables for the frontend
cat <<EOF >/usr/share/nginx/html/env.js
window.env = {
  VITE_BACKEND_URL: "${BACKEND_URL_ESC}",
  VITE_GO_PRO: "${GO_PRO_ESC}",
  VITE_ADSENSE_CLIENT: "${ADSENSE_CLIENT_ESC}",
  VITE_ADSENSE_SLOT: "${ADSENSE_SLOT_ESC}",
  VITE_FIREBASE_CONFIG: "${FIREBASE_CONFIG_ESC}",
  VITE_GA_ID: "${GA_ID_ESC}"
};
EOF

# Print backend URL for debugging
echo "Using this URL as backendURL: ${VITE_BACKEND_URL}"

# Execute nginx as main process
exec nginx -g 'daemon off;'
