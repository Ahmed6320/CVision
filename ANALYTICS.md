# CVision Analytics & Monitoring Guide

## 📊 Built-in Analytics

CVision includes built-in analytics tables and views in the database:

### Activity Logging
Every action is logged for auditing and analytics:
- User signups
- CV creations and updates
- Template selections
- Payment transactions
- Admin actions
- API calls (optional)

```sql
-- View activity logs
SELECT action, COUNT(*) as count, DATE(created_at) as date
FROM activity_log
GROUP BY action, DATE(created_at)
ORDER BY date DESC;
```

### Revenue Analytics
Track revenue across all dimensions:

```sql
-- Daily revenue
SELECT DATE(created_at) as date, plan, COUNT(*) as transactions, SUM(amount) as revenue
FROM transactions
WHERE status = 'completed'
GROUP BY DATE(created_at), plan
ORDER BY date DESC;

-- Plan conversion rates
SELECT plan, COUNT(*) as upgrades, 
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM transactions
WHERE status = 'completed'
GROUP BY plan;

-- Monthly recurring revenue (MRR)
SELECT plan, SUM(amount) as mrr
FROM transactions
WHERE status = 'completed' AND plan IN ('pro', 'premium')
AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', NOW())
GROUP BY plan;
```

### User Metrics

```sql
-- User growth
SELECT DATE(created_at) as signup_date, COUNT(*) as new_users
FROM users
WHERE banned = false
GROUP BY DATE(created_at)
ORDER BY signup_date DESC;

-- Plan distribution
SELECT plan, COUNT(*) as users, 
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2) as percentage
FROM users
WHERE banned = false
GROUP BY plan
ORDER BY users DESC;

-- User engagement
SELECT 
  u.id, u.email, u.plan,
  COUNT(DISTINCT c.id) as cv_count,
  COUNT(DISTINCT a.action) as actions,
  MAX(a.created_at) as last_activity
FROM users u
LEFT JOIN cvs c ON u.id = c.user_id
LEFT JOIN activity_log a ON u.id = a.user_id
WHERE u.banned = false
GROUP BY u.id, u.email, u.plan
ORDER BY last_activity DESC;
```

---

## 🔍 Error Tracking (Sentry)

Add comprehensive error tracking to catch bugs before users report them.

### Setup

1. **Sign up**
   - Go to sentry.io
   - Create account
   - Create new project (React + Node.js)
   - Copy DSN

2. **Frontend Integration**

```javascript
// In CVision.jsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.VITE_ENVIRONMENT || 'development',
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});

// Wrap root component
export default Sentry.withProfiler(CVision);
```

3. **Backend Integration**

```javascript
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    nodeProfilingIntegration(),
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.OnUncaughtException(),
  ],
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
});

app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.errorHandler());
```

### Tracking Custom Events

```javascript
// Frontend
Sentry.captureEvent({
  message: 'CV created',
  level: 'info',
  tags: {
    template: templateId,
    plan: userPlan,
  },
});

// Backend
Sentry.captureMessage('Payment processed', 'info', {
  tags: { plan: 'pro', amount: 9 },
});
```

---

## 📈 Product Analytics (PostHog)

Track user behavior and feature adoption.

### Setup

1. **Sign up**
   - Go to posthog.com
   - Create account
   - Get API key

2. **Frontend Integration**

```bash
npm install posthog-js
```

```javascript
import posthog from 'posthog-js'

posthog.init(
  import.meta.env.VITE_POSTHOG_KEY,
  {
    api_host: 'https://us.i.posthog.com',
    loaded: (ph) => {
      if (import.meta.env.VITE_ENVIRONMENT === 'development') {
        ph.disable()
      }
    }
  }
)

// Track events
posthog.capture('cv_created', {
  template: templateId,
  plan: userPlan,
})

posthog.identify(userId, {
  email: userEmail,
  plan: userPlan,
  signup_date: createdAt,
})
```

3. **Backend Integration**

```bash
npm install posthog
```

```javascript
import { PostHog } from 'posthog'

const posthog = new PostHog(
  process.env.POSTHOG_API_KEY,
  {
    host: 'https://us.i.posthog.com',
  }
)

// Track backend events
posthog.capture({
  distinctId: userId,
  event: 'payment_completed',
  properties: {
    plan: 'pro',
    amount: 9,
    interval: 'month',
  },
})
```

---

## 💬 Session Recording (Fullstory)

See exactly how users interact with your app.

### Setup

1. **Sign up**
   - Go to fullstory.com
   - Create account
   - Get org ID

2. **Install**

```html
<!-- In index.html head -->
<script>
  window['_fs_namespace'] = 'FS';
  (function(m,n,e,t,l,o,g,y){
    g=m[n]=m[n]||{_queue:[],_config:{},identify:function(i,x){i={'_getUID':function(){return o}};this._queue.push(['identify',i,x])},setUserVars:function(x){this._queue.push(['setUserVars',[x]])},event:function(i,x){this._queue.push(['event',[i],x])},shutdown:function(){this._queue.push(['shutdown'])},_.STARTED=new Date;
    try{e=encodeURIComponent(document.domain);l=0;o=localStorage.getItem('fs.uid');t='https://'+e+'.fullstory.com/s/fs.js';if(self==top){y=function(r){if(r)return;try{m.location='about:blank';}}};setTimeout(function(){var rn=function(){};try{o?(g.identify(o),g.setUserVars({displayName:o})):g.identify(false);g.event('page',{url:t});if(e.match(/:/)){y(1);g.shutdown()}}catch(e){setTimeout(rn,1000)}},1000);load=function(r){var d=document;var ifs=[d.getElementsByTagName('script')[0]];(function(t){function s(fn){eval(fn)}s(r);if(window._fs_start==undefined){setTimeout(t,100)}})(function t(){i++;if(i>20){return}if(d.readyState=='interactive'||d.readyState=='complete'){for(var r in ifs){var s=d.createElement('iframe');s.style.display='none';d.parentElement.insertBefore(s,d);try{var u='js-agent-'+i;FS.identify(u);s.src='//'+e+'.fullstory.com/guardian/'+u;}}else{setTimeout(t,100)}}});};setTimeout(function(){(function(){var t=d.createElement('script');t.type='text/javascript';t.async=!0;t.crossOrigin='anonymous';t.src='//'+e+'.fullstory.com/s/fs.js';d.getElementsByTagName('head')[0].appendChild(t);load(t.responseText)})()},1)
  })(window,FS||[],encodeURIComponent,location.hostname.split('.'),undefined,'fs-uid',undefined);
</script>

<script>
  window._fs_debug = false;
  window._fs_host = 'fullstory.com';
  window._fs_org = 'YOUR_ORG_ID';
  window._fs_namespace = 'FS';
</script>
```

---

## 📊 Google Analytics 4

Track traffic, conversions, and user journeys.

### Setup

```bash
npm install @react-ga/core @react-ga/react-router
```

```javascript
import ReactGA from 'react-ga4'

ReactGA.initialize(import.meta.env.VITE_GA_ID)

// Track page views
const handleNavigation = (page) => {
  ReactGA.pageview('/' + page)
  nav(page)
}

// Track events
const handleCVCreate = () => {
  ReactGA.event({
    category: 'CV',
    action: 'create',
    label: templateId,
  })
}

// Track conversions
const handlePayment = () => {
  ReactGA.event({
    category: 'ecommerce',
    action: 'purchase',
    value: amount,
    currency: 'USD',
  })
}
```

---

## 🔔 Uptime Monitoring (Uptime Robot)

Get alerts if your site goes down.

### Setup

1. Go to uptimerobot.com
2. Create account
3. Add monitors:
   - Frontend: `https://cvision.io`
   - API: `https://api.cvision.io/health`
4. Set alerts to email

---

## 📈 Database Performance Monitoring

Monitor query performance and optimize slow queries.

### Slow Query Log

```sql
-- Enable slow query log (PostgreSQL)
ALTER SYSTEM SET log_min_duration_statement = 1000; -- 1 second
SELECT pg_reload_conf();

-- View slow queries
SELECT query, calls, mean_exec_time, max_exec_time
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;

-- Find missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1
ORDER BY abs(correlation);
```

### Connection Pool Monitoring

```javascript
// In server.js
setInterval(() => {
  console.log({
    idleCount: pool.idleCount,
    totalCount: pool.totalCount,
    waitingCount: pool.waitingCount,
  });
}, 60000);
```

---

## 🎯 Key Metrics to Track

### Business Metrics
- **Monthly Recurring Revenue (MRR)** - Sum of all active subscriptions
- **Churn Rate** - % of customers who cancel each month
- **Customer Acquisition Cost (CAC)** - Total marketing spend / new customers
- **Lifetime Value (LTV)** - Average revenue per customer / churn rate
- **Conversion Rate** - % of free users who upgrade

### Product Metrics
- **Daily Active Users (DAU)** - Users who create/edit CVs
- **Template Popularity** - Which templates are most used
- **Feature Adoption** - % using AI writer, job match, etc.
- **Time to First CV** - How long before users create first CV
- **Session Duration** - Average time spent per visit

### Technical Metrics
- **API Latency** - Response times for endpoints
- **Error Rate** - % of requests that fail
- **Database Query Time** - Average query duration
- **PDF Generation Time** - Client-side rendering performance
- **Server Uptime** - % of time service is available

---

## 📋 Sample Analytics Dashboard Queries

```sql
-- Real-time stats
SELECT 
  (SELECT COUNT(*) FROM users WHERE banned = false) as total_users,
  (SELECT COUNT(*) FROM cvs) as total_cvs,
  (SELECT COUNT(DISTINCT user_id) FROM cvs) as active_users,
  (SELECT SUM(amount) FROM transactions WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE) as today_revenue,
  (SELECT COUNT(*) FROM transactions WHERE status = 'completed' AND DATE(created_at) = CURRENT_DATE) as today_transactions;

-- Plan breakdown
SELECT 
  plan,
  COUNT(*) as count,
  ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 1) as percentage,
  (SELECT SUM(amount) FROM transactions t WHERE t.plan = u.plan AND status = 'completed') as revenue
FROM users u
WHERE banned = false
GROUP BY plan;

-- Signup funnel
SELECT 
  DATE(created_at) as date,
  COUNT(*) as signups,
  (SELECT COUNT(*) FROM cvs c WHERE DATE(c.created_at) = DATE(u.created_at)) as cvs_created,
  (SELECT COUNT(*) FROM transactions t WHERE DATE(t.created_at) = DATE(u.created_at) AND status = 'completed') as conversions
FROM users u
WHERE DATE(created_at) >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

---

## 🚨 Alert Setup

Set up alerts for critical metrics:

```javascript
// Backend - Monitor MRR
async function checkMRR() {
  const result = await pool.query(`
    SELECT SUM(amount) as mrr FROM transactions 
    WHERE status = 'completed' AND plan IN ('pro', 'premium')
  `);
  
  const mrr = result.rows[0].mrr || 0;
  
  if (mrr < 5000) {
    await sendAlert('⚠️ MRR below $5000: $' + mrr, 'admin@cvision.io');
  }
}

// Monitor error rate
async function checkErrorRate() {
  const errors = await pool.query(`
    SELECT COUNT(*) as count FROM activity_log 
    WHERE action = 'error' AND created_at > NOW() - INTERVAL '1 hour'
  `);
  
  if (errors.rows[0].count > 50) {
    await sendAlert('🚨 High error rate detected', 'admin@cvision.io');
  }
}

// Monitor API latency
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 2000) {
      console.warn(`Slow endpoint: ${req.method} ${req.path} (${duration}ms)`);
    }
  });
  next();
});
```

---

## 📱 Mobile Analytics

Track mobile app usage separately:

```javascript
// Client-side
const isMobile = window.innerWidth < 640;

posthog.identify(userId, {
  device_type: isMobile ? 'mobile' : 'desktop',
  device_os: navigator.userAgent,
})

// Track mobile-specific events
if (isMobile) {
  posthog.capture('mobile_builder_opened')
}
```

---

## 💾 Data Export & Reporting

Generate monthly reports:

```javascript
export async function generateMonthlyReport(year, month) {
  const report = {
    generated_at: new Date().toISOString(),
    period: `${year}-${String(month).padStart(2, '0')}`,
    
    // Users
    new_users: await query(`SELECT COUNT(*) FROM users WHERE YEAR_MONTH(created_at) = ?`, [year, month]),
    active_users: await query(`SELECT COUNT(DISTINCT user_id) FROM activity_log WHERE YEAR_MONTH(created_at) = ?`),
    churn: await query(`SELECT COUNT(DISTINCT user_id) FROM transactions WHERE plan = 'free' AND YEAR_MONTH(created_at) = ?`),
    
    // Revenue
    mrr: await query(`SELECT SUM(amount) FROM transactions WHERE status = 'completed' AND YEAR_MONTH(created_at) = ?`),
    arr: await query(`SELECT SUM(amount) * 12 FROM transactions WHERE status = 'completed' AND YEAR_MONTH(created_at) = ?`),
    
    // CVs
    cvs_created: await query(`SELECT COUNT(*) FROM cvs WHERE YEAR_MONTH(created_at) = ?`),
    templates_used: await query(`SELECT template_id, COUNT(*) as count FROM cvs WHERE YEAR_MONTH(created_at) = ? GROUP BY template_id`),
  };
  
  return report;
}
```

---

## 📊 Visualizations

Recommended tools for dashboards:
- **Metabase** - Self-hosted BI tool
- **Superset** - Open-source analytics
- **Grafana** - Time-series visualization
- **Tableau** - Enterprise BI (expensive)
- **Google Data Studio** - Free, integrated with GA

---

That's complete! You now have a production analytics setup ready to track every metric that matters for your SaaS.
