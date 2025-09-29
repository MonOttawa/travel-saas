# Local Testing Guide for Travel Cost Estimator SaaS

## Prerequisites

1. **Install Docker Desktop** (required for Wasp's database)
   - Download from: https://www.docker.com/products/docker-desktop/
   - Start Docker Desktop after installation

2. **Ensure Wasp is installed**
   ```bash
   wasp version
   # Should show 0.18.0 or higher
   ```

## Testing Steps

### 1. Start the Database
Open Terminal 1 and run:
```bash
cd /Users/mondylim/Projects/travel-saas/app
wasp start db
```
Keep this terminal open - it runs PostgreSQL in Docker.

### 2. Run Database Migrations
Open Terminal 2 and run:
```bash
cd /Users/mondylim/Projects/travel-saas/app
wasp db migrate-dev
```

### 3. Start the Application
In the same Terminal 2, run:
```bash
wasp start
```

This will start:
- Backend server on http://localhost:3001
- Frontend on http://localhost:3000

### 4. Test the Application

1. **Visit http://localhost:3000**
   - You should see the Travel Cost Estimator landing page

2. **Sign Up**
   - Click "Sign up" 
   - Create an account (use any email)
   - Check Terminal 2 for the verification link (Dummy email provider logs to console)
   - Click the verification link to activate your account

3. **Test the Estimator**
   - After login, you'll be redirected to `/estimator`
   - You start with 3 free credits
   - Enter some test values:
     - Distance: 500 km
     - Region: Ontario
     - Days: 3
     - Include Hotel: Yes, 2 nights
   - Click "Calculate Estimate"
   - You should see a breakdown of costs

4. **Test Subscription Limits**
   - Use up your 3 credits by calculating 3 estimates
   - On the 4th attempt, you'll see "Subscribe to Calculate"
   - Click "Upgrade to a paid plan" to see pricing page

### 5. Admin Features

If you set your email in `ADMIN_EMAILS` in `.env.server`, you'll have access to the admin dashboard at `/admin`.

## Troubleshooting

### Database Connection Error
- Ensure Docker Desktop is running
- Check if port 5432 is available
- Try `wasp db reset` if migrations fail

### Build Errors
- Run `wasp clean` and try again
- Check Node.js version (needs 18+)

### Can't Find Verification Email
- Look in Terminal 2 output for lines like:
  ```
  [ Server ] Verification email sent to: your@email.com
  [ Server ] Verification link: http://localhost:3000/email-verification?token=...
  ```

## What's Working

✅ User authentication (signup/login)
✅ Email verification (logs to console)
✅ Travel cost calculator
✅ Credit system (3 free estimates)
✅ Subscription check (blocks after credits depleted)
✅ Basic pricing page
✅ Responsive design with Tailwind CSS

## What's Not Yet Implemented

- Actual Stripe payment processing (needs API keys)
- Full wizard interface (simplified calculator for now)
- API endpoints for external access
- Rate data management (using hardcoded rates)
- PDF/CSV export
- Email sending (using Dummy provider)

## Next Steps

To make payments work:
1. Create a Stripe account
2. Add test products in Stripe Dashboard
3. Update `.env.server` with real Stripe keys
4. Test checkout flow

See `MIGRATION_PLAN.md` for full implementation roadmap.