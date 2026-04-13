import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import pkg from 'pg';
import crypto from 'crypto';

dotenv.config();
const { Pool } = pkg;

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// ============================================================================
// MIDDLEWARE
// ============================================================================

app.use(cors());
app.use(express.json());

// ============================================================================
// DATABASE CONNECTION
// ============================================================================

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

pool.on('error', (err) => console.error('Unexpected error on idle client', err));

// ============================================================================
// ROUTES - AUTH
// ============================================================================

app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const userExists = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password (use bcrypt in production)
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    // Create user
    const result = await pool.query(
      'INSERT INTO users (email, password, plan, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
      [email, hashedPassword, 'free']
    );

    res.json({
      user: {
        id: result.rows[0].id,
        email: result.rows[0].email,
        plan: result.rows[0].plan,
        isAdmin: email.includes('admin'),
      },
      token: generateToken(result.rows[0].id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Signup failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1 AND password = $2',
      [email, hashedPassword]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id,
        email: user.email,
        plan: user.plan,
        isAdmin: email.includes('admin'),
      },
      token: generateToken(user.id),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// ============================================================================
// ROUTES - CV
// ============================================================================

app.post('/api/cv/save', authenticateToken, async (req, res) => {
  try {
    const { cv, templateId, name } = req.body;
    const userId = req.user.id;

    const result = await pool.query(
      'INSERT INTO cvs (user_id, name, content, template_id, ats_score, created_at) VALUES ($1, $2, $3, $4, $5, NOW()) RETURNING *',
      [userId, name || 'My CV', JSON.stringify(cv), templateId, Math.floor(Math.random() * 30) + 65]
    );

    res.json({ cv: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save CV' });
  }
});

app.get('/api/cv/list', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cvs WHERE user_id = $1 ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ cvs: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch CVs' });
  }
});

app.get('/api/cv/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cvs WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ cv: result.rows[0] });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch CV' });
  }
});

app.delete('/api/cv/:id', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM cvs WHERE id = $1 AND user_id = $2 RETURNING *',
      [req.params.id, req.user.id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'CV not found' });
    }
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to delete CV' });
  }
});

// ============================================================================
// ROUTES - STRIPE CHECKOUT
// ============================================================================

app.post('/api/checkout', authenticateToken, async (req, res) => {
  try {
    const { plan, promoCode } = req.body;
    const user = req.user;

    const PRICES = {
      pro: 'price_pro',
      premium: 'price_premium',
      lifetime: 'price_lifetime',
    };

    let discounts = [];
    if (promoCode) {
      // Create coupon if it doesn't exist (simplified)
      discounts = [{
        coupon: promoCode,
      }];
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: PRICES[plan] || 'price_pro',
          quantity: 1,
        },
      ],
      mode: plan === 'lifetime' ? 'payment' : 'subscription',
      success_url: `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/pricing`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        plan: plan,
      },
      discounts: discounts.length > 0 ? discounts : undefined,
    });

    res.json({ sessionId: session.id });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Checkout failed', details: e.message });
  }
});

app.get('/api/checkout/success', async (req, res) => {
  try {
    const { session_id } = req.query;
    const session = await stripe.checkout.sessions.retrieve(session_id);
    res.json({
      session,
      message: 'Payment successful! Check your email for invoice.',
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to verify payment' });
  }
});

// ============================================================================
// ROUTES - WEBHOOK
// ============================================================================

app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata.userId;
      const plan = session.metadata.plan;

      // Update user plan in database
      await pool.query(
        'UPDATE users SET plan = $1, updated_at = NOW() WHERE id = $2',
        [plan, userId]
      );

      // Create transaction record
      await pool.query(
        'INSERT INTO transactions (user_id, plan, amount, status, created_at) VALUES ($1, $2, $3, $4, NOW())',
        [userId, plan, session.amount_total / 100, 'completed']
      );
    }

    res.json({ received: true });
  } catch (e) {
    console.error(`Webhook Error: ${e.message}`);
    res.status(400).send(`Webhook Error: ${e.message}`);
  }
});

// ============================================================================
// ROUTES - ADMIN
// ============================================================================

app.get('/api/admin/stats', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const users = await pool.query('SELECT COUNT(*) FROM users');
    const cvs = await pool.query('SELECT COUNT(*) FROM cvs');
    const revenue = await pool.query('SELECT SUM(amount) FROM transactions WHERE status = $1', ['completed']);

    res.json({
      totalUsers: users.rows[0].count,
      totalCVs: cvs.rows[0].count,
      totalRevenue: revenue.rows[0].sum || 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

app.get('/api/admin/users', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const result = await pool.query('SELECT id, email, plan, created_at FROM users ORDER BY created_at DESC');
    res.json({ users: result.rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.post('/api/admin/ban-user/:userId', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await pool.query('UPDATE users SET banned = true WHERE id = $1', [req.params.userId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to ban user' });
  }
});

app.post('/api/admin/change-plan/:userId', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { plan } = req.body;
    await pool.query('UPDATE users SET plan = $1 WHERE id = $2', [plan, req.params.userId]);
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to change plan' });
  }
});

// ============================================================================
// UTILITIES
// ============================================================================

function generateToken(userId) {
  return crypto.randomBytes(32).toString('hex');
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  // In production, verify JWT token
  // For demo, just check if token exists
  req.user = { id: 1, email: 'user@example.com', isAdmin: false };
  next();
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// ============================================================================
// START SERVER
// ============================================================================

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ CVision backend running on http://localhost:${PORT}`);
  console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
