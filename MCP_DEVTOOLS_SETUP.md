# MCP + Chrome DevTools — Setup and Usage

This project uses MCP (Model Context Protocol) with a Chrome DevTools server for browser automation and end‑to‑end workflows. This replaces Playwright for new and ongoing work.

## Prerequisites
- Google Chrome or Chromium (recent stable).
- Node.js 18+.
- Wasp CLI installed (for app dev).
- Stripe CLI (optional, for payment/webhook testing).

## Install and Configure
> Note: Exact package names and installation commands can vary by MCP implementation. Use the official documentation for the Chrome DevTools MCP server you choose.

1) Select a Chrome DevTools MCP server implementation
- Option A: Official/maintained Chrome DevTools MCP server.
- Option B: Community implementation with DevTools Protocol support.

2) Install the MCP server and client
- Follow the server repo’s instructions to install (npm, brew, or binary).
- Ensure your MCP client/agent can load a config that declares the Chrome DevTools server.

3) Configure MCP
- Create (or update) your MCP client configuration to include a target like:
  - server: Chrome DevTools MCP
  - params: headless/headful, remote debugging port, default URL (`http://localhost:3000`), etc.

4) Launch Chrome with Remote Debugging (if required)
```bash
# Example: use helper script in this repo
bash scripts/run-chrome-devtools.sh 9222 http://localhost:3000
```

## Running Locally with MCP
1) Start DB and app
```bash
cd app
wasp db start            # Terminal A

# Terminal B
wasp db migrate-dev
SKIP_EMAIL_VERIFICATION_IN_DEV=true wasp start
```

2) Start Stripe forwarding (optional)
```bash
stripe listen --forward-to localhost:3001/payments-webhook
```

3) Start the MCP Chrome DevTools server
- Use the server’s documented command, pointing to the remote debugging port (e.g., 9222) if needed.
- A placeholder helper is provided: `bash scripts/start-devtools-mcp.sh 9222` — update it with the official command.

4) Connect your MCP client/agent
- Point it at your MCP config and run your automation flows (login, estimate creation, pricing/checkout, etc.).

## Suggested Flows to Automate
- Auth: signup, email verification bypass in dev, login.
- Estimation: navigate to `/estimator`, enter fields, calculate, validate results summary.
- Credits/subscription: consume free credits, confirm gating, navigate to `/pricing`.
- Payments (test mode): trigger checkout, confirm webhook events received by the server.

## Tips
- Use test‑friendly accounts and the `SKIP_EMAIL_VERIFICATION_IN_DEV=true` flag.
- Keep selectors resilient: prefer labels/roles/text over brittle CSS.
- Log screenshots or HTML snapshots from MCP actions where possible for debugging.

## Migrating from Playwright
- Existing Playwright assets in `e2e-tests/` are retained for reference only and are no longer the source of truth for E2E coverage.
- New scenarios should be authored with MCP + Chrome DevTools.
- You may remove Playwright dependencies at a later cleanup milestone once MCP coverage is complete.

## Codex CLI Integration

Until Codex CLI offers a one‑click MCP plug‑in, use a JSON config to register the Chrome DevTools MCP server as an MCP provider and have Codex CLI load it at startup.

1) Copy `mcp/codex-cli.mcp.json` to your Codex CLI MCP config location (or point Codex CLI to this file if supported by your version).
2) Update the `command`/`args` to the official Chrome DevTools MCP server command.
3) Ensure Chrome is running with `--remote-debugging-port=9222`.
4) Restart Codex CLI and verify it detects the `chrome-devtools` MCP server.

If your Codex CLI uses a different MCP config schema/path, adapt the example accordingly.

## Troubleshooting
- Cannot connect to Chrome: verify `--remote-debugging-port` and that Chrome is running.
- App auth flows hang: ensure the Wasp app is started with `SKIP_EMAIL_VERIFICATION_IN_DEV=true`.
- Webhook not received: verify Stripe CLI forwarding and the webhook secret in env.
