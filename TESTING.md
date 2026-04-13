# CVision Testing & QA Guide

## 🧪 Testing Setup

### Unit Testing (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

**vitest.config.js**
```javascript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
  },
})
```

**vitest.setup.js**
```javascript
import '@testing-library/jest-dom'
```

### Test Examples

**tests/utils.test.js**
```javascript
import { describe, it, expect } from 'vitest'

describe('CV Validation', () => {
  it('validates email format', () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('user@example.com')
    expect(isValid).toBe(true)
  })
  
  it('rejects invalid email', () => {
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test('invalid-email')
    expect(isValid).toBe(false)
  })
})

describe('Plan Features', () => {
  it('free plan has 2 templates', () => {
    expect(PLANS.free.tpl).toBe(2)
  })
  
  it('pro plan has AI features', () => {
    expect(PLANS.pro.ai).toBe(true)
  })
})

describe('CV Scoring', () => {
  it('validates ATS score between 0-100', () => {
    const score = 85
    expect(score).toBeGreaterThanOrEqual(0)
    expect(score).toBeLessThanOrEqual(100)
  })
})
```

**tests/components.test.jsx**
```javascript
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'

describe('Button Component', () => {
  it('renders button with text', () => {
    const { Btn } = require('../CVision')
    render(<Btn>Click Me</Btn>)
    expect(screen.getByText('Click Me')).toBeInTheDocument()
  })
  
  it('calls onClick handler', () => {
    let clicked = false
    const { Btn } = require('../CVision')
    render(<Btn onClick={() => clicked = true}>Click</Btn>)
    fireEvent.click(screen.getByText('Click'))
    expect(clicked).toBe(true)
  })
  
  it('disables button when disabled prop is true', () => {
    const { Btn } = require('../CVision')
    render(<Btn disabled>Disabled</Btn>)
    expect(screen.getByText('Disabled')).toBeDisabled()
  })
})
```

### Run Tests

```bash
# Run all tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage report
npm run test -- --coverage
```

---

## Backend Testing

**tests/api.test.js**
```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import fetch from 'node-fetch'

const API_URL = 'http://localhost:5000'

describe('Auth API', () => {
  let token
  
  it('signs up new user', async () => {
    const res = await fetch(`${API_URL}/api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123'
      })
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.user.email).toBe('test@example.com')
    expect(data.token).toBeDefined()
    token = data.token
  })
  
  it('logs in user', async () => {
    const res = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'TestPassword123'
      })
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.token).toBeDefined()
  })
})

describe('CV API', () => {
  it('creates CV', async () => {
    const res = await fetch(`${API_URL}/api/cv/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        cv: {
          personal: { name: 'John Doe', title: 'Engineer' },
          experience: [],
          education: [],
          skills: [],
          languages: [],
          certifications: []
        },
        templateId: 'T0',
        name: 'Test CV'
      })
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.cv.name).toBe('Test CV')
  })
  
  it('retrieves user CVs', async () => {
    const res = await fetch(`${API_URL}/api/cv/list`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(Array.isArray(data.cvs)).toBe(true)
  })
})

describe('Payments API', () => {
  it('creates checkout session', async () => {
    const res = await fetch(`${API_URL}/api/checkout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ plan: 'pro' })
    })
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.sessionId).toBeDefined()
  })
})
```

---

## Manual Testing Checklist

### Authentication Flow
- [ ] Sign up with new email
- [ ] Login with correct password
- [ ] Reject login with wrong password
- [ ] Admin access with admin@... email
- [ ] Logout clears user data

### CV Builder
- [ ] Create new CV
- [ ] Fill in personal info
- [ ] Add experience entry
- [ ] Add education entry
- [ ] Add skills/languages
- [ ] Save CV to dashboard
- [ ] Edit existing CV
- [ ] Delete CV

### Templates
- [ ] View all 20 templates
- [ ] Free users see lock on pro templates
- [ ] Pro users can select all templates
- [ ] Template preview updates color
- [ ] Selected template loads in builder

### AI Tools
- [ ] AI Writer generates CV from description
- [ ] CV Score analyzes and shows grade
- [ ] Job Match accepts description
- [ ] Match keywords highlighted
- [ ] Cover Letter generates (pro only)

### Payments
- [ ] View all pricing plans
- [ ] Click upgrade button
- [ ] Test Stripe form with 4242 card
- [ ] Payment completes
- [ ] Plan changes to paid
- [ ] Promo codes apply discount
- [ ] Receipt sent via email

### Admin Dashboard
- [ ] View total users count
- [ ] View revenue chart
- [ ] Ban/unban user
- [ ] Change user plan
- [ ] View promo codes

### Responsive Design
- [ ] Mobile (iPhone 12): All screens responsive
- [ ] Tablet (iPad): Layout adjusts
- [ ] Desktop (1920x1080): Full layout
- [ ] Mobile menu opens/closes

### Performance
- [ ] Page loads in <3 seconds
- [ ] PDF export completes in <5 seconds
- [ ] AI generation completes in <10 seconds
- [ ] Payment form responsive

### Browser Compatibility
- [ ] Chrome latest
- [ ] Safari latest
- [ ] Firefox latest
- [ ] Edge latest

---

## Automated Testing Script

**test-runner.sh**
```bash
#!/bin/bash

echo "🧪 Running CVision Test Suite..."

# Unit tests
echo "📋 Running unit tests..."
npm run test

if [ $? -ne 0 ]; then
  echo "❌ Unit tests failed!"
  exit 1
fi

# Start servers
echo "🚀 Starting test servers..."
npm run dev &
FRONTEND_PID=$!

cd backend
npm run dev &
BACKEND_PID=$!

# Wait for servers to start
sleep 5

# API tests
echo "🔌 Running API tests..."
npm run test:api

if [ $? -ne 0 ]; then
  echo "❌ API tests failed!"
  kill $FRONTEND_PID $BACKEND_PID
  exit 1
fi

# E2E tests
echo "🎯 Running E2E tests..."
npm run test:e2e

if [ $? -ne 0 ]; then
  echo "❌ E2E tests failed!"
  kill $FRONTEND_PID $BACKEND_PID
  exit 1
fi

# Cleanup
kill $FRONTEND_PID $BACKEND_PID

echo "✅ All tests passed!"
```

---

## Debugging Guide

### Frontend Debugging

**Browser DevTools**
```javascript
// In CVision.jsx
if (import.meta.env.VITE_DEBUG === 'true') {
  window.__cvision__ = {
    state: { user, cv, screen },
    actions: { nav, setCv, setUser }
  }
}

// In browser console:
// __cvision__.state
// __cvision__.actions.nav('builder')
```

**Common Issues**

Issue: "API endpoint returns 401"
```javascript
// Check token
console.log('Token:', localStorage.getItem('auth_token'))

// Check request headers
fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

Issue: "CV not saving"
```javascript
// Debug CV data
console.log('CV before save:', JSON.stringify(cv, null, 2))

// Check API response
try {
  const res = await fetch('/api/cv/save', {
    method: 'POST',
    body: JSON.stringify({ cv, templateId, name })
  })
  console.log('Response:', await res.json())
} catch (e) {
  console.error('Save error:', e)
}
```

### Backend Debugging

**Logging**
```javascript
// Add debug middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`)
  console.log('Headers:', req.headers)
  console.log('Body:', req.body)
  next()
})

// Log database queries
const originalQuery = pool.query.bind(pool)
pool.query = function(sql, params) {
  console.log('Query:', sql, 'Params:', params)
  return originalQuery(sql, params)
}
```

**Common Issues**

Issue: "Cannot connect to database"
```bash
# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check pool status
console.log(pool)
```

Issue: "Stripe webhook not firing"
```javascript
// Check webhook registration
console.log('Webhook URL:', process.env.WEBHOOK_URL)

// Log webhook events
app.post('/api/webhook', (req, res) => {
  console.log('Webhook received:', req.body.type)
  // ...
})

// Test webhook manually
curl -X POST http://localhost:5000/api/webhook \
  -H "stripe-signature: test" \
  -d '{"type":"checkout.session.completed"}'
```

---

## Production Monitoring

### Error Tracking (Sentry)

```javascript
// Track error rates
Sentry.captureException(error)

// Query error dashboard
// Navigate to sentry.io/issues
```

### Uptime Monitoring

```bash
# Manual uptime check
curl -f https://cvision.io/api/health || echo "Site down!"

# Automated (UptimeRobot)
# Create monitor for https://cvision.io
# Set alert to your email
```

### Performance Monitoring

```javascript
// Page load time
const navigationTiming = performance.getEntriesByType('navigation')[0]
console.log('Load time:', navigationTiming.loadEventEnd - navigationTiming.fetchStart)

// API response time
const start = performance.now()
const res = await fetch('/api/cv/list')
const duration = performance.now() - start
console.log(`API took ${duration}ms`)
```

---

## Load Testing

**artillery-config.yml**
```yaml
config:
  target: 'https://api.cvision.io'
  phases:
    - duration: 60
      arrivalRate: 10
      name: 'Warm up'
    - duration: 120
      arrivalRate: 50
      name: 'Ramp up'
    - duration: 60
      arrivalRate: 100
      name: 'Peak'

scenarios:
  - name: 'User journey'
    flow:
      - post:
          url: '/api/auth/signup'
          json:
            email: 'user{{ $uuid }}@test.com'
            password: 'TestPassword123'
      - post:
          url: '/api/cv/save'
          json:
            cv:
              personal:
                name: 'Test User'
                title: 'Engineer'
      - get:
          url: '/api/cv/list'
```

```bash
# Install
npm install -D artillery

# Run load test
npx artillery run artillery-config.yml
```

---

## Security Testing

### OWASP Top 10 Checklist

- [ ] **Injection**: Use parameterized queries (✓ in schema)
- [ ] **Broken Auth**: JWT tokens, password hashing (✓ implemented)
- [ ] **Sensitive Data**: HTTPS only, no logs with PII (✓ with Vercel/Railway)
- [ ] **XML/XXE**: No XML parsing (✓ not used)
- [ ] **Broken Access Control**: Admin role checks (✓ in endpoints)
- [ ] **Security Misconfiguration**: Remove debug mode, secure headers (✓)
- [ ] **XSS**: Content escaping, CSP headers (✓ in React)
- [ ] **Deserialization**: Validate JSON input (✓)
- [ ] **Vulnerable Dependencies**: npm audit (run regularly)
- [ ] **Logging**: Audit trail (✓ activity_log table)

### Run Security Audit

```bash
# Check for vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check dependencies
npm ls

# Update dependencies
npm update
```

---

## Database Testing

### Data Integrity

```sql
-- Check data consistency
SELECT COUNT(*) as users FROM users;
SELECT COUNT(*) as cvs FROM cvs;
SELECT COUNT(*) FROM cvs WHERE user_id NOT IN (SELECT id FROM users);

-- Duplicate check
SELECT email, COUNT(*) FROM users GROUP BY email HAVING COUNT(*) > 1;

-- Orphaned records
SELECT * FROM cvs WHERE user_id NOT IN (SELECT id FROM users);
```

### Query Performance

```sql
-- Analyze slow queries
EXPLAIN ANALYZE SELECT * FROM cvs WHERE user_id = 1;

-- Check indexes
SELECT * FROM pg_stat_user_indexes;

-- Add missing indexes
CREATE INDEX idx_cvs_user_plan ON cvs(user_id) WHERE status = 'active';
```

---

## Deployment Testing

### Pre-deployment Checklist

```bash
# 1. Build test
npm run build

# 2. Test build output
npm run preview

# 3. Environment check
echo $VITE_ANTHROPIC_API_KEY  # Should not be empty

# 4. Database migration
node migrate.js up

# 5. Run tests
npm run test

# 6. Code quality
npm run lint

# 7. Build size
ls -lh dist/
```

### Post-deployment Verification

```bash
# Check site is live
curl -f https://cvision.io

# Check API is running
curl -f https://api.cvision.io/health

# Check Stripe integration
curl -f https://api.cvision.io/api/checkout \
  -X POST \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"plan":"pro"}'

# Monitor error rate
# Check Sentry dashboard for first 30 minutes
```

---

## Quality Gates

Set minimum standards before shipping:

```bash
# Test coverage > 80%
npm run test -- --coverage

# No critical vulnerabilities
npm audit --audit-level=moderate

# Build size < 100KB gzipped
# Lighthouse score > 90
# API response time < 200ms
```

These testing practices ensure CVision is reliable, secure, and performant for your users!
