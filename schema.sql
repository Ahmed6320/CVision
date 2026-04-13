-- ============================================================================
-- CVISION DATABASE SCHEMA
-- PostgreSQL (Supabase compatible)
-- ============================================================================

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  plan VARCHAR(50) DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'premium', 'lifetime')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  banned BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);

-- ============================================================================
-- CVS TABLE
-- ============================================================================

CREATE TABLE cvs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  content JSONB NOT NULL,
  template_id VARCHAR(10),
  accent_color VARCHAR(7),
  ats_score INTEGER CHECK (ats_score >= 0 AND ats_score <= 100),
  dark_mode BOOLEAN DEFAULT false,
  views INTEGER DEFAULT 0,
  downloads INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_cvs_user_id ON cvs(user_id);
CREATE INDEX idx_cvs_created_at ON cvs(created_at DESC);

-- ============================================================================
-- TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan VARCHAR(50) NOT NULL,
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'USD',
  stripe_payment_id VARCHAR(255),
  promo_code VARCHAR(50),
  discount_amount DECIMAL(10, 2),
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- ============================================================================
-- PROMO CODES TABLE
-- ============================================================================

CREATE TABLE promo_codes (
  id SERIAL PRIMARY KEY,
  code VARCHAR(50) UNIQUE NOT NULL,
  discount_percent DECIMAL(5, 2),
  discount_amount DECIMAL(10, 2),
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  valid_plans VARCHAR(255),
  expires_at TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_promo_codes_code ON promo_codes(code);
CREATE INDEX idx_promo_codes_active ON promo_codes(active);

-- ============================================================================
-- AI CREDITS TABLE
-- ============================================================================

CREATE TABLE ai_credits (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credits_remaining INTEGER DEFAULT 0,
  credits_used INTEGER DEFAULT 0,
  feature VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_ai_credits_user_id ON ai_credits(user_id);

-- ============================================================================
-- TEMPLATES TABLE
-- ============================================================================

CREATE TABLE templates (
  id VARCHAR(10) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  plan VARCHAR(50) NOT NULL,
  accent_color VARCHAR(7),
  layout_json JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- ACTIVITY LOG TABLE
-- ============================================================================

CREATE TABLE activity_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100),
  metadata JSONB,
  ip_address VARCHAR(45),
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_activity_log_user_id ON activity_log(user_id);
CREATE INDEX idx_activity_log_action ON activity_log(action);
CREATE INDEX idx_activity_log_created_at ON activity_log(created_at DESC);

-- ============================================================================
-- SUPPORT TICKETS TABLE
-- ============================================================================

CREATE TABLE support_tickets (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  response TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  resolved_at TIMESTAMP
);

CREATE INDEX idx_support_tickets_user_id ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- ============================================================================
-- SAMPLE DATA
-- ============================================================================

-- Insert sample templates
INSERT INTO templates (id, name, plan, accent_color) VALUES
  ('T0', 'Monaco', 'free', '#1A1A2E'),
  ('T1', 'Cannes', 'free', '#2D6A4F'),
  ('T2', 'Milan', 'pro', '#E63946'),
  ('T3', 'Zurich', 'pro', '#003566'),
  ('T4', 'Tokyo', 'pro', '#6C63FF'),
  ('T5', 'Copenhagen', 'pro', '#8B6914'),
  ('T6', 'Singapore', 'pro', '#00B4D8'),
  ('T7', 'Dubai', 'pro', '#C9A84C'),
  ('T8', 'Berlin', 'pro', '#00D4AA'),
  ('T9', 'Paris', 'pro', '#FF006E'),
  ('T10', 'Oslo', 'pro', '#0077B6'),
  ('T11', 'Amsterdam', 'pro', '#7B2FBE'),
  ('T12', 'Vienna', 'pro', '#8B5E3C'),
  ('T13', 'Stockholm', 'pro', '#48CAE4'),
  ('T14', 'Rio', 'pro', '#F77F00'),
  ('T15', 'Athens', 'pro', '#1B4332'),
  ('T16', 'NYC', 'pro', '#EF233C'),
  ('T17', 'London', 'pro', '#2B4162'),
  ('T18', 'Cairo', 'pro', '#D4A017'),
  ('T19', 'Sydney', 'pro', '#0096C7');

-- Insert sample promo codes
INSERT INTO promo_codes (code, discount_percent, valid_plans, active) VALUES
  ('EXIT30', 30, 'pro,premium', true),
  ('LAUNCH50', 50, 'pro,premium', true),
  ('SAVE20', 20, 'pro,premium,lifetime', true),
  ('STUDENT25', 25, 'pro', true);

-- Insert sample users
INSERT INTO users (email, password, plan) VALUES
  ('admin@cvision.io', md5('admin123'), 'lifetime'),
  ('demo@cvision.io', md5('demo123'), 'free');

-- ============================================================================
-- VIEWS FOR ANALYTICS
-- ============================================================================

CREATE VIEW user_stats AS
SELECT
  u.id,
  u.email,
  u.plan,
  COUNT(DISTINCT c.id) as cv_count,
  COUNT(DISTINCT t.id) as transaction_count,
  MAX(t.created_at) as last_transaction,
  u.created_at
FROM users u
LEFT JOIN cvs c ON u.id = c.user_id
LEFT JOIN transactions t ON u.id = t.user_id
GROUP BY u.id, u.email, u.plan, u.created_at;

CREATE VIEW revenue_by_plan AS
SELECT
  plan,
  COUNT(*) as transaction_count,
  SUM(amount) as total_revenue,
  AVG(amount) as avg_transaction,
  DATE(created_at) as date
FROM transactions
WHERE status = 'completed'
GROUP BY plan, DATE(created_at);

CREATE VIEW daily_signups AS
SELECT
  DATE(created_at) as signup_date,
  COUNT(*) as signups,
  COUNT(CASE WHEN plan != 'free' THEN 1 END) as paid_signups
FROM users
GROUP BY DATE(created_at);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cvs_updated_at BEFORE UPDATE ON cvs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ai_credits_updated_at BEFORE UPDATE ON ai_credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PERMISSIONS (Uncomment for production with Supabase)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON users TO authenticated;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON cvs TO authenticated;
-- GRANT SELECT, INSERT ON transactions TO authenticated;
-- GRANT SELECT ON templates TO authenticated;
-- GRANT SELECT ON public_stats TO authenticated;
