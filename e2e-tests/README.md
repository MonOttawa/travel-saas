# E2E Tests (Legacy: Playwright) — Migrating to MCP

This folder contains legacy Playwright tests. The project is migrating to MCP (Model Context Protocol) with a Chrome DevTools server for browser automation and E2E coverage.

For the new approach, see `../MCP_DEVTOOLS_SETUP.md`.

## Running the tests
### Locally
First, make sure you've [integrated Stripe into your app](https://docs.opensaas.sh/guides/stripe-integration/). This includes  [installing the Stripe CLI and logging into it](https://docs.opensaas.sh/guides/stripe-testing/) with your Stripe account.

Next, Install the test dependencies:
```shell
cd e2e-tests && npm install
```

Start your Wasp DB and leave it running:
```shell
cd ../app && wasp db start
```

### Skipping Email Verification in Dev

Open another terminal and start the Wasp app with the environment variable set to skip email verification in development mode:

> [!IMPORTANT]  
> When using the email auth method, a verification link is typically sent when a user registers. If you're using the default Dummy provider, this link is logged in the console.  
> 
> **However, during e2e tests, this manual step will cause the tests to hang and fail** because the link is never clicked. To prevent this, set the following environment variable when starting your app:

```bash
cd app && SKIP_EMAIL_VERIFICATION_IN_DEV=true wasp start
```

#### What this step will do:
- **Automated Testing:** Skipping email verification ensures e2e tests run uninterrupted.
- **Consistent Behavior:** It guarantees login flows won’t break during automated test runs.
- **CI/CD Pipelines:** This variable should also be set in CI pipelines to avoid test failures.
    ```yaml
    env:
        SKIP_EMAIL_VERIFICATION_IN_DEV: "true"
    ```


Playwright runs are deprecated. For MCP usage, follow the new guide instead of the Playwright commands below.

## CI/CD

CI for Playwright is no longer maintained. If you have existing workflows referencing this directory, plan to replace them with MCP‑based automation or remove them once MCP coverage is in place.
