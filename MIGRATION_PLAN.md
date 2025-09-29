# Travel Estimator to OpenSaaS Migration Plan

## Overview
This plan outlines how to transform the travel cost estimator into a SaaS product using OpenSaaS.

## Phase 1: Core Setup (Week 1)

### 1. Database Schema Extension
Add travel-specific models to `schema.prisma`:
```prisma
model TravelEstimate {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  user              User     @relation(fields: [userId], references: [id])
  userId            String
  
  // Trip basics
  purpose           String
  startDate         DateTime
  endDate           DateTime
  origin            String
  destinations      Json     // Array of destinations
  
  // Calculation data
  segments          Json     // Array of cost segments
  totalAmount       Float
  currency          String   @default("USD")
  
  // Metadata
  rateSnapshotId    String?
  exportedAt        DateTime?
  isPublic          Boolean  @default(false)
}

model RateSnapshot {
  id                String   @id @default(uuid())
  createdAt         DateTime @default(now())
  
  // Rate data at time of estimate
  kilometricRates   Json
  mealRates        Json
  hotelCaps        Json
  exchangeRates    Json
  
  // Checksums for verification
  checksums        Json
  
  estimates        TravelEstimate[]
}
```

### 2. Update Wasp Configuration
Modify `main.wasp` to add travel-specific routes and operations:
```wasp
// Travel Estimation Routes
route EstimatorRoute { path: "/estimator", to: EstimatorPage }
page EstimatorPage {
  authRequired: true,
  component: import TravelEstimator from "@src/travel/EstimatorPage"
}

route EstimateHistoryRoute { path: "/estimates", to: EstimateHistoryPage }
page EstimateHistoryPage {
  authRequired: true,
  component: import EstimateHistory from "@src/travel/EstimateHistoryPage"
}

// Travel Operations
action createEstimate {
  fn: import { createEstimate } from "@src/travel/operations",
  entities: [User, TravelEstimate, RateSnapshot]
}

query getUserEstimates {
  fn: import { getUserEstimates } from "@src/travel/operations",
  entities: [User, TravelEstimate]
}

// API Endpoints
api estimateApi {
  fn: import { estimateApi } from "@src/travel/api",
  httpRoute: (POST, "/api/estimate"),
  auth: true,
  entities: [User, TravelEstimate, RateSnapshot]
}
```

## Phase 2: Business Logic Migration (Week 1)

### 1. Copy Core Logic
Move these files from the original project:
- `/src/data/*` → `/app/src/travel/data/`
- `/src/lib/distance.ts` → `/app/src/travel/lib/`
- `/src/lib/services/*` → `/app/src/travel/services/`
- `/src/store/wizard-store.ts` → `/app/src/travel/store/`

### 2. Adapt Components
- Copy wizard components to `/app/src/travel/components/`
- Update imports to use Wasp's auth context
- Integrate with OpenSaaS's existing UI components

### 3. Implement API Endpoints
Create `/app/src/travel/api.ts`:
```typescript
export const estimateApi = async (req, res, context) => {
  const { user } = context;
  
  // Check user's subscription/credits
  if (!user.subscriptionStatus && user.credits <= 0) {
    return res.status(402).json({ 
      error: "Insufficient credits" 
    });
  }
  
  // Process estimate request
  const estimate = await calculateEstimate(req.body);
  
  // Deduct credit if not subscribed
  if (!user.subscriptionStatus) {
    await context.entities.User.update({
      where: { id: user.id },
      data: { credits: user.credits - 1 }
    });
  }
  
  return res.json(estimate);
};
```

## Phase 3: Pricing & Payments (Week 2)

### 1. Define Pricing Tiers
Update payment processor configuration:
```typescript
// Basic Plan: $9/month
// - 50 estimates per month
// - PDF/CSV export
// - Email support

// Pro Plan: $29/month
// - Unlimited estimates
// - API access (1000 calls/month)
// - Priority support
// - Bulk export

// Enterprise: Custom pricing
// - Unlimited API calls
// - Custom integrations
// - SLA
```

### 2. Implement Usage Tracking
Add middleware to track API usage:
```typescript
model ApiUsage {
  id        String   @id @default(uuid())
  userId    String
  endpoint  String
  timestamp DateTime @default(now())
  
  user      User     @relation(fields: [userId], references: [id])
}
```

### 3. Set Up Stripe Products
- Create subscription products in Stripe dashboard
- Configure webhooks for subscription events
- Update environment variables

## Phase 4: UI Integration (Week 2)

### 1. Replace Demo App
- Remove demo AI app components
- Replace with travel estimator wizard
- Update landing page to showcase travel features

### 2. Customize Theme
- Apply government-appropriate blue palette
- Ensure shadcn/ui components match design
- Update marketing copy

### 3. Admin Dashboard
- Add travel-specific metrics
- Show popular routes
- Track rate update history

## Phase 5: Production Setup (Week 3)

### 1. Environment Configuration
```env
# Payment Processing
STRIPE_API_KEY=
STRIPE_WEBHOOK_SECRET=

# Email
SENDGRID_API_KEY=

# Analytics
PLAUSIBLE_API_KEY=

# AWS S3 (for exports)
AWS_S3_IAM_ACCESS_KEY=
AWS_S3_IAM_SECRET_KEY=
AWS_S3_FILES_BUCKET=

# Travel-specific
RATE_UPDATE_CRON="0 2 * * *"
```

### 2. Background Jobs
Add rate update job to `main.wasp`:
```wasp
job updateRatesJob {
  executor: PgBoss,
  perform: {
    fn: import { updateRates } from "@src/travel/jobs/rateUpdater"
  },
  schedule: {
    cron: "0 2 * * *" // 2 AM daily
  },
  entities: [RateSnapshot]
}
```

### 3. Deployment
- Deploy to Fly.io using `wasp deploy`
- Configure custom domain
- Set up SSL certificates
- Configure Coolify for alternative deployment

## Phase 6: API Documentation (Week 3)

### 1. Create API Docs
- Document all endpoints
- Provide example requests/responses
- Create API key management UI

### 2. Client Libraries
- Generate TypeScript SDK
- Create example integrations
- Publish to npm

## Success Metrics

- [ ] User can sign up and create estimates
- [ ] Subscription payments work correctly
- [ ] API endpoint accessible with auth
- [ ] Rate limits enforced
- [ ] Export functionality works
- [ ] Admin can view analytics

## Timeline

- **Week 1**: Core setup and business logic migration
- **Week 2**: Pricing, payments, and UI integration
- **Week 3**: Production setup and API documentation
- **Week 4**: Testing, bug fixes, and launch preparation