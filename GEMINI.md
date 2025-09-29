# GEMINI.md - Travel Cost Estimator SaaS Project Handover

This document provides context for Google Gemini CLI to continue work on the Travel Cost Estimator SaaS project.

## Project Overview

**Original Goal**: Transform a Next.js-based travel cost estimator into a subscription-based SaaS product with API access.

**Current Status**: Successfully migrated to OpenSaaS (Wasp framework) with basic functionality working.

## What Was Done

### 1. Architecture Decision
- **Chose OpenSaaS over custom implementation** for faster time-to-market
- OpenSaaS provides: Auth, Subscriptions, Admin Dashboard, API infrastructure
- Built on Wasp framework (React + Node.js + Prisma)

### 2. Project Setup
- Created new OpenSaaS project at `/Users/mondylim/Projects/travel-saas`
- Original Next.js code preserved at `/Users/mondylim/Projects/travel`
- Configured environment variables for demo deployment
- Created Docker Compose configuration for Coolify deployment

### 3. Implementation Status

#### ✅ Completed:
- Basic travel cost estimator at `/estimator` route
- Integration with OpenSaaS subscription system
- Credit-based usage limiting (3 free estimates)
- Simplified calculator UI using Tailwind CSS
- Environment configuration for demo
- Deployment documentation

#### ⏳ In Progress:
- Full travel wizard migration (currently simplified calculator)
- Stripe payment integration (using dummy keys)
- API endpoints for external access
- Rate data management system

#### ❌ Not Started:
- PDF/CSV export functionality
- Rate scraping system
- Full wizard UI with multi-step form
- Production Stripe configuration

## Current File Structure

```
/Users/mondylim/Projects/
├── travel/                    # Original Next.js app (reference)
│   ├── apps/web/             # Next.js 15 implementation
│   ├── packages/schemas/     # Shared Zod schemas
│   └── WARP.md              # Updated with new architecture
│
└── travel-saas/              # New OpenSaaS implementation
    ├── app/                  # Main Wasp application
    │   ├── src/
    │   │   ├── travel/      # Travel estimator feature
    │   │   │   └── TravelEstimatorPage.tsx
    │   │   ├── payment/     # Stripe integration
    │   │   ├── auth/        # Authentication
    │   │   └── client/      # Shared components
    │   ├── main.wasp        # Wasp configuration
    │   ├── schema.prisma    # Database schema
    │   └── .env.server      # Environment variables
    ├── docker-compose.yml   # Coolify deployment
    ├── MIGRATION_PLAN.md    # Detailed migration roadmap
    ├── COOLIFY_DEPLOYMENT.md # Deployment guide
    └── LOCAL_TESTING.md     # Local development guide
```

## Key Files to Review

1. **`/travel-saas/app/main.wasp`** - Application configuration
   - Routes, pages, operations defined here
   - Demo AI app operations commented out (lines 163-192)
   - Travel estimator route at line 150

2. **`/travel-saas/app/src/travel/TravelEstimatorPage.tsx`** - Current implementation
   - Simple calculator with kilometric rates
   - Integrated with subscription system
   - Uses basic HTML/Tailwind (no shadcn/ui yet)

3. **`/travel-saas/app/.env.server`** - Environment configuration
   - Dummy values for demo purposes
   - Needs real Stripe keys for payments
   - OpenAI key added to prevent startup errors

## Running the Application

```bash
# Prerequisites: Docker (via Colima or Docker Desktop)

# Terminal 1 - Database
cd /Users/mondylim/Projects/travel-saas/app
wasp start db

# Terminal 2 - Application
cd /Users/mondylim/Projects/travel-saas/app
wasp db migrate-dev
wasp start

# Access at http://localhost:3001
```

## Next Steps (Priority Order)

### 1. Complete Travel Wizard Migration
- Copy wizard components from original `/travel/apps/web/src/components/wizard/`
- Adapt to Wasp's routing system
- Integrate with Prisma models

### 2. Implement API Endpoints
```typescript
// In main.wasp
api estimateApi {
  fn: import { estimateApi } from "@src/travel/api",
  httpRoute: (POST, "/api/estimate"),
  auth: true,
  entities: [User, TravelEstimate]
}
```

### 3. Set Up Real Payment Processing
- Create Stripe test account
- Add products: Hobby ($9), Pro ($29), Credits ($10)
- Update environment variables
- Test checkout flow

### 4. Add Export Functionality
- Implement PDF generation using jsPDF
- CSV export using native JavaScript
- Store exports in database or S3

### 5. Production Deployment
- Build with `wasp build`
- Push to GitHub
- Deploy via Coolify using docker-compose.yml
- Configure production environment variables

## Common Issues & Solutions

### Issue 1: OpenAI Error on Startup
**Solution**: Already fixed by adding dummy OPENAI_API_KEY and commenting out demo operations

### Issue 2: Port Conflicts
**Solution**: Stop local PostgreSQL with `brew services stop postgresql@15`

### Issue 3: TypeScript Errors
**Solution**: Removed demo-ai-app directory to prevent compilation errors

### Issue 4: Missing UI Components
**Solution**: Using basic HTML/Tailwind instead of shadcn/ui (not included in OpenSaaS)

## Testing Checklist

- [ ] User can sign up (check terminal for verification link)
- [ ] User can log in
- [ ] Travel estimator loads at `/estimator`
- [ ] Calculator computes estimates correctly
- [ ] Credit system blocks after 3 uses
- [ ] Pricing page shows subscription options

## Important Context

1. **Why OpenSaaS?**: Provides complete SaaS infrastructure vs building from scratch
2. **Why Wasp?**: Full-stack type safety, built-in auth, easy deployment
3. **Deployment Target**: Coolify (self-hosted PaaS)
4. **Subscription Model**: Free (3 estimates), Hobby ($9/mo), Pro ($29/mo + API)

## Commands Reference

```bash
# Development
wasp start          # Start app
wasp db studio      # Prisma Studio
wasp db migrate-dev # Run migrations
wasp build         # Production build
wasp clean         # Clean build artifacts

# Testing
wasp test          # Run tests
npm test           # In app directory

# Deployment
docker compose up  # Local Docker test
git push origin main # Trigger Coolify deploy
```

## External Documentation

- [Wasp Docs](https://wasp.sh/docs)
- [OpenSaaS Docs](https://docs.opensaas.sh)
- [Prisma Docs](https://www.prisma.io/docs)
- [Stripe API](https://stripe.com/docs/api)

---

**Note to Gemini**: The project is functional but needs the features listed in "Next Steps" to be production-ready. Focus on maintaining the OpenSaaS architecture while adding travel-specific functionality. The original Next.js code in `/travel` directory serves as reference for business logic and UI components.