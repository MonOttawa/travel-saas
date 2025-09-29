#!/usr/bin/env bash
set -euo pipefail

echo "== OpenSaaS Basic Smoke Check =="

ok() { echo "[OK] $1"; }
warn() { echo "[WARN] $1"; }
info() { echo "[INFO] $1"; }

# Check Node.js >= 18
if command -v node >/dev/null 2>&1; then
  NODE_VER="$(node -v | sed 's/^v//')"
  NODE_MAJOR="${NODE_VER%%.*}"
  if [ "${NODE_MAJOR}" -ge 18 ]; then
    ok "Node.js ${NODE_VER}"
  else
    warn "Node.js ${NODE_VER} found; require >= 18"
  fi
else
  warn "Node.js not found. Install Node 18+"
fi

# Check Wasp CLI
if command -v wasp >/dev/null 2>&1; then
  ok "Wasp CLI $(wasp version | tr -d '\n')"
else
  warn "Wasp CLI not found. See https://wasp.sh/docs"
fi

# Check Docker/Colima
if command -v docker >/dev/null 2>&1; then
  ok "Docker $(docker --version | cut -d, -f1)"
else
  warn "Docker not found. Install Docker Desktop or Colima"
fi

# Helpers for grep or ripgrep
GREP_BIN="grep"
if command -v rg >/dev/null 2>&1; then GREP_BIN="rg"; fi

# Check env files
if [ -f app/.env.server ]; then
  ok "Found app/.env.server"
  MISSING=()
  for K in STRIPE_API_KEY STRIPE_WEBHOOK_SECRET STRIPE_CUSTOMER_PORTAL_URL PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID PAYMENTS_CREDITS_10_PLAN_ID; do
    if ! ${GREP_BIN} -n "^${K}=" app/.env.server >/dev/null 2>&1; then
      MISSING+=("${K}")
    fi
  done
  if [ ${#MISSING[@]} -gt 0 ]; then
    warn "Missing keys in app/.env.server: ${MISSING[*]} (use test/placeholder values locally)"
  else
    ok "Core payment env keys present"
  fi
else
  warn "Missing app/.env.server. Copy from app/.env.server.example"
fi

if [ -f app/.env.client ]; then
  ok "Found app/.env.client"
else
  info "Optional: app/.env.client (analytics)"
fi

# Sanity: key sources/routes
${GREP_BIN} -n "api paymentsWebhook|/payments-webhook" app/main.wasp >/dev/null 2>&1 && ok "Payments webhook configured" || warn "Payments webhook missing in app/main.wasp"
${GREP_BIN} -n "TravelEstimatorPage" app/src/travel/TravelEstimatorPage.tsx >/dev/null 2>&1 && ok "Travel estimator present" || warn "Travel estimator page missing"
${GREP_BIN} -n "paymentProcessor" app/src/payment/paymentProcessor.ts >/dev/null 2>&1 && ok "Payment processor wired (default Stripe)" || warn "Payment processor wiring missing"

echo
echo "Next steps (manual run):"
echo "  1) Terminal A: cd app && wasp db start"
echo "  2) Terminal B: cd app && wasp db migrate-dev && wasp start"
echo "     - Web: http://localhost:3000  API: http://localhost:3001"
echo "  3) Optional (payments): stripe listen --forward-to localhost:3001/payments-webhook"
echo
echo "Quick checks in the app:"
echo "  - Sign up/login -> redirected to /estimator"
echo "  - See free credits badge; gating after credits exhausted"
echo "  - /pricing loads; Buy plan opens checkout (test)"
echo "  - /account reachable; portal link works if configured"

echo
ok "Smoke check completed"

