# Coolify Deployment Guide for Travel Cost Estimator

## Prerequisites

1. A Coolify instance running (v4.0+)
2. A domain name pointed to your Coolify server
3. Stripe account (for payments)
4. SendGrid account (for emails) - optional for demo

## Quick Deploy Steps

### 1. Prepare the Repository

First, build the Wasp application locally:
```bash
cd /Users/mondylim/Projects/travel-saas/app
npm install
wasp build
```

This creates the production build in `app/.wasp/build/`.

### 2. Create GitHub Repository

1. Create a new GitHub repository
2. Push the entire `travel-saas` folder:
```bash
cd /Users/mondylim/Projects/travel-saas
git init
git add .
git commit -m "Initial commit - Travel Cost Estimator SaaS"
git remote add origin https://github.com/YOUR_USERNAME/travel-saas.git
git push -u origin main
```

### 3. Configure in Coolify

1. **Add New Resource** in Coolify
   - Choose "Docker Compose"
   - Connect your GitHub repository

2. **Configure Build**
   - Build Pack: `Docker Compose`
   - Docker Compose Location: `./docker-compose.yml`

3. **Environment Variables**
   Copy these to Coolify's environment section:
   ```
   # Database
   DB_USER=postgres
   DB_PASSWORD=your-secure-password-here
   
   # Security
   JWT_SECRET=your-32-char-minimum-secret-here
   
   # URLs (Update with your domain)
   CLIENT_URL=https://app.yourdomain.com
   SERVER_URL=https://api.yourdomain.com
   
   # Stripe (Start with test keys)
   STRIPE_API_KEY=sk_test_your_test_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   STRIPE_CUSTOMER_PORTAL_URL=https://billing.stripe.com/test/session/create
   
   # Payment Plans (Use dummy IDs for now)
   PAYMENTS_HOBBY_SUBSCRIPTION_PLAN_ID=price_hobby_test
   PAYMENTS_PRO_SUBSCRIPTION_PLAN_ID=price_pro_test
   PAYMENTS_CREDITS_10_PLAN_ID=price_credits_test
   
   # Admin
   ADMIN_EMAILS=your-email@example.com
   ```

4. **Configure Domains**
   - Add domain for the client service: `app.yourdomain.com`
   - Add domain for the server service: `api.yourdomain.com`
   - Enable "Force HTTPS"

5. **Deploy**
   - Click "Deploy"
   - Monitor logs for any issues

## Post-Deployment Setup

### 1. Verify Deployment
- Visit `https://app.yourdomain.com` - should show the landing page
- Visit `https://api.yourdomain.com/api/health` - should return OK

### 2. Create First Admin User
1. Sign up at `https://app.yourdomain.com/signup`
2. Use the email from `ADMIN_EMAILS`
3. Check Coolify logs for email verification link (Dummy provider logs to console)

### 3. Configure Stripe (Production)
1. Create products in Stripe Dashboard:
   - **Hobby Plan**: $9/month, recurring
   - **Pro Plan**: $29/month, recurring
   - **Credits Pack**: $10 one-time

2. Update environment variables with real Product IDs

3. Set up webhook endpoint:
   - URL: `https://api.yourdomain.com/payments-webhook`
   - Events: `checkout.session.completed`, `customer.subscription.updated`

### 4. Configure SendGrid (Production)
1. Get API key from SendGrid
2. Update `SENDGRID_API_KEY` in Coolify
3. Change email provider in `main.wasp` from `Dummy` to `SendGrid`

## Troubleshooting

### Database Connection Issues
- Check if database service is healthy: `docker ps`
- Verify DATABASE_URL format
- Check Coolify logs for connection errors

### Build Failures
- Ensure `wasp build` was run before pushing
- Check Node.js version compatibility (18+)
- Verify all environment variables are set

### Payment Issues
- Verify Stripe API keys are correct
- Check webhook secret matches Stripe dashboard
- Monitor webhook logs in Stripe dashboard

## Monitoring

1. **Application Logs**: Available in Coolify dashboard
2. **Database**: Can add pgAdmin as additional service
3. **Performance**: Consider adding Plausible Analytics

## Scaling

When ready to scale:
1. Increase server resources in Coolify
2. Add Redis for caching (update docker-compose.yml)
3. Configure CDN for static assets
4. Set up database backups

## Security Checklist

- [ ] Strong database password
- [ ] Unique JWT secret (32+ chars)
- [ ] HTTPS enabled on all domains
- [ ] Environment variables not in git
- [ ] Regular security updates
- [ ] Backup strategy in place