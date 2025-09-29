# Travel Cost Estimator SaaS

A professional subscription-based web application and API service for estimating business travel costs using official Canadian government rates (NJC, PWGSC).

## Features

- **Travel Cost Estimation**: Calculate mileage, meals, and accommodation costs
- **Official Rates**: Uses NJC and PWGSC government travel rates
- **Subscription Tiers**: Free trial, Hobby ($9/mo), Pro ($29/mo), and Enterprise plans
- **API Access**: RESTful API for integrations (Pro and Enterprise plans)
- **Export Options**: PDF and CSV export capabilities
- **Admin Dashboard**: Analytics and user management

## Quick Start

### Prerequisites
- Node.js 18+
- Wasp CLI
- PostgreSQL (or use Wasp's built-in DB)

### Installation

1. Install Wasp:
```bash
curl -sSL https://get.wasp.sh/installer.sh | sh
```

2. Install dependencies:
```bash
cd app
npm install
```

3. Set up environment:
```bash
cp .env.server.example .env.server
cp .env.client.example .env.client
```

4. Start development:
```bash
# Terminal 1 - Start database
wasp db start

# Terminal 2 - Run migrations and start app
wasp db migrate-dev
wasp start
```

5. Visit http://localhost:3000

## Deployment

This project is configured for deployment via Coolify using Docker Compose.

### Quick Deploy to Coolify

1. Build the project:
```bash
cd app && wasp build
```

2. Push to GitHub
3. Connect to Coolify and use Docker Compose deployment
4. Configure environment variables (see `.env.production`)

See [COOLIFY_DEPLOYMENT.md](./COOLIFY_DEPLOYMENT.md) for detailed instructions.

## Project Structure

```
travel-saas/
├── app/                    # Main Wasp application
│   ├── src/
│   │   ├── travel/        # Travel estimation features
│   │   ├── payment/       # Stripe integration
│   │   ├── auth/          # Authentication
│   │   └── client/        # Shared UI components
│   ├── main.wasp          # Wasp configuration
│   └── schema.prisma      # Database schema
├── docker-compose.yml     # Coolify deployment config
├── MIGRATION_PLAN.md      # Migration from Next.js
└── COOLIFY_DEPLOYMENT.md  # Deployment guide
```

## Subscription Plans

- **Free Trial**: 3 estimates
- **Hobby Plan** ($9/month): 50 estimates per month
- **Pro Plan** ($29/month): Unlimited estimates + API access
- **Enterprise**: Custom pricing, unlimited API calls, SLA

## API Usage

API access is available for Pro and Enterprise plans:

```bash
# Get estimate via API
curl -X POST https://api.travelcost.app/api/estimate \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "distance": 500,
    "region": "ontario",
    "days": 3,
    "includeHotel": true,
    "hotelNights": 2
  }'
```

## Development Status

- ✅ OpenSaaS foundation setup
- ✅ Basic travel estimation calculator
- ✅ Docker Compose deployment configuration
- ⏳ Full travel wizard implementation
- ⏳ Stripe payment integration
- ⏳ API documentation site

## License

Copyright © 2024 Travel Cost Estimator. All rights reserved.