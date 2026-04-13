# CVision Deployment Guide

Complete step-by-step guide to deploy CVision from development to production.

## 📋 Pre-Deployment Checklist

- [ ] Node.js 18+ installed
- [ ] GitHub account with repo
- [ ] Stripe account (live keys)
- [ ] Anthropic API key
- [ ] Supabase account
- [ ] Vercel account
- [ ] Railway account
- [ ] Domain name (optional but recommended)

## 🔧 Step 1: Prepare Your Code

### 1.1 Create GitHub Repository

```bash
# Initialize git
git init
git add .
git commit -m "Initial CVision commit"

# Create repo on GitHub and push
git remote add origin https://github.com/yourusername/cvision.git
git branch -M main
git push -u origin main
```

### 1.2 Update Environment Variables

**Frontend (.env.local)**
```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_API_URL=https://api.cvision.io
```

**Backend (.env)**
```
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host/cvision
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
JWT_SECRET=generate-random-32-char-string
ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
FRONTEND_URL=https://cvision.io
```

## 📦 Step 2: Set Up Database (Supabase)

### 2.1 Create Supabase Project

1. Go to supabase.com
2. Click "New project"
3. Fill in:
   - Name: `cvision`
   - Password: Generate strong password
   - Region: Closest to your users
4. Click "Create new project"

### 2.2 Run Database Schema

1. Go to "SQL Editor" in Supabase dashboard
2. Click "+ New query"
3. Copy entire schema.sql file
4. Paste into SQL editor
5. Click "Run"

### 2.3 Get Connection String

1. Go to "Settings" → "Database"
2. Copy "Connection string"
3. Replace `[YOUR-PASSWORD]` with actual password
4. Format: `postgresql://postgres:[password]@[host]:5432/postgres`
5. Save for backend deployment

### 2.4 Create Tables

Verify all tables created:
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';
```

Should show: users, cvs, transactions, promo_codes, templates, etc.

## 💳 Step 3: Configure Stripe

### 3.1 Get Live API Keys

1. Go to stripe.com/dashboard
2. Settings → API Keys
3. Copy "Secret key" (starts with `sk_live_`)
4. Copy "Publishable key" (starts with `pk_live_`)

### 3.2 Create Products & Prices

**Product 1: Pro Plan**
- Name: Pro Plan
- Price: $9.00/month
- Billing interval: Monthly
- Copy Price ID (starts with `price_`)

**Product 2: Premium Plan**
- Name: Premium Plan
- Price: $29.00/month
- Billing interval: Monthly
- Copy Price ID

**Product 3: Lifetime**
- Name: Lifetime Access
- Price: $99.00
- Billing interval: One-time payment
- Copy Price ID

### 3.3 Create Webhook

1. Settings → Webhooks
2. Click "+ Add endpoint"
3. URL: `https://api.cvision.io/api/webhook`
4. Events: `checkout.session.completed`
5. Copy "Signing secret" (starts with `whsec_`)

### 3.4 Create Promo Codes

**Coupon: EXIT30**
- Discount: 30% off
- Duration: Forever
- Product: Pro Plan

**Coupon: LAUNCH50**
- Discount: 50% off
- Duration: 30 days
- Product: Pro Plan

**Coupon: STUDENT25**
- Discount: 25% off
- Product: Pro Plan

## 🚀 Step 4: Deploy Frontend (Vercel)

### 4.1 Connect GitHub to Vercel

1. Go to vercel.com
2. Sign up / Log in with GitHub
3. Click "Import Project"
4. Select your cvision repository
5. Vercel auto-detects Vite

### 4.2 Set Environment Variables

In Vercel dashboard → Settings → Environment Variables:

```
VITE_ANTHROPIC_API_KEY=sk-ant-api03-xxxxx
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxx
VITE_API_URL=https://api.cvision.io
```

### 4.3 Deploy

1. Click "Deploy"
2. Wait ~2 minutes for build
3. Your frontend is live at `https://[project].vercel.app`
4. Or connect custom domain in Settings → Domains

### 4.4 Verify Deployment

- Visit `https://[project].vercel.app`
- Should see CVision landing page
- Try signing up
- Check browser console for API errors

## 🔌 Step 5: Deploy Backend (Railway)

### 5.1 Connect GitHub to Railway

1. Go to railway.app
2. Sign up / Log in with GitHub
3. Click "Create new project"
4. Select "GitHub Repo"
5. Select cvision repository
6. Select `./backend-package.json` as package.json
7. Railway auto-detects Node.js

### 5.2 Set Environment Variables

In Railway → Project → Variables:

```
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
JWT_SECRET=xxxxx-xxxxx-xxxxx
ANTHROPIC_API_KEY=sk-ant-api03-...
FRONTEND_URL=https://your-frontend.vercel.app
```

### 5.3 Deploy

1. Railway automatically deploys when you push to main
2. View logs: Railway dashboard → Logs
3. Your backend is live at `https://[railway-domain].up.railway.app`

### 5.4 Test Backend

```bash
# Test health check
curl https://[railway-domain].up.railway.app/api/health

# Should return: {"status":"ok"}
```

## 🌐 Step 6: Setup Custom Domain (Optional)

### 6.1 Buy Domain

1. Go to namecheap.com or godaddy.com
2. Search `cvision.io` (or your domain)
3. Buy domain (~$12/year)

### 6.2 Point to Vercel (Frontend)

1. Vercel dashboard → Settings → Domains
2. Add domain: `cvision.io`
3. Vercel gives you nameservers (or CNAME)
4. Update domain registrar DNS settings
5. Wait 24h for propagation

### 6.3 Create Subdomain for Backend

1. Create `api.cvision.io` subdomain
2. Point to Railway domain via CNAME
3. Update backend `FRONTEND_URL` to `https://cvision.io`
4. Update frontend `VITE_API_URL` to `https://api.cvision.io`

### 6.4 SSL Certificate

- Vercel: Auto HTTPS (included)
- Railway: Auto HTTPS (included)

## 🔐 Step 7: Security Setup

### 7.1 Enable Environment Variable Protection

**Vercel:**
- Settings → Security → Sensitive env vars
- Mark as "Sensitive"

**Railway:**
- Project → Variables → Mark sensitive variables

### 7.2 Configure CORS

In server.js, update CORS:
```javascript
app.use(cors({
  origin: ['https://cvision.io', 'https://www.cvision.io'],
  credentials: true,
}));
```

### 7.3 Set Stripe Webhook IP

Stripe → Settings → Webhooks → Allowed IP addresses
- Add Railway server IP
- Or leave blank for all IPs

### 7.4 Enable Rate Limiting

Add to backend:
```bash
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);
```

## 📊 Step 8: Monitoring & Analytics

### 8.1 Set Up Error Tracking (Optional)

**Sentry for Error Monitoring:**
```bash
npm install @sentry/node @sentry/tracing
```

**Frontend (CVision.jsx):**
```javascript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "https://xxxxx@xxxxx.ingest.sentry.io/xxxxx",
  environment: "production",
  tracesSampleRate: 0.1,
});
```

**Backend (server.js):**
```javascript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: "production",
});
```

### 8.2 Set Up Logging

**Railway Logs:**
- Built-in, view in dashboard

**Vercel Logs:**
- Built-in, view in dashboard

### 8.3 Monitor Performance

- Vercel: Analytics tab
- Railway: Metrics tab
- Stripe: Revenue dashboard
- Supabase: Database usage

## ✅ Step 9: Post-Deployment Testing

### 9.1 Frontend Tests

```bash
# Test landing page
https://cvision.io

# Test sign up
Sign up with any email

# Test admin access
admin@test.com password

# Test CV builder
Create new CV with AI Writer

# Test PDF download
Try downloading CV
```

### 9.2 Backend Tests

```bash
# Test API health
curl https://api.cvision.io/api/health

# Test authentication
curl -X POST https://api.cvision.io/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'

# Test Stripe webhook simulation
stripe trigger checkout.session.completed \
  --stripe-api-key sk_live_xxxxx
```

### 9.3 Payment Tests

1. Go to cvision.io/pricing
2. Click "Get Started" on Pro plan
3. Use test card: 4242 4242 4242 4242
4. Expiry: 12/25, CVV: 123
5. Check Stripe dashboard for payment

## 🎯 Step 10: Launch Checklist

- [ ] Frontend deployed and accessible
- [ ] Backend deployed and responding
- [ ] Database connected and working
- [ ] Stripe payments processing
- [ ] Claude API integration working
- [ ] SSL certificate active
- [ ] Error tracking configured
- [ ] Admin dashboard accessible
- [ ] Email notifications working
- [ ] Backups scheduled

## 📞 Troubleshooting

### Frontend Won't Load
```bash
# Check build logs
vercel logs [project-name]

# Check .env variables are set
# Check API URL points to correct backend
```

### Backend Not Responding
```bash
# Check Railway logs
# Check DATABASE_URL is correct
# Test connection: psql [DATABASE_URL]
```

### Payment Fails
```bash
# Verify STRIPE_SECRET_KEY
# Check webhook endpoint registered
# Review Stripe logs for errors
```

### Database Connection Error
```bash
# Test connection string
psql [DATABASE_URL]

# Check firewall allows connections
# Verify Supabase IP whitelist
```

## 🚀 Performance Optimization

### Frontend
- Vercel Edge Caching: Enabled by default
- Image optimization: Use Next.js Image (future)
- Bundle size: Monitor with `npm run build`

### Backend
- Database indexes: Already in schema.sql
- Query optimization: Use `.explain()` in PostgreSQL
- Connection pooling: Configured in server.js

### Database
- Backups: Supabase auto-backups daily
- Replication: Enable in Supabase Settings

## 📈 Scaling for Growth

As you grow:

1. **Database**: Upgrade Supabase plan
2. **Backend**: Increase Railway resources
3. **Frontend**: Vercel handles auto-scaling
4. **Payments**: Stripe handles volume
5. **AI API**: Monitor Claude usage, adjust quota

## 🎉 You're Live!

Your production CVision is now live and ready for users!

**Next Steps:**
1. Share with beta users
2. Monitor dashboards daily
3. Iterate based on feedback
4. Launch marketing campaign
5. Plan Phase 2 roadmap

---

**Questions?** Check GitHub Discussions or email support@cvision.io
