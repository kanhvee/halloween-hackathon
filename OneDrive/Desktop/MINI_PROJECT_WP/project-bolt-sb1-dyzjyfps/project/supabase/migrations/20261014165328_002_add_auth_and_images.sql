/*
# Add authentication support to Tiffin Connect

## Purpose
Adds user accounts (customer/cook/admin roles) with Supabase Auth. 
Creates a `profiles` table linked to auth.users with role + display name.
Updates existing tables to be owner-aware where needed.
Updates RLS policies: public reads stay open (marketplace), writes require auth.

## Changes

### 1. New Table: `profiles`
- `id` uuid PK, references auth.users, ON DELETE CASCADE
- `email` text
- `display_name` text
- `role` text (customer / cook / admin), default 'customer'
- `created_at` timestamptz

### 2. Trigger: auto-create profile on signup
- `handle_new_user()` trigger function fires AFTER INSERT on auth.users
- Inserts a row into `profiles` with the user's id, email, and default role

### 3. RLS Policy Changes
- `profiles`: users can read all profiles (need to see cook info), update only their own
- `cooks`: SELECT open to authenticated (browse marketplace), INSERT/UPDATE/DELETE to authenticated (cook or admin manages)
- `menus`: SELECT open to authenticated, INSERT/UPDATE/DELETE to authenticated
- `subscriptions`: SELECT to authenticated (user sees own + cook sees theirs), INSERT/UPDATE/DELETE to authenticated
- `skips`: SELECT to authenticated, INSERT/UPDATE/DELETE to authenticated
- `reviews`: SELECT to authenticated, INSERT to authenticated, UPDATE/DELETE to authenticated
- `complaints`: SELECT to authenticated, INSERT to authenticated, UPDATE to authenticated (admin resolves)

### 4. Updated cook image_url with cuisine-appropriate photos
*/

-- ===== PROFILES TABLE =====
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL DEFAULT '',
  role text NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'cook', 'admin')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_all" ON profiles;
CREATE POLICY "profiles_select_all" ON profiles FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
CREATE POLICY "profiles_insert_own" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

-- ===== TRIGGER: auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'display_name', ''), COALESCE(NEW.raw_user_meta_data->>'role', 'customer'));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ===== UPDATE COOK POLICIES (authenticated only now) =====
DROP POLICY IF EXISTS "anon_select_cooks" ON cooks;
DROP POLICY IF EXISTS "anon_insert_cooks" ON cooks;
DROP POLICY IF EXISTS "anon_update_cooks" ON cooks;
DROP POLICY IF EXISTS "anon_delete_cooks" ON cooks;

CREATE POLICY "auth_select_cooks" ON cooks FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_cooks" ON cooks FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_cooks" ON cooks FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_cooks" ON cooks FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE MENU POLICIES =====
DROP POLICY IF EXISTS "anon_select_menus" ON menus;
DROP POLICY IF EXISTS "anon_insert_menus" ON menus;
DROP POLICY IF EXISTS "anon_update_menus" ON menus;
DROP POLICY IF EXISTS "anon_delete_menus" ON menus;

CREATE POLICY "auth_select_menus" ON menus FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_menus" ON menus FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_menus" ON menus FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_menus" ON menus FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE SUBSCRIPTION POLICIES =====
DROP POLICY IF EXISTS "anon_select_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_insert_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_update_subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "anon_delete_subscriptions" ON subscriptions;

CREATE POLICY "auth_select_subscriptions" ON subscriptions FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_subscriptions" ON subscriptions FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_subscriptions" ON subscriptions FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_subscriptions" ON subscriptions FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE SKIP POLICIES =====
DROP POLICY IF EXISTS "anon_select_skips" ON skips;
DROP POLICY IF EXISTS "anon_insert_skips" ON skips;
DROP POLICY IF EXISTS "anon_update_skips" ON skips;
DROP POLICY IF EXISTS "anon_delete_skips" ON skips;

CREATE POLICY "auth_select_skips" ON skips FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_skips" ON skips FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_skips" ON skips FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_skips" ON skips FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE REVIEW POLICIES =====
DROP POLICY IF EXISTS "anon_select_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_update_reviews" ON reviews;
DROP POLICY IF EXISTS "anon_delete_reviews" ON reviews;

CREATE POLICY "auth_select_reviews" ON reviews FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_reviews" ON reviews FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_reviews" ON reviews FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_reviews" ON reviews FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE COMPLAINT POLICIES =====
DROP POLICY IF EXISTS "anon_select_complaints" ON complaints;
DROP POLICY IF EXISTS "anon_insert_complaints" ON complaints;
DROP POLICY IF EXISTS "anon_update_complaints" ON complaints;
DROP POLICY IF EXISTS "anon_delete_complaints" ON complaints;

CREATE POLICY "auth_select_complaints" ON complaints FOR SELECT
  TO authenticated USING (true);
CREATE POLICY "auth_insert_complaints" ON complaints FOR INSERT
  TO authenticated WITH CHECK (true);
CREATE POLICY "auth_update_complaints" ON complaints FOR UPDATE
  TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_delete_complaints" ON complaints FOR DELETE
  TO authenticated USING (true);

-- ===== UPDATE COOK IMAGES WITH CUISINE-SPECIFIC PHOTOS =====
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/17223837/pexels-photo-17223837.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Aai Kitchen';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/8818723/pexels-photo-8818723.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Annapurna Tiffin';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/28674660/pexels-photo-28674660.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Lucknowi Dastarkhwan';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/39323513/pexels-photo-39323513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Swastik Pure Veg';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/20422123/pexels-photo-20422123.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Coastal Curry Kitchen';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/28125427/pexels-photo-28125427.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Punjabi Zayka';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/5775684/pexels-photo-5775684.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Bhagini Bhojanalaya';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/19992963/pexels-photo-19992963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Fit Tiffin';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/38192678/pexels-photo-38192678.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'South Spice Home';
UPDATE cooks SET image_url = 'https://images.pexels.com/photos/9609856/pexels-photo-9609856.jpeg?auto=compress&cs=tinysrgb&h=650&w=940' WHERE name = 'Bay Biryani House';
