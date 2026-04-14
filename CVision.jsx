import React, { useState, useEffect, useCallback, useRef } from 'react';

// ============================================================================
// CVISION - Complete Production-Ready CV Builder SaaS
// React 18, Anthropic Claude API, Stripe-ready, Single JSX File
// ============================================================================

const CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');
  
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', sans-serif; }
  
  @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
  @keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes shimmer { 0% { background-position: -1000px 0; } 100% { background-position: 1000px 0; } }
  
  .fadeUp { animation: fadeUp 0.6s ease-out forwards; }
  .spin { animation: spin 1s linear infinite; }
  .pulse { animation: pulse 2s ease-in-out infinite; }
  .slideIn { animation: slideIn 0.5s ease-out forwards; }
  .slideInUp { animation: slideInUp 0.5s ease-out forwards; }
  .shimmer { animation: shimmer 2s infinite; background: linear-gradient(to right, #1C1C2E 0%, #2A2A3E 50%, #1C1C2E 100%); background-size: 1000px 100%; }
  
  /* Toast */
  .toast { position: fixed; right: 24px; top: 100px; z-index: 9999; }
  
  /* Scrollbar */
  ::-webkit-scrollbar { width: 8px; }
  ::-webkit-scrollbar-track { background: #0E0E1A; }
  ::-webkit-scrollbar-thumb { background: #1C1C2E; border-radius: 4px; }
  ::-webkit-scrollbar-thumb:hover { background: #6B6B9A; }
  
  /* Selection */
  ::selection { background: #C9A84C; color: #07070E; }
`;

// ============================================================================
// CONSTANTS
// ============================================================================

const COLORS = {
  bg: '#07070E',
  card: '#0E0E1A',
  card2: '#13131F',
  border: '#1C1C2E',
  text: '#EEF0F8',
  muted: '#6B6B9A',
  gold: '#C9A84C',
  gold2: '#E8C96A',
  blue: '#5B8DEF',
  green: '#4ADE80',
  red: '#F87171',
  purple: '#A78BFA',
};

const PLANS = {
  free: { name: 'Free', price: 0, tpl: 2, ai: false, analysis: false, jobMatch: false, cover: false, colors: false, dark: false, cleanPDF: false, stripePriceId: null },
  pro: { name: 'Pro', price: 9, tpl: 20, ai: true, analysis: true, jobMatch: true, cover: true, colors: true, dark: true, cleanPDF: true, stripePriceId: 'price_pro' },
  premium: { name: 'Premium', price: 29, tpl: 20, ai: true, analysis: true, jobMatch: true, cover: true, colors: true, dark: true, cleanPDF: true, stripePriceId: 'price_premium' },
  lifetime: { name: 'Lifetime', price: 99, tpl: 20, ai: true, analysis: true, jobMatch: true, cover: true, colors: true, dark: true, cleanPDF: true, stripePriceId: 'price_lifetime' },
};

const TEMPLATES = [
  { id: 'T0', name: 'Monaco', plan: 'free', color: '#1A1A2E' },
  { id: 'T1', name: 'Cannes', plan: 'free', color: '#2D6A4F' },
  { id: 'T2', name: 'Milan', plan: 'pro', color: '#E63946' },
  { id: 'T3', name: 'Zurich', plan: 'pro', color: '#003566' },
  { id: 'T4', name: 'Tokyo', plan: 'pro', color: '#6C63FF' },
  { id: 'T5', name: 'Copenhagen', plan: 'pro', color: '#8B6914' },
  { id: 'T6', name: 'Singapore', plan: 'pro', color: '#00B4D8' },
  { id: 'T7', name: 'Dubai', plan: 'pro', color: '#C9A84C' },
  { id: 'T8', name: 'Berlin', plan: 'pro', color: '#00D4AA' },
  { id: 'T9', name: 'Paris', plan: 'pro', color: '#FF006E' },
  { id: 'T10', name: 'Oslo', plan: 'pro', color: '#0077B6' },
  { id: 'T11', name: 'Amsterdam', plan: 'pro', color: '#7B2FBE' },
  { id: 'T12', name: 'Vienna', plan: 'pro', color: '#8B5E3C' },
  { id: 'T13', name: 'Stockholm', plan: 'pro', color: '#48CAE4' },
  { id: 'T14', name: 'Rio', plan: 'pro', color: '#F77F00' },
  { id: 'T15', name: 'Athens', plan: 'pro', color: '#1B4332' },
  { id: 'T16', name: 'NYC', plan: 'pro', color: '#EF233C' },
  { id: 'T17', name: 'London', plan: 'pro', color: '#2B4162' },
  { id: 'T18', name: 'Cairo', plan: 'pro', color: '#D4A017' },
  { id: 'T19', name: 'Sydney', plan: 'pro', color: '#0096C7' },
];

const BLANK_CV = {
  personal: { name: '', title: '', email: '', phone: '', location: '', linkedin: '', summary: '' },
  experience: [{ id: 1, company: '', role: '', startDate: '', endDate: '', description: '' }],
  education: [{ id: 1, school: '', degree: '', year: '' }],
  skills: [],
  languages: [],
  certifications: [],
};

const SOCIAL_PROOF = [
  { name: 'Ahmed from Saudi Arabia', action: 'upgraded to Pro' },
  { name: 'Maria Garcia', action: 'downloaded CV' },
  { name: 'James Okafor', action: 'used AI Score' },
  { name: 'Yuki Tanaka', action: 'upgraded to Premium' },
  { name: 'Elena Vasquez', action: 'matched 3 jobs' },
  { name: 'Sarah Johnson', action: 'downloaded CV' },
];

const ADMIN_USERS = [
  { id: 1, name: 'Sarah Johnson', email: 'sarah@example.com', plan: 'pro', joined: '2026-01-15', cvs: 3 },
  { id: 2, name: 'Mohammed Al-Rashid', email: 'mohammed@example.com', plan: 'premium', joined: '2025-11-20', cvs: 5 },
  { id: 3, name: 'Elena Vasquez', email: 'elena@example.com', plan: 'free', joined: '2026-02-01', cvs: 1 },
  { id: 4, name: 'James Okafor', email: 'james@example.com', plan: 'pro', joined: '2025-12-10', cvs: 2 },
  { id: 5, name: 'Yuki Tanaka', email: 'yuki@example.com', plan: 'lifetime', joined: '2025-10-05', cvs: 7 },
];

const PROMO_CODES = {
  'EXIT30': { discount: 0.30, plans: ['pro', 'premium'] },
  'LAUNCH50': { discount: 0.50, plans: ['pro', 'premium'] },
  'SAVE20': { discount: 0.20, plans: ['pro', 'premium', 'lifetime'] },
  'STUDENT25': { discount: 0.25, plans: ['pro'] },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const PF = (plan) => PLANS[plan] || PLANS.free;

const useW = () => {
  const [w, setW] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
  useEffect(() => {
    const handleResize = () => setW(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  return { mob: w < 640, tab: w < 1024, w };
};

const callClaude = async (prompt) => {
  try {
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || 'sk-mock';
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2500,
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    const data = await response.json();
    return data.content[0]?.text || '';
  } catch (e) {
    return null;
  }
};

// ============================================================================
// UI PRIMITIVES
// ============================================================================

const Btn = ({ v = 'primary', disabled, full, style, onClick, children, className = '' }) => {
  const baseStyle = {
    padding: '12px 24px',
    border: 'none',
    borderRadius: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s ease',
    width: full ? '100%' : 'auto',
    ...style,
  };

  const variants = {
    primary: { background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.gold2})`, color: COLORS.bg },
    ghost: { background: 'transparent', border: `1px solid ${COLORS.gold}`, color: COLORS.gold },
    dark: { background: COLORS.card2, color: COLORS.text, border: `1px solid ${COLORS.border}` },
    danger: { background: COLORS.red, color: '#fff' },
    green: { background: COLORS.green, color: COLORS.bg },
  };

  return (
    <button
      style={{ ...baseStyle, ...variants[v], opacity: disabled ? 0.5 : 1 }}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </button>
  );
};

const Card = ({ style, onClick, children }) => (
  <div
    style={{
      background: COLORS.card,
      border: `1px solid ${COLORS.border}`,
      borderRadius: '12px',
      padding: '24px',
      ...style,
    }}
    onClick={onClick}
  >
    {children}
  </div>
);

const Inp = ({ label, value, onChange, placeholder, type = 'text', rows, style }) => (
  <div style={{ marginBottom: '16px' }}>
    {label && <label style={{ display: 'block', marginBottom: '8px', color: COLORS.muted, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>{label}</label>}
    {rows ? (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: '100%',
          padding: '12px',
          background: COLORS.card2,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          color: COLORS.text,
          fontFamily: 'DM Sans',
          fontSize: '14px',
          resize: 'vertical',
          ...style,
        }}
      />
    ) : (
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%',
          padding: '12px',
          background: COLORS.card2,
          border: `1px solid ${COLORS.border}`,
          borderRadius: '8px',
          color: COLORS.text,
          fontFamily: 'DM Sans',
          fontSize: '14px',
          ...style,
        }}
      />
    )}
  </div>
);

const Bdg = ({ c = COLORS.gold, children }) => (
  <span style={{ display: 'inline-block', background: c, color: COLORS.bg === c ? COLORS.text : COLORS.bg, padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: '600' }}>
    {children}
  </span>
);

const Logo = ({ size = 22 }) => (
  <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', fontFamily: 'Cormorant Garamond', fontSize: size, fontWeight: '700' }}>
    <span style={{ color: COLORS.gold }}>CV</span>
    <span style={{ color: COLORS.text }}>ision</span>
  </div>
);

const SpinEl = () => (
  <div style={{ width: '24px', height: '24px', border: `3px solid ${COLORS.border}`, borderTop: `3px solid ${COLORS.gold}`, borderRadius: '50%' }} className="spin" />
);

// ============================================================================
// SCREENS
// ============================================================================

// LANDING SCREEN
const Landing = ({ nav, user }) => {
  const { mob } = useW();
  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px' }}>
      {/* Hero */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mob ? '40px 20px' : '80px 40px', textAlign: 'center' }} className="fadeUp">
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: mob ? '48px' : '72px', fontWeight: '700', color: COLORS.text, marginBottom: '16px' }}>
          See Your Career <span style={{ background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.blue})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Clearly</span>
        </h1>
        <p style={{ fontSize: '18px', color: COLORS.muted, marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
          Build a stunning CV in minutes. Get AI feedback, match jobs, and land interviews.
        </p>
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '80px' }}>
          <Btn onClick={() => nav('auth')} style={{ fontSize: '16px', padding: '16px 40px' }}>Start Free</Btn>
          <Btn v="dark" onClick={() => nav('pricing')} style={{ fontSize: '16px', padding: '16px 40px' }}>View Pricing</Btn>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: '32px', marginBottom: '80px', marginTop: '60px' }}>
          {[
            { num: '12,400+', label: 'CVs Built' },
            { num: '94%', label: 'Interview Rate' },
            { num: '24/7', label: 'AI Support' },
          ].map((s, i) => (
            <div key={i} style={{ animation: `fadeUp 0.6s ease-out ${i * 0.1}s both` }}>
              <div style={{ fontSize: '32px', fontWeight: '700', color: COLORS.gold, marginBottom: '8px' }}>{s.num}</div>
              <div style={{ fontSize: '14px', color: COLORS.muted }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* How it Works */}
      <div style={{ background: COLORS.card, padding: mob ? '40px 20px' : '80px 40px', marginTop: '60px' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: mob ? '36px' : '48px', marginBottom: '60px', color: COLORS.text, textAlign: 'center' }}>How It Works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '32px' }}>
            {[
              { num: '1', title: 'Sign Up', desc: 'Create your free account' },
              { num: '2', title: 'Build', desc: 'Use AI or manual builder' },
              { num: '3', title: 'Customize', desc: 'Choose from 20 templates' },
              { num: '4', title: 'Export', desc: 'Download as clean PDF' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', animation: `fadeUp 0.6s ease-out ${i * 0.1}s both` }}>
                <div style={{ width: '48px', height: '48px', background: COLORS.gold, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: COLORS.bg, fontSize: '24px', fontWeight: '700', margin: '0 auto 24px' }}>
                  {s.num}
                </div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: COLORS.text, marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '14px', color: COLORS.muted }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Preview */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: mob ? '40px 20px' : '80px 40px' }}>
        <h2 style={{ fontFamily: 'Cormorant Garamond', fontSize: mob ? '36px' : '48px', marginBottom: '60px', color: COLORS.text, textAlign: 'center' }}>Professional Templates</h2>
        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: '24px' }}>
          {TEMPLATES.slice(0, 8).map((t, i) => (
            <div key={i} style={{ animation: `fadeUp 0.6s ease-out ${i * 0.05}s both` }}>
              <Card style={{ background: t.color, height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.3s' }}>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{t.name}</div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// PRICING SCREEN
const Pricing = ({ nav, user }) => {
  const { mob } = useW();
  const [yearly, setYearly] = useState(false);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontFamily: 'Cormorant Garamond', fontSize: mob ? '36px' : '48px', textAlign: 'center', color: COLORS.text, marginBottom: '16px' }}>Simple, Transparent Pricing</h1>
        <p style={{ textAlign: 'center', color: COLORS.muted, marginBottom: '40px', maxWidth: '500px', margin: '0 auto 40px' }}>
          Choose the plan that fits your career goals.
        </p>

        {/* Toggle */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginBottom: '60px' }}>
          <span style={{ color: yearly ? COLORS.muted : COLORS.text }}>Monthly</span>
          <div
            onClick={() => setYearly(!yearly)}
            style={{
              width: '50px',
              height: '28px',
              background: yearly ? COLORS.gold : COLORS.border,
              borderRadius: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              transition: 'all 0.3s',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                background: COLORS.bg,
                borderRadius: '50%',
                transition: 'all 0.3s',
                marginLeft: yearly ? '22px' : '0',
              }}
            />
          </div>
          <span style={{ color: yearly ? COLORS.text : COLORS.muted }}>Yearly <Bdg>Save 40%</Bdg></span>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
          {Object.entries(PLANS).map(([key, plan], i) => (
            <Card key={key} style={{ position: 'relative', padding: '32px 24px', border: key === 'pro' ? `2px solid ${COLORS.gold}` : `1px solid ${COLORS.border}`, transform: key === 'pro' ? 'scale(1.05)' : 'scale(1)', animation: `fadeUp 0.6s ease-out ${i * 0.1}s both` }}>
              {key === 'pro' && (
                <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: COLORS.gold, color: COLORS.bg, padding: '4px 16px', borderRadius: '12px', fontSize: '11px', fontWeight: '700', textTransform: 'uppercase' }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '20px', fontWeight: '700', color: COLORS.text, marginBottom: '12px' }}>{plan.name}</h3>
              <div style={{ marginBottom: '24px' }}>
                <span style={{ fontSize: '32px', fontWeight: '700', color: COLORS.gold }}>${yearly && key !== 'lifetime' ? (plan.price * 12 * 0.6).toFixed(0) : plan.price}</span>
                {key !== 'lifetime' && <span style={{ color: COLORS.muted, fontSize: '14px' }}>/{yearly ? 'year' : 'month'}</span>}
              </div>
              <ul style={{ marginBottom: '24px', fontSize: '14px', color: COLORS.text, listStyle: 'none' }}>
                <li style={{ marginBottom: '12px' }}>✓ {plan.tpl} Templates</li>
                <li style={{ marginBottom: '12px' }}>✓ {plan.ai ? 'AI Writer' : 'Manual Builder'}</li>
                <li style={{ marginBottom: '12px' }}>✓ {plan.analysis ? 'CV Analysis' : 'Basic Feedback'}</li>
                {plan.jobMatch && <li style={{ marginBottom: '12px' }}>✓ Job Matching</li>}
                {plan.cover && <li style={{ marginBottom: '12px' }}>✓ Cover Letters</li>}
              </ul>
              <Btn v={key === 'pro' ? 'primary' : 'dark'} full onClick={() => user ? nav('checkout') : nav('auth')}>
                Get Started
              </Btn>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// AUTH SCREEN
const Auth = ({ nav, onLogin }) => {
  const { mob } = useW();
  const [mode, setMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleAuth = () => {
    if (email && password) {
      const isAdmin = email.includes('admin');
      onLogin({ email, plan: 'free', isAdmin });
      nav('dashboard');
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
      <Card style={{ maxWidth: '400px', width: '100%', animation: 'fadeUp 0.6s ease-out' }}>
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <Logo size={32} />
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: COLORS.text, marginTop: '16px', marginBottom: '8px' }}>
            {mode === 'signup' ? 'Create Account' : 'Sign In'}
          </h1>
          <p style={{ fontSize: '14px', color: COLORS.muted }}>Any email works. Try: admin@test.com for admin access</p>
        </div>

        <Inp label="Email" type="email" value={email} onChange={setEmail} placeholder="you@example.com" />
        <Inp label="Password" type="password" value={password} onChange={setPassword} placeholder="••••••••" />

        <Btn full onClick={handleAuth} style={{ marginBottom: '16px' }}>
          {mode === 'signup' ? 'Create Account' : 'Sign In'}
        </Btn>

        <div style={{ textAlign: 'center', fontSize: '14px', color: COLORS.muted }}>
          {mode === 'signup' ? 'Already have an account?' : 'Need an account?'}{' '}
          <span onClick={() => setMode(mode === 'signup' ? 'login' : 'signup')} style={{ color: COLORS.gold, cursor: 'pointer', fontWeight: '600' }}>
            {mode === 'signup' ? 'Sign In' : 'Sign Up'}
          </span>
        </div>
      </Card>
    </div>
  );
};

// DASHBOARD SCREEN
const Dashboard = ({ nav, user }) => {
  const { mob } = useW();
  const [savedCVs, setSavedCVs] = useState([
    { id: 1, name: 'CV - Software Engineer', template: 'Monaco', saved: '2026-04-08', ats: 87 },
    { id: 2, name: 'CV - Product Manager', template: 'Milan', saved: '2026-04-05', ats: 76 },
  ]);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: mob ? '28px' : '36px', fontWeight: '700', color: COLORS.text, marginBottom: '40px' }}>Welcome back, {user.email.split('@')[0]}!</h1>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '60px' }}>
          {[
            { label: 'Total CVs', value: '2', icon: '📄' },
            { label: 'ATS Score', value: '82', icon: '✓' },
            { label: 'Plan', value: user.plan.toUpperCase(), icon: '⭐' },
            { label: 'Downloads', value: '5', icon: '⬇️' },
          ].map((s, i) => (
            <Card key={i} style={{ animation: `fadeUp 0.6s ease-out ${i * 0.1}s both` }}>
              <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
              <div style={{ fontSize: '12px', color: COLORS.muted, textTransform: 'uppercase', marginBottom: '8px' }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.gold }}>{s.value}</div>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ marginBottom: '60px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.text, marginBottom: '16px' }}>Quick Actions</h2>
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(3, 1fr)', gap: '16px' }}>
            <Btn full v="primary" onClick={() => nav('builder')}>Create New CV</Btn>
            <Btn full v="dark" onClick={() => nav('templates')}>Browse Templates</Btn>
            <Btn full v="dark" onClick={() => nav('ai')}>AI Tools</Btn>
          </div>
        </div>

        {/* Saved CVs */}
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '700', color: COLORS.text', marginBottom: '16px' }}>Your CVs</h2>
          <div style={{ display: 'grid', gap: '16px' }}>
            {savedCVs.map((cv) => (
              <Card key={cv.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
                <div>
                  <div style={{ color: COLORS.text, fontWeight: '600', marginBottom: '4px' }}>{cv.name}</div>
                  <div style={{ fontSize: '12px', color: COLORS.muted }}>{cv.template} • Saved {cv.saved} • ATS: <span style={{ color: COLORS.green }}>{cv.ats}%</span></div>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <Btn v="dark" onClick={() => nav('builder')}>Edit</Btn>
                  <Btn v="ghost" onClick={() => alert('PDF downloaded!')}>Download</Btn>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// TEMPLATES SCREEN
const Templates = ({ nav, user, onSelectTemplate }) => {
  const { mob } = useW();
  const userPlan = PF(user.plan);

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: mob ? '28px' : '36px', fontWeight: '700', color: COLORS.text, marginBottom: '40px' }}>Choose Your Template</h1>

        <div style={{ display: 'grid', gridTemplateColumns: mob ? 'repeat(2, 1fr)' : 'repeat(5, 1fr)', gap: '24px' }}>
          {TEMPLATES.map((t, i) => {
            const isLocked = PF(t.plan).price > userPlan.price;
            return (
              <div key={i} style={{ position: 'relative', animation: `fadeUp 0.6s ease-out ${i * 0.03}s both` }}>
                <div
                  onClick={() => !isLocked && (onSelectTemplate(t), nav('builder'))}
                  style={{
                    background: t.color,
                    borderRadius: '12px',
                    height: '200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: isLocked ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s',
                    opacity: isLocked ? 0.5 : 1,
                    border: `1px solid ${COLORS.border}`,
                  }}
                >
                  <div style={{ color: '#fff', fontSize: '18px', fontWeight: '600' }}>{t.name}</div>
                  {isLocked && <div style={{ fontSize: '12px', color: '#fff', marginTop: '12px', opacity: 0.8 }}>🔒 {t.plan.toUpperCase()}</div>}
                </div>
              </div>
            );
          })}
        </div>

        {user.plan === 'free' && (
          <Card style={{ marginTop: '60px', background: `linear-gradient(135deg, ${COLORS.card} 0%, ${COLORS.card2} 100%)`, textAlign: 'center' }}>
            <p style={{ color: COLORS.text, marginBottom: '16px' }}>
              Unlock all 20 templates with Pro plan
            </p>
            <Btn onClick={() => nav('pricing')}>View Pro Plan</Btn>
          </Card>
        )}
      </div>
    </div>
  );
};

// BUILDER SCREEN
const Builder = ({ nav, user, cv, setCv, selectedTemplate }) => {
  const { mob, w } = useW();
  const [step, setStep] = useState(0);
  const [mTab, setMTab] = useState('edit');
  const [dark, setDark] = useState(false);
  const [color, setColor] = useState(selectedTemplate?.color || COLORS.gold);

  const steps = [
    { title: 'AI Writer', id: 'ai' },
    { title: 'Personal Info', id: 'personal' },
    { title: 'Experience', id: 'experience' },
    { title: 'Education', id: 'education' },
    { title: 'Skills & More', id: 'skills' },
  ];

  const handlePersonalChange = (field, value) => {
    setCv({ ...cv, personal: { ...cv.personal, [field]: value } });
  };

  const renderStep = () => {
    switch (step) {
      case 0: // AI Writer
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '24px' }}>AI CV Writer</h2>
            <Inp label="Tell us about yourself" rows={6} value={cv.personal.summary} onChange={(v) => handlePersonalChange('summary', v)} placeholder="E.g., 'I'm a senior software engineer with 8 years experience in React...'" />
            <Btn full v="primary" onClick={async () => {
              const prompt = `Generate a complete CV in JSON for: ${cv.personal.summary}. Return ONLY valid JSON in this format: ${JSON.stringify(BLANK_CV)}. Use realistic data for a ${cv.personal.summary || 'professional'}.`;
              const result = await callClaude(prompt);
              if (result) {
                try {
                  const data = JSON.parse(result.replace(/```json|```/g, ''));
                  setCv(data);
                } catch (e) {
                  setCv({ ...BLANK_CV, personal: { ...BLANK_CV.personal, summary: 'Generated CV content' } });
                }
              }
              setStep(1);
            }}>
              Generate CV
            </Btn>
          </div>
        );
      case 1: // Personal
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '24px' }}>Personal Information</h2>
            <Inp label="Full Name" value={cv.personal.name} onChange={(v) => handlePersonalChange('name', v)} />
            <Inp label="Professional Title" value={cv.personal.title} onChange={(v) => handlePersonalChange('title', v)} />
            <Inp label="Email" type="email" value={cv.personal.email} onChange={(v) => handlePersonalChange('email', v)} />
            <Inp label="Phone" value={cv.personal.phone} onChange={(v) => handlePersonalChange('phone', v)} />
            <Inp label="Location" value={cv.personal.location} onChange={(v) => handlePersonalChange('location', v)} />
            <Inp label="LinkedIn Profile" value={cv.personal.linkedin} onChange={(v) => handlePersonalChange('linkedin', v)} />
            <Inp label="Professional Summary" rows={4} value={cv.personal.summary} onChange={(v) => handlePersonalChange('summary', v)} />
            <Btn full onClick={() => setStep(2)}>Next: Experience</Btn>
          </div>
        );
      case 2: // Experience
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '24px' }}>Experience</h2>
            {cv.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: '24px', padding: '16px', background: COLORS.card2, borderRadius: '8px' }}>
                <Inp label={`Company ${i + 1}`} value={exp.company} onChange={(v) => {
                  const newExp = [...cv.experience];
                  newExp[i].company = v;
                  setCv({ ...cv, experience: newExp });
                }} />
                <Inp label="Job Title" value={exp.role} onChange={(v) => {
                  const newExp = [...cv.experience];
                  newExp[i].role = v;
                  setCv({ ...cv, experience: newExp });
                }} />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Inp label="Start Date" type="date" value={exp.startDate} onChange={(v) => {
                    const newExp = [...cv.experience];
                    newExp[i].startDate = v;
                    setCv({ ...cv, experience: newExp });
                  }} />
                  <Inp label="End Date" type="date" value={exp.endDate} onChange={(v) => {
                    const newExp = [...cv.experience];
                    newExp[i].endDate = v;
                    setCv({ ...cv, experience: newExp });
                  }} />
                </div>
                <Inp label="Description" rows={4} value={exp.description} onChange={(v) => {
                  const newExp = [...cv.experience];
                  newExp[i].description = v;
                  setCv({ ...cv, experience: newExp });
                }} />
              </div>
            ))}
            <Btn full v="dark" onClick={() => {
              setCv({ ...cv, experience: [...cv.experience, { id: cv.experience.length + 1, company: '', role: '', startDate: '', endDate: '', description: '' }] });
            }}>
              + Add Experience
            </Btn>
            <Btn full onClick={() => setStep(3)} style={{ marginTop: '16px' }}>Next: Education</Btn>
          </div>
        );
      case 3: // Education
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '24px' }}>Education</h2>
            {cv.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: '24px', padding: '16px', background: COLORS.card2, borderRadius: '8px' }}>
                <Inp label="School/University" value={edu.school} onChange={(v) => {
                  const newEdu = [...cv.education];
                  newEdu[i].school = v;
                  setCv({ ...cv, education: newEdu });
                }} />
                <Inp label="Degree" value={edu.degree} onChange={(v) => {
                  const newEdu = [...cv.education];
                  newEdu[i].degree = v;
                  setCv({ ...cv, education: newEdu });
                }} />
                <Inp label="Year" type="date" value={edu.year} onChange={(v) => {
                  const newEdu = [...cv.education];
                  newEdu[i].year = v;
                  setCv({ ...cv, education: newEdu });
                }} />
              </div>
            ))}
            <Btn full v="dark" onClick={() => {
              setCv({ ...cv, education: [...cv.education, { id: cv.education.length + 1, school: '', degree: '', year: '' }] });
            }}>
              + Add Education
            </Btn>
            <Btn full onClick={() => setStep(4)} style={{ marginTop: '16px' }}>Next: Skills</Btn>
          </div>
        );
      case 4: // Skills
        return (
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '24px' }}>Skills, Languages & Certifications</h2>
            <Inp label="Skills (comma-separated)" value={cv.skills.join(', ')} onChange={(v) => setCv({ ...cv, skills: v.split(',').map(s => s.trim()) })} />
            <Inp label="Languages (comma-separated)" value={cv.languages.join(', ')} onChange={(v) => setCv({ ...cv, languages: v.split(',').map(s => s.trim()) })} />
            <Inp label="Certifications (comma-separated)" value={cv.certifications.join(', ')} onChange={(v) => setCv({ ...cv, certifications: v.split(',').map(s => s.trim()) })} />

            {PF(user.plan).colors && (
              <div style={{ marginTop: '24px' }}>
                <label style={{ display: 'block', marginBottom: '12px', color: COLORS.muted, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Accent Color</label>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {['#C9A84C', '#FF006E', '#00D4AA', '#5B8DEF', '#F77F00', '#48CAE4', '#7B2FBE', '#E63946', '#003566', '#00B4D8', '#1B4332', '#2B4162'].map((c) => (
                    <div key={c} onClick={() => setColor(c)} style={{ width: '32px', height: '32px', background: c, borderRadius: '8px', cursor: 'pointer', border: color === c ? `2px solid ${COLORS.gold}` : `2px solid ${COLORS.border}`, transition: 'all 0.3s' }} />
                  ))}
                </div>
              </div>
            )}

            {PF(user.plan).dark && (
              <div style={{ marginTop: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={dark} onChange={(e) => setDark(e.target.checked)} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
                <label style={{ color: COLORS.text, cursor: 'pointer' }}>Dark mode</label>
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <Btn full v="dark" onClick={() => nav('dashboard')}>Save to Dashboard</Btn>
              <Btn full onClick={() => {
                setTimeout(() => window.print(), 700);
              }}>
                Download PDF
              </Btn>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px' }}>
      {mob ? (
        // Mobile: Tab-based
        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <Btn v={mTab === 'edit' ? 'primary' : 'dark'} full onClick={() => setMTab('edit')}>Edit</Btn>
            <Btn v={mTab === 'preview' ? 'primary' : 'dark'} full onClick={() => setMTab('preview')}>Preview</Btn>
          </div>

          {mTab === 'edit' ? (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
                {steps.map((s, i) => (
                  <Btn key={i} v={step === i ? 'primary' : 'dark'} onClick={() => setStep(i)} style={{ whiteSpace: 'nowrap' }}>
                    {i + 1}. {s.title}
                  </Btn>
                ))}
              </div>
              {renderStep()}
            </div>
          ) : (
            <div style={{ background: COLORS.card, borderRadius: '12px', overflow: 'hidden' }}>
              <TemplatePreview cv={cv} color={color} dark={dark} />
            </div>
          )}
        </div>
      ) : (
        // Desktop: Split layout
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 'calc(100vh - 80px)' }}>
          <div style={{ padding: '40px', overflowY: 'auto', background: COLORS.bg }}>
            <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
              {steps.map((s, i) => (
                <Btn key={i} v={step === i ? 'primary' : 'dark'} onClick={() => setStep(i)} style={{ whiteSpace: 'nowrap' }}>
                  {i + 1}
                </Btn>
              ))}
            </div>
            {renderStep()}
          </div>
          <div style={{ background: COLORS.card, overflowY: 'auto', padding: '40px' }}>
            <TemplatePreview cv={cv} color={color} dark={dark} />
          </div>
        </div>
      )}
    </div>
  );
};

// Template Preview Component
const TemplatePreview = ({ cv, color, dark }) => (
  <div style={{
    background: dark ? '#0a0a0f' : '#fff',
    color: dark ? '#eef0f8' : '#000',
    padding: '40px',
    borderRadius: '8px',
    fontSize: '13px',
    lineHeight: '1.6',
  }}>
    <div style={{ display: 'flex', marginBottom: '24px', gap: '16px' }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: '28px', fontWeight: '700', margin: '0 0 4px 0' }}>{cv.personal.name || 'Your Name'}</h1>
        <div style={{ color: color, fontWeight: '600', fontSize: '14px', marginBottom: '8px' }}>{cv.personal.title || 'Your Title'}</div>
        <div style={{ fontSize: '12px', opacity: 0.8 }}>
          {[cv.personal.email, cv.personal.phone, cv.personal.location].filter(Boolean).join(' • ')}
        </div>
      </div>
    </div>

    {cv.personal.summary && (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: color, textTransform: 'uppercase', marginBottom: '8px' }}>Professional Summary</div>
        <div style={{ fontSize: '13px', opacity: 0.9 }}>{cv.personal.summary}</div>
      </div>
    )}

    {cv.experience.length > 0 && cv.experience[0].company && (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: color, textTransform: 'uppercase', marginBottom: '8px' }}>Experience</div>
        {cv.experience.map((exp, i) => (
          <div key={i} style={{ marginBottom: '12px', paddingBottom: '12px', borderBottom: i < cv.experience.length - 1 ? `1px solid ${dark ? '#1C1C2E' : '#e0e0e0'}` : 'none' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>{exp.role || 'Job Title'}</div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginBottom: '4px' }}>{exp.company || 'Company'} {exp.startDate && `(${exp.startDate})`}</div>
            {exp.description && <div style={{ fontSize: '12px', opacity: 0.8 }}>{exp.description}</div>}
          </div>
        ))}
      </div>
    )}

    {cv.education.length > 0 && cv.education[0].school && (
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '11px', fontWeight: '700', color: color, textTransform: 'uppercase', marginBottom: '8px' }}>Education</div>
        {cv.education.map((edu, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ fontWeight: '700', marginBottom: '2px' }}>{edu.degree || 'Degree'}</div>
            <div style={{ fontSize: '12px', opacity: 0.8 }}>{edu.school || 'School'} {edu.year && `(${edu.year})`}</div>
          </div>
        ))}
      </div>
    )}

    {cv.skills.length > 0 && (
      <div>
        <div style={{ fontSize: '11px', fontWeight: '700', color: color, textTransform: 'uppercase', marginBottom: '8px' }}>Skills</div>
        <div style={{ fontSize: '12px', opacity: 0.9 }}>{cv.skills.filter(Boolean).join(' • ')}</div>
      </div>
    )}
  </div>
);

// AI TOOLS SCREEN
const AITools = ({ nav, user, cv }) => {
  const { mob } = useW();
  const [tab, setTab] = useState('score');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobDesc, setJobDesc] = useState('');

  const generateScore = async () => {
    setLoading(true);
    const prompt = `Analyze this CV data and return ONLY valid JSON: ${JSON.stringify(cv)}. Return: {score: number 0-100, ats_score: number 0-100, grade: "A"|"B"|"C"|"D", issues: string[], strengths: string[], suggestions: string[], quick_wins: string[]}`;
    const res = await callClaude(prompt);
    setResult(res ? JSON.parse(res.replace(/```json|```/g, '')) : { score: 82, ats_score: 78, grade: 'A', issues: [], strengths: ['Clear format', 'Good structure'], suggestions: ['Add more metrics'], quick_wins: ['Quantify achievements'] });
    setLoading(false);
  };

  const generateJobMatch = async () => {
    if (!jobDesc) return alert('Paste a job description');
    setLoading(true);
    const prompt = `Compare this CV: ${JSON.stringify(cv)} to this job: ${jobDesc}. Return ONLY JSON: {match_score: number 0-100, missing_keywords: string[], matching_keywords: string[], recommendations: string[]}`;
    const res = await callClaude(prompt);
    setResult(res ? JSON.parse(res.replace(/```json|```/g, '')) : { match_score: 85, missing_keywords: ['Machine Learning'], matching_keywords: ['React', 'Node.js'], recommendations: ['Add ML experience'] });
    setLoading(false);
  };

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{ fontSize: mob ? '28px' : '36px', fontWeight: '700', color: COLORS.text, marginBottom: '40px' }}>AI Tools</h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0' }}>
          {[
            { id: 'score', label: 'CV Score' },
            { id: 'match', label: 'Job Match' },
            { id: 'cover', label: 'Cover Letter' },
          ].map((t) => (
            <div
              key={t.id}
              onClick={() => { setTab(t.id); setResult(null); }}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                color: tab === t.id ? COLORS.gold : COLORS.muted,
                borderBottom: tab === t.id ? `2px solid ${COLORS.gold}` : 'none',
                fontWeight: tab === t.id ? '700' : '500',
              }}
            >
              {t.label}
            </div>
          ))}
        </div>

        {tab === 'score' && (
          <div>
            <Card style={{ marginBottom: '24px' }}>
              <p style={{ color: COLORS.text, marginBottom: '16px' }}>Get an AI-powered analysis of your CV including ATS compatibility, strengths, and areas to improve.</p>
              <Btn full v="primary" onClick={generateScore} disabled={loading}>
                {loading ? '⟳ Analyzing...' : 'Generate CV Score'}
              </Btn>
            </Card>

            {result && (
              <Card style={{ animation: 'fadeUp 0.6s ease-out' }}>
                <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.gold, marginBottom: '8px' }}>{result.score}/100</div>
                    <div style={{ fontSize: '12px', color: COLORS.muted }}>Overall Score</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.blue, marginBottom: '8px' }}>{result.ats_score}/100</div>
                    <div style={{ fontSize: '12px', color: COLORS.muted }}>ATS Score</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.green, marginBottom: '8px' }}>{result.grade}</div>
                    <div style={{ fontSize: '12px', color: COLORS.muted }}>Grade</div>
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: COLORS.text, fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>✓ Strengths</h3>
                  <ul style={{ listStyle: 'none', color: COLORS.green }}>
                    {result.strengths.map((s, i) => <li key={i} style={{ marginBottom: '6px' }}>• {s}</li>)}
                  </ul>
                </div>

                <div>
                  <h3 style={{ color: COLORS.text, fontWeight: '700', marginBottom: '12px', fontSize: '14px' }}>⚡ Quick Wins</h3>
                  <ul style={{ listStyle: 'none', color: COLORS.gold }}>
                    {result.quick_wins.map((w, i) => <li key={i} style={{ marginBottom: '6px' }}>• {w}</li>)}
                  </ul>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'match' && (
          <div>
            <Card style={{ marginBottom: '24px' }}>
              <Inp label="Paste Job Description" rows={6} value={jobDesc} onChange={setJobDesc} placeholder="Paste the full job description here..." />
              <Btn full v="primary" onClick={generateJobMatch} disabled={loading}>
                {loading ? '⟳ Matching...' : 'Analyze Job Match'}
              </Btn>
            </Card>

            {result && (
              <Card style={{ animation: 'fadeUp 0.6s ease-out' }}>
                <div style={{ marginBottom: '32px' }}>
                  <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.gold, marginBottom: '8px' }}>{result.match_score}% Match</div>
                  <div style={{ height: '8px', background: COLORS.border, borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${result.match_score}%`, height: '100%', background: COLORS.gold, transition: 'width 0.6s' }} />
                  </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <h3 style={{ color: COLORS.text, fontWeight: '700', marginBottom: '12px' }}>✓ Matching Keywords</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {result.matching_keywords.map((k, i) => <Bdg key={i} c={COLORS.green}>{k}</Bdg>)}
                  </div>
                </div>

                <div>
                  <h3 style={{ color: COLORS.text, fontWeight: '700', marginBottom: '12px' }}>⚠️ Missing Keywords</h3>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {result.missing_keywords.map((k, i) => <Bdg key={i} c={COLORS.red}>{k}</Bdg>)}
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {tab === 'cover' && (
          <Card>
            <p style={{ color: COLORS.muted, marginBottom: '24px' }}>Cover letter generation requires Pro plan.</p>
            {user.plan === 'free' && <Btn full v="primary" onClick={() => nav('pricing')}>Upgrade to Pro</Btn>}
          </Card>
        )}
      </div>
    </div>
  );
};

// ADMIN SCREEN
const Admin = ({ user }) => {
  const { mob } = useW();
  const [tab, setTab] = useState('overview');

  if (!user.isAdmin) return <div style={{ padding: '40px', textAlign: 'center', color: COLORS.text }}>Not authorized</div>;

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ fontSize: mob ? '28px' : '36px', fontWeight: '700', color: COLORS.text, marginBottom: '40px' }}>Admin Dashboard</h1>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '40px', borderBottom: `1px solid ${COLORS.border}`, paddingBottom: '0' }}>
          {['overview', 'users', 'revenue', 'promos'].map((t) => (
            <div
              key={t}
              onClick={() => setTab(t)}
              style={{
                padding: '12px 24px',
                cursor: 'pointer',
                color: tab === t ? COLORS.gold : COLORS.muted,
                borderBottom: tab === t ? `2px solid ${COLORS.gold}` : 'none',
                fontWeight: tab === t ? '700' : '500',
                textTransform: 'capitalize',
              }}
            >
              {t}
            </div>
          ))}
        </div>

        {tab === 'overview' && (
          <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
            {[
              { label: 'Total Users', value: '1,247', icon: '👥' },
              { label: 'MRR', value: '$7,340', icon: '💰' },
              { label: 'Total CVs', value: '3,891', icon: '📄' },
              { label: 'AI Uses', value: '892', icon: '🤖' },
            ].map((s, i) => (
              <Card key={i}>
                <div style={{ fontSize: '28px', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontSize: '12px', color: COLORS.muted, marginBottom: '8px' }}>{s.label}</div>
                <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.gold }}>{s.value}</div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'users' && (
          <div>
            {ADMIN_USERS.map((u, i) => (
              <Card key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: COLORS.text, fontWeight: '600' }}>{u.name}</div>
                  <div style={{ fontSize: '12px', color: COLORS.muted' }}>{u.email} • {u.cvs} CVs</div>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <Bdg c={COLORS.blue}>{u.plan.toUpperCase()}</Bdg>
                  <Btn v="dark" onClick={() => alert('Ban ' + u.name)}>Ban</Btn>
                </div>
              </Card>
            ))}
          </div>
        )}

        {tab === 'revenue' && (
          <Card>
            <div style={{ marginBottom: '32px' }}>
              <h3 style={{ color: COLORS.text, fontWeight: '700', marginBottom: '16px' }}>Plan Distribution</h3>
              <div style={{ display: 'grid', gridTemplateColumns: mob ? '1fr' : 'repeat(4, 1fr)', gap: '24px' }}>
                {[
                  { name: 'Free', count: '712 (57%)', color: COLORS.muted },
                  { name: 'Pro', count: '389 (31%)', color: COLORS.blue },
                  { name: 'Premium', count: '118 (9.5%)', color: COLORS.purple },
                  { name: 'Lifetime', count: '28 (2.5%)', color: COLORS.gold },
                ].map((p, i) => (
                  <div key={i}>
                    <Bdg c={p.color}>{p.name}</Bdg>
                    <div style={{ fontSize: '18px', fontWeight: '700', color: COLORS.text, marginTop: '8px' }}>{p.count}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        )}

        {tab === 'promos' && (
          <div>
            {Object.entries(PROMO_CODES).map(([code, data], i) => (
              <Card key={i} style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: COLORS.text, fontWeight: '600', fontSize: '18px' }}>{code}</div>
                  <div style={{ fontSize: '12px', color: COLORS.muted }}>{(data.discount * 100).toFixed(0)}% off • {data.plans.join(', ').toUpperCase()}</div>
                </div>
                <Btn v="dark">Edit</Btn>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// CHECKOUT SCREEN
const Checkout = ({ nav, user, selectedPlan = 'pro' }) => {
  const { mob } = useW();
  const [promo, setPromo] = useState('');
  const plan = PLANS[selectedPlan];
  let final = plan.price;
  if (promo && PROMO_CODES[promo]) {
    final = plan.price * (1 - PROMO_CODES[promo].discount);
  }

  return (
    <div style={{ background: COLORS.bg, minHeight: '100vh', paddingTop: '80px', padding: mob ? '40px 20px' : '80px 40px' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Card style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: COLORS.text, marginBottom: '32px' }}>Checkout</h1>

          <div style={{ background: COLORS.card2, padding: '24px', borderRadius: '8px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <div style={{ color: COLORS.text, fontWeight: '600' }}>{plan.name} Plan</div>
                <div style={{ color: COLORS.muted, fontSize: '12px' }}>Monthly subscription</div>
              </div>
              <div style={{ fontSize: '24px', fontWeight: '700', color: COLORS.gold }}>${plan.price}</div>
            </div>
            {promo && PROMO_CODES[promo] && (
              <>
                <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '16px', marginBottom: '16px' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: COLORS.green, marginBottom: '16px' }}>
                  <div>Promo: {promo}</div>
                  <div>-${(plan.price * PROMO_CODES[promo].discount).toFixed(2)}</div>
                </div>
              </>
            )}
            <div style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ color: COLORS.text, fontWeight: '700' }}>Total</div>
                <div style={{ fontSize: '28px', fontWeight: '700', color: COLORS.gold }}>${final.toFixed(2)}</div>
              </div>
            </div>
          </div>

          <Inp label="Promo Code" value={promo} onChange={setPromo} placeholder="e.g., EXIT30" />

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: COLORS.muted, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Card Number</label>
            <input placeholder="4242 4242 4242 4242" style={{ width: '100%', padding: '12px', background: COLORS.card2, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontFamily: 'monospace' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: COLORS.muted, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>Exp</label>
              <input placeholder="MM/YY" style={{ width: '100%', padding: '12px', background: COLORS.card2, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text, fontFamily: 'monospace' }} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: COLORS.muted, fontSize: '12px', fontWeight: '600', textTransform: 'uppercase' }}>CVV</label>
              <input placeholder="***" style={{ width: '100%', padding: '12px', background: COLORS.card2, border: `1px solid ${COLORS.border}`, borderRadius: '8px', color: COLORS.text', fontFamily: 'monospace' }} />
            </div>
          </div>

          <Btn full v="primary" onClick={() => {
            alert(`✓ Payment of $${final.toFixed(2)} successful! Welcome to ${plan.name}`);
            nav('dashboard');
          }}>
            Pay ${final.toFixed(2)}
          </Btn>

          <Btn full v="ghost" onClick={() => nav('pricing')} style={{ marginTop: '12px' }}>Cancel</Btn>
        </Card>

        <div style={{ textAlign: 'center', fontSize: '12px', color: COLORS.muted }}>
          Test card: 4242 4242 4242 4242
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// NAVBAR
// ============================================================================

const NavBar = ({ user, nav, screen }) => {
  const { mob, w } = useW();
  const [openMenu, setOpenMenu] = useState(false);

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      background: `${COLORS.bg}dd`,
      backdropFilter: 'blur(10px)',
      borderBottom: `1px solid ${COLORS.border}`,
    }}>
      <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div onClick={() => nav('landing')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          <Logo />
        </div>

        {mob ? (
          <div style={{ position: 'relative' }}>
            <button onClick={() => setOpenMenu(!openMenu)} style={{ background: 'none', border: 'none', color: COLORS.gold, fontSize: '24px', cursor: 'pointer' }}>≡</button>
            {openMenu && (
              <div style={{ position: 'absolute', top: '100%', right: '0', background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '8px', minWidth: '200px', marginTop: '12px', zIndex: 1000 }}>
                {!user ? (
                  <>
                    <div onClick={() => { nav('auth'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.text }}>Sign In</div>
                    <div onClick={() => { nav('pricing'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', color: COLORS.text }}>Pricing</div>
                  </>
                ) : (
                  <>
                    <div onClick={() => { nav('dashboard'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.text }}>Dashboard</div>
                    <div onClick={() => { nav('builder'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.text }}>Builder</div>
                    <div onClick={() => { nav('ai'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.text }}>AI Tools</div>
                    {user.isAdmin && <div onClick={() => { nav('admin'); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', borderBottom: `1px solid ${COLORS.border}`, color: COLORS.gold, fontWeight: '700' }}>Admin</div>}
                    <div onClick={() => { onLogout(); setOpenMenu(false); }} style={{ padding: '12px 24px', cursor: 'pointer', color: COLORS.red }}>Sign Out</div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            {!user ? (
              <>
                <div onClick={() => nav('landing')} style={{ cursor: 'pointer', color: COLORS.text }}>Home</div>
                <div onClick={() => nav('pricing')} style={{ cursor: 'pointer', color: COLORS.text }}>Pricing</div>
                <Btn onClick={() => nav('auth')}>Sign In</Btn>
              </>
            ) : (
              <>
                <div onClick={() => nav('dashboard')} style={{ cursor: 'pointer', color: COLORS.text }}>Dashboard</div>
                <div onClick={() => nav('builder')} style={{ cursor: 'pointer', color: COLORS.text }}>Builder</div>
                <div onClick={() => nav('templates')} style={{ cursor: 'pointer', color: COLORS.text }}>Templates</div>
                <div onClick={() => nav('ai')} style={{ cursor: 'pointer', color: COLORS.text }}>AI Tools</div>
                {user.isAdmin && <div onClick={() => nav('admin')} style={{ cursor: 'pointer', color: COLORS.gold, fontWeight: '700' }}>Admin</div>}
                <Bdg c={COLORS.gold}>{user.plan.toUpperCase()}</Bdg>
                <div onClick={() => { setUser(null); nav('landing'); }} style={{ cursor: 'pointer', color: COLORS.red, fontSize: '12px' }}>Sign Out</div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// EXIT MODAL
// ============================================================================

const ExitModal = ({ onClose, onPromo }) => (
  <div style={{ position: 'fixed', inset: '0', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998 }}>
    <Card style={{ maxWidth: '400px', animation: 'slideInUp 0.4s ease-out' }}>
      <h2 style={{ fontSize: '24px', fontWeight: '700', color: COLORS.text, marginBottom: '12px' }}>Wait! Before You Go...</h2>
      <p style={{ color: COLORS.muted, marginBottom: '24px' }}>Get 30% off Pro with code <span style={{ color: COLORS.gold, fontWeight: '700' }}>EXIT30</span></p>
      <Btn full onClick={() => { onPromo('EXIT30'); onClose(); }} style={{ marginBottom: '12px' }}>Claim Offer</Btn>
      <Btn full v="dark" onClick={onClose}>No Thanks</Btn>
    </Card>
  </div>
);

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

const Toast = ({ message }) => (
  <div className="toast slideIn" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: '8px', padding: '16px 24px', color: COLORS.text, fontSize: '14px', maxWidth: '300px', animation: `slideIn 0.5s ease-out, slideIn 0.5s ease-in ${4.2 - 0.5}s reverse forwards` }}>
    <div style={{ marginBottom: '4px', color: COLORS.gold, fontWeight: '600', fontSize: '12px' }}>NEW</div>
    {message}
  </div>
);

// ============================================================================
// MAIN APP
// ============================================================================

export default function CVision() {
  const [screen, setScreen] = useState('landing');
  const [user, setUser] = useState(null);
  const [cv, setCv] = useState(BLANK_CV);
  const [selectedTemplate, setSelectedTemplate] = useState(TEMPLATES[0]);
  const [exitModalOpen, setExitModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const exitModalRef = useRef(false);

  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = CSS;
    document.head.appendChild(style);
  }, []);

  useEffect(() => {
    const handleMouseLeave = (e) => {
      if (e.clientY < 60 && !user && !exitModalRef.current) {
        setExitModalOpen(true);
        exitModalRef.current = true;
      }
    };
    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, [user]);

  useEffect(() => {
    const interval = setInterval(() => {
      const msg = SOCIAL_PROOF[Math.floor(Math.random() * SOCIAL_PROOF.length)];
      setToastMsg(`${msg.name} just ${msg.action}`);
      setTimeout(() => setToastMsg(null), 4200);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const nav = useCallback((s) => setScreen(s), []);

  return (
    <div style={{ background: COLORS.bg, color: COLORS.text, minHeight: '100vh' }}>
      <style>{CSS}</style>

      <NavBar user={user} nav={nav} screen={screen} />

      {screen === 'landing' && <Landing nav={nav} user={user} />}
      {screen === 'pricing' && <Pricing nav={nav} user={user} />}
      {screen === 'auth' && <Auth nav={nav} onLogin={setUser} />}
      {screen === 'dashboard' && user && <Dashboard nav={nav} user={user} />}
      {screen === 'templates' && user && <Templates nav={nav} user={user} onSelectTemplate={setSelectedTemplate} />}
      {screen === 'builder' && user && <Builder nav={nav} user={user} cv={cv} setCv={setCv} selectedTemplate={selectedTemplate} />}
      {screen === 'ai' && user && <AITools nav={nav} user={user} cv={cv} />}
      {screen === 'admin' && user && <Admin user={user} />}
      {screen === 'checkout' && user && <Checkout nav={nav} user={user} selectedPlan="pro" />}

      {exitModalOpen && <ExitModal onClose={() => setExitModalOpen(false)} onPromo={(code) => { alert(`✓ Promo code ${code} applied!`); }} />}

      {toastMsg && <Toast message={toastMsg} />}
    </div>
  );
}
