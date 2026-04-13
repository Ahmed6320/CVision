# CVision Advanced Features Roadmap

## Phase 2: Authentication & Real Backend

### Supabase Real Auth
Replace mock login with Supabase authentication:

```javascript
// supabase-client.js
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)

export async function signUp(email, password) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { redirectTo: 'https://cvision.io/auth/callback' }
  })
  return { data, error }
}

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { data, error }
}

export function onAuthStateChange(callback) {
  return supabase.auth.onAuthStateChange(callback)
}
```

### Password Reset Flow

```javascript
// Add to Auth screen
const handleForgotPassword = async (email) => {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://cvision.io/reset-password'
  })
}

// Reset password confirmation
const handleResetPassword = async (newPassword) => {
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })
}
```

---

## Interview Simulator

AI-powered mock interviews using Claude:

```javascript
// Add to AI Tools tab
const [interviewMode, setInterviewMode] = useState(false)
const [question, setQuestion] = useState('')
const [answer, setAnswer] = useState('')
const [feedback, setFeedback] = useState('')

async function generateInterviewQuestion() {
  const prompt = `You are an experienced recruiter conducting a ${cv.personal.title} interview. Ask a thoughtful behavioral question based on this CV: ${JSON.stringify(cv.personal)}. Keep it to one question.`
  const response = await callClaude(prompt)
  setQuestion(response)
}

async function evaluateAnswer() {
  const prompt = `As a recruiter, evaluate this interview answer to the question "${question}": "${answer}". Provide constructive feedback and a score 1-10.`
  const response = await callClaude(prompt)
  setFeedback(response)
}
```

UI Component:
```jsx
{tab === 'interview' && (
  <div>
    <h2>Interview Simulator</h2>
    <p>Practice with AI interviewer</p>
    
    {!interviewMode ? (
      <Btn full onClick={() => setInterviewMode(true)}>Start Mock Interview</Btn>
    ) : (
      <>
        <Card style={{ marginBottom: '24px' }}>
          <div style={{ fontSize: '16px', color: COLORS.text, marginBottom: '24px' }}>{question}</div>
          <Inp 
            label="Your Answer"
            rows={6}
            value={answer}
            onChange={setAnswer}
            placeholder="Speak naturally..."
          />
          <Btn full onClick={evaluateAnswer}>Get Feedback</Btn>
        </Card>
        
        {feedback && (
          <Card>
            <h3>Feedback</h3>
            <p style={{ color: COLORS.muted }}>{feedback}</p>
          </Card>
        )}
      </>
    )}
  </div>
)}
```

---

## Recruiter Network

Connect users with recruiters:

### Database Changes
```sql
CREATE TABLE recruiters (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  company VARCHAR(255),
  title VARCHAR(255),
  specialties VARCHAR(500),
  verified BOOLEAN DEFAULT false,
  rating DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE recruiter_matches (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  recruiter_id INTEGER REFERENCES recruiters(id),
  match_score DECIMAL(3,2),
  contacted BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, recruiter_id)
);
```

### API Endpoints
```javascript
// Get matched recruiters
app.get('/api/recruiters/matches', authenticateToken, async (req, res) => {
  const result = await pool.query(`
    SELECT r.*, rm.match_score
    FROM recruiters r
    JOIN recruiter_matches rm ON r.id = rm.recruiter_id
    WHERE rm.user_id = $1
    ORDER BY rm.match_score DESC
  `, [req.user.id])
  res.json({ recruiters: result.rows })
})

// Contact recruiter
app.post('/api/recruiters/contact/:id', authenticateToken, async (req, res) => {
  const { message } = req.body
  // Send email notification to recruiter
  // Update contacted status
})
```

### UI Screen
```javascript
{screen === 'recruiters' && user && (
  <div>
    <h1>Recruiter Network</h1>
    <p>Connect with recruiters looking for your skills</p>
    
    {recruiters.map((r) => (
      <Card key={r.id} style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontWeight: '600', marginBottom: '4px' }}>{r.title}</div>
            <div style={{ fontSize: '12px', color: COLORS.muted }}>{r.company}</div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: COLORS.blue }}>
              {r.specialties}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '700', color: COLORS.gold }}>
              {(r.match_score * 100).toFixed(0)}%
            </div>
            <Btn v="primary" onClick={() => contactRecruiter(r.id)}>Contact</Btn>
          </div>
        </div>
      </Card>
    ))}
  </div>
)}
```

---

## 50+ Templates

Expand from 20 to 50+ professional templates:

```javascript
const EXTENDED_TEMPLATES = [
  // Existing 20...
  
  // Creative templates
  { id: 'T20', name: 'Creative', plan: 'pro', color: '#FF006E' },
  { id: 'T21', name: 'Design', plan: 'pro', color: '#00D4AA' },
  
  // Industry-specific
  { id: 'T22', name: 'Tech', plan: 'pro', color: '#5B8DEF' },
  { id: 'T23', name: 'Medical', plan: 'pro', color: '#4ADE80' },
  { id: 'T24', name: 'Finance', plan: 'premium', color: '#C9A84C' },
  { id: 'T25', name: 'Academic', plan: 'premium', color: '#A78BFA' },
  
  // Modern styles
  { id: 'T26', name: 'Minimal', plan: 'pro', color: '#1A1A2E' },
  { id: 'T27', name: 'Bold', plan: 'pro', color: '#EF233C' },
  { id: 'T28', name: 'Elegant', plan: 'premium', color: '#2B4162' },
  
  // With icons/graphics
  { id: 'T29', name: 'Infographic', plan: 'premium', color: '#F77F00' },
  { id: 'T30', name: 'Timeline', plan: 'pro', color: '#0077B6' },
  // ... add 20 more
]
```

Each template needs custom layout component:
```javascript
// TemplateT20 component
function TemplateCreative({ cv, color }) {
  return (
    <div style={{ /* Creative layout */ }}>
      {/* Custom design for creative template */}
    </div>
  )
}

// Add to builder
const templates = {
  'T20': TemplateCreative,
  'T21': TemplateDesign,
  // ... more
}
```

---

## CV Import from PDF/LinkedIn

### LinkedIn Integration
```javascript
// Frontend
async function importFromLinkedIn() {
  // Use LinkedIn API
  const response = await fetch('https://api.linkedin.com/v2/me', {
    headers: { 'Authorization': `Bearer ${linkedinAccessToken}` }
  })
  const profile = await response.json()
  
  // Map LinkedIn data to CV format
  const cv = {
    personal: {
      name: profile.localizedFirstName + ' ' + profile.localizedLastName,
      // ... map other fields
    },
    experience: profile.experience.map(e => ({
      company: e.company.localizedName,
      role: e.title,
      startDate: e.startDate,
      // ...
    })),
  }
  
  setCv(cv)
}
```

### PDF Import
```bash
npm install pdfjs-dist pdf-parse
```

```javascript
import * as pdfjsLib from 'pdfjs-dist'

async function importFromPDF(file) {
  const pdf = await pdfjsLib.getDocument(file).promise
  let text = ''
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    text += content.items.map(item => item.str).join(' ')
  }
  
  // Use Claude to parse
  const prompt = `Extract CV information from this text: ${text}. Return JSON matching this structure: ${JSON.stringify(BLANK_CV)}`
  const result = await callClaude(prompt)
  const parsed = JSON.parse(result)
  setCv(parsed)
}
```

UI:
```javascript
<div>
  <Inp 
    type="file" 
    accept=".pdf"
    onChange={(e) => importFromPDF(e.target.files[0])}
  />
  <Btn onClick={importFromLinkedIn}>Import from LinkedIn</Btn>
</div>
```

---

## Team/Agency Plans

Multiple CVs per account:

### Database
```sql
CREATE TABLE teams (
  id SERIAL PRIMARY KEY,
  owner_id INTEGER REFERENCES users(id),
  name VARCHAR(255),
  members_limit INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_members (
  id SERIAL PRIMARY KEY,
  team_id INTEGER REFERENCES teams(id),
  user_id INTEGER REFERENCES users(id),
  role VARCHAR(50), -- 'admin', 'editor', 'viewer'
  UNIQUE(team_id, user_id)
);
```

### Plan Additions
```javascript
const PLANS = {
  // ... existing plans
  team: {
    name: 'Team',
    price: 49,
    team_size: 10,
    ai: true,
    shared_templates: true,
    admin_dashboard: true,
    stripePriceId: 'price_team'
  }
}
```

---

## Email Notifications

Already set up (see email-templates.js):
- Welcome email
- Payment receipt
- CV score notifications
- Job match alerts
- Upgrade reminders

To enable:
```javascript
// In server.js
import { sendEmail, emailTemplates } from './email-templates.js'

// After signup
await sendEmail(emailTemplates.welcome(user.email, user.name))

// After payment
await sendEmail(emailTemplates.paymentSuccess(
  user.email, user.name, plan, amount, invoiceId
))

// After CV scoring
await sendEmail(emailTemplates.cvScoreNotification(
  user.email, user.name, score, grade, atsScore
))
```

---

## Arabic RTL Support

Add RTL language support:

```javascript
// In CVision component
const [language, setLanguage] = useState('en')
const isRTL = language === 'ar'

// Strings
const strings = {
  en: {
    title: 'CVision',
    subtitle: 'See Your Career Clearly',
  },
  ar: {
    title: 'سيفيجن',
    subtitle: 'انظر إلى حياتك المهنية بوضوح',
  }
}

// Apply RTL to templates
{screen === 'builder' && (
  <div style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
    {/* Template content */}
  </div>
)}

// Add language selector to navbar
<select onChange={(e) => setLanguage(e.target.value)}>
  <option value="en">English</option>
  <option value="ar">العربية</option>
</select>
```

---

## Real-time Notifications

WebSocket notifications for real-time updates:

```javascript
// Backend
import { WebSocketServer } from 'ws'

const wss = new WebSocketServer({ port: 8080 })

wss.on('connection', (ws) => {
  ws.on('message', (message) => {
    const data = JSON.parse(message)
    
    // Notify other users/admin
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'notification',
          data: data
        }))
      }
    })
  })
})

// Frontend
const ws = new WebSocket('wss://api.cvision.io/ws')

ws.onmessage = (event) => {
  const { type, data } = JSON.parse(event.data)
  if (type === 'notification') {
    setToastMsg(data.message)
  }
}
```

---

## Dark Mode for Free Users

Expand dark mode to all users:

```javascript
// Simplified version
const [darkMode, setDarkMode] = useState(
  localStorage.getItem('darkMode') === 'true'
)

useEffect(() => {
  localStorage.setItem('darkMode', darkMode)
}, [darkMode])

// Remove plan restriction
{PF(user.plan).dark && (
  // Change to:
  // Always available for all users
)}
```

---

## Advanced CV Customization

Font and styling options:

```javascript
const [cvStyle, setCvStyle] = useState({
  fontFamily: 'DM Sans',
  fontSize: 14,
  lineHeight: 1.6,
  margin: 40,
  accentColor: COLORS.gold,
})

// Font selector
<select onChange={(e) => setCvStyle({ ...cvStyle, fontFamily: e.target.value })}>
  <option>DM Sans</option>
  <option>Cormorant Garamond</option>
  <option>Raleway</option>
  <option>Lato</option>
</select>

// Apply to template
const TemplatePreview = ({ cv, style }) => (
  <div style={{
    fontFamily: style.fontFamily,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
  }}>
    {/* CV content */}
  </div>
)
```

---

## API Rate Limiting & Quotas

Per-user rate limits:

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: (req, res) => {
    const plan = req.user.plan
    const limits = {
      free: 10,
      pro: 100,
      premium: 500,
      lifetime: 1000,
    }
    return limits[plan] || 10
  },
  keyGenerator: (req) => req.user.id,
})

app.use('/api/', limiter)
```

---

## Webhook Management

Allow users to subscribe to events:

```sql
CREATE TABLE webhooks (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  url VARCHAR(500),
  events VARCHAR(255), -- 'cv_created', 'cv_scored', 'payment'
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

```javascript
// Trigger webhook
async function triggerWebhook(userId, event, data) {
  const webhooks = await pool.query(
    'SELECT url FROM webhooks WHERE user_id = $1 AND active = true',
    [userId]
  )
  
  for (const webhook of webhooks.rows) {
    fetch(webhook.url, {
      method: 'POST',
      body: JSON.stringify({ event, data, timestamp: new Date() }),
      headers: { 'X-Webhook-Signature': generateSignature(data) }
    })
  }
}
```

---

## Advanced Reporting

Generate professional reports:

```javascript
async function generateComprehensiveReport(userId, dateRange) {
  const user = await getUser(userId)
  const cvs = await getUserCVs(userId)
  const scores = await getCVScores(userId)
  const matches = await getJobMatches(userId)
  
  return {
    user: {
      email: user.email,
      plan: user.plan,
      joinDate: user.created_at,
    },
    summary: {
      totalCVs: cvs.length,
      averageScore: scores.reduce((a, b) => a + b) / scores.length,
      jobMatches: matches.length,
    },
    details: {
      cvs,
      scores,
      matches,
      recommendations: generateRecommendations(scores, matches),
    }
  }
}
```

---

## Two-Factor Authentication (2FA)

Add 2FA for extra security:

```bash
npm install speakeasy qrcode
```

```javascript
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

// Generate 2FA secret
async function setup2FA(email) {
  const secret = speakeasy.generateSecret({
    name: `CVision (${email})`,
    issuer: 'CVision',
  })
  
  const qr = await QRCode.toDataURL(secret.otpauth_url)
  return { secret: secret.base32, qr }
}

// Verify 2FA
function verify2FA(secret, token) {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: 2,
  })
}
```

---

## Performance Optimization

### Frontend Optimization
- Code splitting by route
- Image compression
- CSS-in-JS optimization
- Component memoization

### Backend Optimization
- Database query caching (Redis)
- API response caching
- Connection pooling
- Database indexing

```javascript
import Redis from 'redis'

const redis = Redis.createClient(process.env.REDIS_URL)

// Cache user CVs
app.get('/api/cv/list', async (req, res) => {
  const cacheKey = `cvs:${req.user.id}`
  const cached = await redis.get(cacheKey)
  
  if (cached) {
    return res.json({ cvs: JSON.parse(cached) })
  }
  
  const cvs = await pool.query(...)
  await redis.setex(cacheKey, 3600, JSON.stringify(cvs.rows))
  res.json({ cvs: cvs.rows })
})
```

---

## Testing Suite

Add automated testing:

```bash
npm install --save-dev vitest @testing-library/react
```

```javascript
// __tests__/CVision.test.jsx
import { render, screen } from '@testing-library/react'
import CVision from '../CVision'

describe('CVision', () => {
  it('renders landing page', () => {
    render(<CVision />)
    expect(screen.getByText('See Your Career Clearly')).toBeInTheDocument()
  })
  
  it('navigates to pricing', () => {
    render(<CVision />)
    const pricingBtn = screen.getByText('View Pricing')
    fireEvent.click(pricingBtn)
    // assert navigation
  })
})
```

---

These advanced features can be added incrementally based on user feedback and business priorities. Start with the most requested features first!
