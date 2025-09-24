# Lowther Listening Circle

A referral and commission tracking system for Lowther Loudspeakers.

## Features

- **User Management**: Advocate/Ambassador tiers with commission tracking
- **Admin Dashboard**: User approval, tier management, commission payments
- **Knowledge Base**: FAQ system powered by Google Sheets
- **Email Integration**: Magic link authentication and admin notifications via Resend
- **Referral Tracking**: Click tracking and commission attribution

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with email magic links
- **Styling**: Tailwind CSS with custom dark theme
- **Email**: Resend API
- **Deployment**: Vercel

## Environment Variables

### Required for Production

```bash
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://your-domain.vercel.app"
NEXTAUTH_SECRET="strong-random-secret"

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="onboarding@lowtherlisteningcircle.com"
```

### Optional

```bash
# Admin credentials (defaults to peter@lowtherloudspeakers.com / warpwarp)
ADMIN_EMAIL="peter@lowtherloudspeakers.com"
ADMIN_PASSWORD="warpwarp"
ADMIN_NOTIFY_EMAIL="peter@lowtherloudspeakers.com"

# Google Sheets (Knowledge Base)
GOOGLE_SHEETS_ID="1fnnEkTz5MVEZzKzAiZ1Hvcp1k_ChD1g6P0fXI_8a6D4"
GOOGLE_SHEETS_API_KEY="AIzaSy..."

# Webflow Integration
WEBFLOW_FORM_SECRET="your-webflow-secret"
AUTO_PROVISION_FROM_WEBFLOW="false"
```

## Deployment to Vercel

1. **Push to GitHub**: Ensure your code is in a GitHub repository
2. **Connect to Vercel**: Import the repository in Vercel dashboard
3. **Set Environment Variables**: Add all required env vars in Vercel project settings
4. **Deploy**: Vercel will automatically deploy on every push to main

### Vercel Environment Variables Setup

In your Vercel project settings → Environment Variables, add:

**Required:**
- `DATABASE_URL` - Your PostgreSQL connection string
- `NEXTAUTH_URL` - Your Vercel domain (e.g., `https://your-app.vercel.app`)
- `NEXTAUTH_SECRET` - Generate a strong random string
- `RESEND_API_KEY` - Your Resend API key
- `EMAIL_FROM` - Verified sender email in Resend

**Optional:**
- `GOOGLE_SHEETS_ID` - For Knowledge Base functionality
- `GOOGLE_SHEETS_API_KEY` - For Knowledge Base functionality
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` - Custom admin credentials
- `ADMIN_NOTIFY_EMAIL` - Override admin notification email

## Development

```bash
# Install dependencies
npm install

# Set up environment
cp env.example .env.local
# Edit .env.local with your values

# Set up database
npx prisma generate
npx prisma db push

# Run development server
npm run dev
```

## Database Schema

The system uses PostgreSQL with the following key models:

- **User**: Members, advocates, ambassadors with referral codes
- **Click**: Referral link tracking
- **Order**: Sales attribution and commission calculation
- **CommissionLedger**: Commission payment tracking

## Commission Structure

- **Advocates**: 10% commission on direct sales
- **Ambassadors**: 15% commission on direct sales + 5% from advocate sales
- **Admin**: Can approve users, change tiers, and pay commissions

## Security Notes

- Admin credentials are configurable via environment variables
- Magic link authentication eliminates password security concerns
- All sensitive operations require authentication
- Production logs are minimized for security# Force Vercel redeploy Wed Sep 24 11:49:38 CDT 2025
# Vercel deployment trigger
