#!/usr/bin/env bash
set -euo pipefail

# Launch Google Chrome/Chromium with the DevTools Protocol enabled.
# - Uses a throwaway user data dir.
# - Defaults to port 9222.

PORT="${1:-9222}"
PROFILE_DIR="${TMPDIR:-/tmp}/mcp-chrome-profile-$PORT"
URL="${2:-http://localhost:3000}"

mkdir -p "$PROFILE_DIR"

CHROME_CMD=""
if command -v google-chrome >/dev/null 2>&1; then
  CHROME_CMD="google-chrome"
elif command -v chromium >/dev/null 2>&1; then
  CHROME_CMD="chromium"
elif [ -x "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" ]; then
  CHROME_CMD="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
elif [ -x "/Applications/Chromium.app/Contents/MacOS/Chromium" ]; then
  CHROME_CMD="/Applications/Chromium.app/Contents/MacOS/Chromium"
else
  echo "Could not find Chrome/Chromium executable. Please install Chrome and update this script if needed." >&2
  exit 1
fi

"$CHROME_CMD" \
  --remote-debugging-port="$PORT" \
  --user-data-dir="$PROFILE_DIR" \
  --no-first-run \
  --no-default-browser-check \
  "$URL"

