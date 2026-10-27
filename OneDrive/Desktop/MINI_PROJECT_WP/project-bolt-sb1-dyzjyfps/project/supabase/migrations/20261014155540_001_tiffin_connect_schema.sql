/*
# Tiffin Connect — Full Schema

## Purpose
Home-cook tiffin marketplace for Mumbai. Customers browse cooks by area/cuisine/diet/price,
subscribe to weekly/monthly plans, skip meals before 9 PM cutoff. Cooks manage daily menus
and see tomorrow's dabba count. Admin approves cooks and handles complaints.

## Tables
1. `cooks` — home-cook profiles with area, cuisine, diet options, price, approval status
2. `menus` — daily menu entries per cook (date, items)
3. `subscriptions` — customer subscriptions to cook plans (weekly/monthly)
4. `skips` — meal skip requests tied to a subscription and date
5. `reviews` — customer ratings and text reviews for cooks
6. `complaints` — customer complaints handled by admin

## Security
- Single-tenant app (no sign-in screen) — all policies use `TO anon, authenticated`
- All CRUD is open since the app is a shared marketplace demo with no auth
*/

-- ===== COOKS =====
CREATE TABLE IF NOT EXISTS cooks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  area text NOT NULL,
  cuisine text NOT NULL DEFAULT 'Home Style',
  diet_tags text[] NOT NULL DEFAULT '{}',
  veg_only boolean NOT NULL DEFAULT true,
  price_weekly numeric NOT NULL DEFAULT 1200,
  price_monthly numeric NOT NULL DEFAULT 4500,
  rating numeric NOT NULL DEFAULT 4.5,
  total_reviews integer NOT NULL DEFAULT 0,
  total_subscribers integer NOT NULL DEFAULT 0,
  bio text NOT NULL DEFAULT '',
  image_url text NOT NULL DEFAULT '',
  approved boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE cooks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_cooks" ON cooks;
CREATE POLICY "anon_select_cooks" ON cooks FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_cooks" ON cooks;
CREATE POLICY "anon_insert_cooks" ON cooks FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_cooks" ON cooks;
CREATE POLICY "anon_update_cooks" ON cooks FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_cooks" ON cooks;
CREATE POLICY "anon_delete_cooks" ON cooks FOR DELETE TO anon, authenticated USING (true);

-- ===== MENUS =====
CREATE TABLE IF NOT EXISTS menus (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid NOT NULL REFERENCES cooks(id) ON DELETE CASCADE,
  menu_date date NOT NULL DEFAULT CURRENT_DATE,
  items text[] NOT NULL DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(cook_id, menu_date)
);

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_menus" ON menus;
CREATE POLICY "anon_select_menus" ON menus FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_menus" ON menus;
CREATE POLICY "anon_insert_menus" ON menus FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_menus" ON menus;
CREATE POLICY "anon_update_menus" ON menus FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_menus" ON menus;
CREATE POLICY "anon_delete_menus" ON menus FOR DELETE TO anon, authenticated USING (true);

-- ===== SUBSCRIPTIONS =====
CREATE TABLE IF NOT EXISTS subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid NOT NULL REFERENCES cooks(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  customer_phone text NOT NULL,
  customer_address text NOT NULL,
  plan_type text NOT NULL DEFAULT 'weekly',
  status text NOT NULL DEFAULT 'active',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
CREATE POLICY "anon_select_subscriptions" ON subscriptions FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
CREATE POLICY "anon_insert_subscriptions" ON subscriptions FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
CREATE POLICY "anon_update_subscriptions" ON subscriptions FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;
CREATE POLICY "anon_delete_subscriptions" ON subscriptions FOR DELETE TO anon, authenticated USING (true);

-- ===== SKIPS =====
CREATE TABLE IF NOT EXISTS skips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id uuid NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  cook_id uuid NOT NULL REFERENCES cooks(id) ON DELETE CASCADE,
  skip_date date NOT NULL,
  reason text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(subscription_id, skip_date)
);

ALTER TABLE skips ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_skips" ON skips;
CREATE POLICY "anon_select_skips" ON skips FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_skips" ON skips;
CREATE POLICY "anon_insert_skips" ON skips FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_skips" ON skips;
CREATE POLICY "anon_update_skips" ON skips FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_skips" ON skips;
CREATE POLICY "anon_delete_skips" ON skips FOR DELETE TO anon, authenticated USING (true);

-- ===== REVIEWS =====
CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid NOT NULL REFERENCES cooks(id) ON DELETE CASCADE,
  customer_name text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
CREATE POLICY "anon_select_reviews" ON reviews FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
CREATE POLICY "anon_insert_reviews" ON reviews FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
CREATE POLICY "anon_update_reviews" ON reviews FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;
CREATE POLICY "anon_delete_reviews" ON reviews FOR DELETE TO anon, authenticated USING (true);

-- ===== COMPLAINTS =====
CREATE TABLE IF NOT EXISTS complaints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cook_id uuid REFERENCES cooks(id) ON DELETE SET NULL,
  customer_name text NOT NULL,
  subject text NOT NULL,
  description text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  admin_response text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
CREATE POLICY "anon_select_complaints" ON complaints FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
CREATE POLICY "anon_insert_complaints" ON complaints FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
CREATE POLICY "anon_update_complaints" ON complaints FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;
CREATE POLICY "anon_delete_complaints" ON complaints FOR DELETE TO anon, authenticated USING (true);

-- ===== INDEXES =====
CREATE INDEX IF NOT EXISTS idx_cooks_area ON cooks(area);
CREATE INDEX IF NOT EXISTS idx_cooks_approved ON cooks(approved);
CREATE INDEX IF NOT EXISTS idx_menus_cook_date ON menus(cook_id, menu_date);
CREATE INDEX IF NOT EXISTS idx_subscriptions_cook ON subscriptions(cook_id);
CREATE INDEX IF NOT EXISTS idx_reviews_cook ON reviews(cook_id);
CREATE INDEX IF NOT EXISTS idx_skips_subscription_date ON skips(subscription_id, skip_date);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
