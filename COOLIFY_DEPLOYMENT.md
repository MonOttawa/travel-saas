# Deploying on Coolify: A Detailed Guide

This guide provides step-by-step instructions for deploying the Travel Cost Estimator application on a Coolify v4 instance.

## 🚀 What You'll Need

Before you begin, ensure you have the following:

- **A Coolify Instance:** A running instance of Coolify (v4.0.0-beta.283 or later).
- **GitHub Account:** A personal or organization account on GitHub.
- **Domain Name:** A domain pointed to your Coolify server's IP address.
- **Stripe Account:** For processing payments. You can start with a test account.
- **SendGrid Account:** For sending transactional emails (optional for initial setup).

## 🏛️ Architectural Overview

Our application is composed of three core services defined in the `docker-compose.yml` file:

1.  **`db` (PostgreSQL Database):** The primary database for storing all application data, including users, travel estimates, and subscriptions.
2.  **`server` (Wasp Backend):** The backend API built with Wasp. It handles business logic, user authentication, and communication with the database and Stripe.
3.  **`client` (React Frontend):** The user-facing web application, built with React. It communicates with the `server` API.

Coolify will use our `docker-compose.yml` to build, deploy, and manage these services.

## 📝 Step 1: Initial Project Setup

### 1.1 Fork the Repository

First, create a fork of this repository into your own GitHub account. This allows you to make changes and connect it to Coolify without affecting the original project.

### 1.2 Build the Application Locally

The `docker-compose.yml` file is configured to use pre-built artifacts from the Wasp framework. You **must** run the build command locally and commit the generated files *before* deploying to Coolify.

1.  **Install Dependencies:**
    ```bash
    cd app
    npm install
    ```

2.  **Run Wasp Build:**
    ```bash
    wasp build
    ```
    This command compiles the application and places the necessary server and client files into the `app/.wasp/build/` directory.

3.  **Commit and Push Changes:**
    Commit the newly generated `build` directory and any other changes to your forked repository.
    ```bash
    git add .
    git commit -m "feat: Add initial build artifacts for Coolify deployment"
    git push origin main
    ```

## 🛠️ Step 2: Configure in Coolify

### 2.1 Create a New Resource

1.  From your Coolify dashboard, navigate to the project where you want to deploy the application.
2.  Click **Add Resource** and select **Docker Compose**.
3.  Choose your GitHub repository and the branch you want to deploy (e.g., `main`).

### 2.2 Configure Build Settings

1.  Coolify will automatically detect the `docker-compose.yml` file.
2.  Set the **Build Pack** to `Docker Compose`.
3.  Set the **Docker Compose Location** to `./docker-compose.yml`.

### 2.3 Configure Environment Variables

This is the most critical step. Go to the **Environment Variables** tab for your new resource and add the following keys.

**Important:** Mark sensitive values like API keys and database passwords as **"Is Secret"**.

| Variable                                | Description                                                                                             | Example Value                               |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `DB_USER`                               | The username for the PostgreSQL database.                                                               | `postgres`                                  |
| `DB_PASSWORD`                           | A strong, secure password for the database.                                                             | `generate-a-secure-password`                |
| `JWT_SECRET`                            | A unique, 32+ character string for signing authentication tokens.                                       | `generate-a-long-random-string`             |
| `CLIENT_URL`                            | The public URL for your frontend application.                                                           | `https://app.yourdomain.com`                |
| `SERVER_URL`                            | The public URL for your backend API.                                                                    | `https://api.yourdomain.com`                |
| `STRIPE_API_KEY`                        | Your Stripe secret key (e.g., `sk_test_...`).                                                            | `sk_test_...`                               |
| `STRIPE_WEBHOOK_SECRET`                 | The signing secret for your Stripe webhook.                                                             | `whsec_...`                                 |
| `STRIPE_CUSTOMER_PORTAL_URL`            | The URL for the Stripe customer portal.                                                                 | `https://billing.stripe.com/p/login/...`    |
| `PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID`   | The Price ID from Stripe for your "Hobby" plan.                                                         | `price_...`                                 |
| `PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID`     | The Price ID from Stripe for your "Pro" plan.                                                           | `price_...`                                 |
| `PAYMENTS_CREDITS_10_PLAN_ID`           | The Price ID from Stripe for your one-time credits pack.                                                | `price_...`                                 |
| `ADMIN_EMAILS`                          | A comma-separated list of emails for users who should have admin privileges.                            | `your-email@example.com`                    |
| `SENDGRID_API_KEY`                      | Your SendGrid API key for sending emails.                                                               | `SG....`                                    |

### 2.4 Configure Networking and Domains

Coolify needs to know which domains point to which services.

1.  Go to the **Configuration** tab for your resource.
2.  For the `client` service, set the **FQDN (Domain)** to your frontend URL (e.g., `https://app.yourdomain.com`).
3.  For the `server` service, set the **FQDN (Domain)** to your backend URL (e.g., `https://api.yourdomain.com`).
4.  Ensure **Force HTTPS** is enabled for both services for security.

## 🚀 Step 3: Deploy and Verify

### 3.1 Trigger a Deployment

Once everything is configured, click the **Deploy** button. Coolify will:
1.  Clone your repository.
2.  Build the Docker images for the `server` and `client` based on your `docker-compose.yml`.
3.  Start the services.

Monitor the **Deployment Logs** for any errors.

### 3.2 Verify the Deployment

-   **Frontend:** Visit your client URL (`https://app.yourdomain.com`). You should see the application's landing page.
-   **Backend:** Visit the health check endpoint for your server (`https://api.yourdomain.com/api/health`). It should return an `OK` status.

## 🔧 Step 4: Post-Deployment Setup

### 4.1 Create Your Admin User

1.  Go to your application's signup page (`https://app.yourdomain.com/signup`).
2.  Register a new user with one of the emails you listed in the `ADMIN_EMAILS` environment variable.

### 4.2 Configure Stripe Webhooks

Stripe needs to send events to your backend to confirm payments and manage subscriptions.

1.  In your Stripe dashboard, go to **Developers > Webhooks**.
2.  Click **Add endpoint**.
3.  **Endpoint URL:** `https://api.yourdomain.com/payments-webhook`
4.  **Listen to:** Click "Select events" and add the following:
    -   `checkout.session.completed`
    -   `customer.subscription.updated`
5.  **Signing secret:** Copy the generated signing secret and add it to your `STRIPE_WEBHOOK_SECRET` environment variable in Coolify.

## 🔄 Step 5: Pushing Updates

To update your application, simply push your code changes to the configured GitHub branch. If your changes require a new build (e.g., you modified frontend or backend code), remember to run `wasp build` locally and commit the results *before* pushing.

Coolify will automatically detect the new commit and trigger a new deployment.

## 🔍 Troubleshooting

-   **Build Failures:**
    -   Did you run `wasp build` locally and commit the `app/.wasp/build` directory before pushing?
    -   Check the deployment logs in Coolify for specific error messages.

-   **502 Bad Gateway Error:**
    -   This usually means the `server` or `client` service failed to start.
    -   Check the container logs in Coolify for your `server` and `client` services to diagnose the issue.
    -   Verify that all environment variables are set correctly.

-   **Database Connection Issues:**
    -   Ensure the `DB_USER` and `DB_PASSWORD` variables are correct.
    -   Check the logs for the `db` service to ensure it's healthy.