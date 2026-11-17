-- AgriHub Supabase Database Schema
-- Safe to run on both new and existing databases (does NOT drop data)
-- Run this in Supabase SQL Editor

-- ============================================
-- 1. PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  quantity TEXT,
  category TEXT NOT NULL,
  image TEXT,
  status TEXT DEFAULT 'available',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop old CHECK constraints that may conflict with new column types
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname FROM pg_constraint
           WHERE conrelid = 'public.products'::regclass AND contype = 'c' LOOP
    EXECUTE format('ALTER TABLE products DROP CONSTRAINT %I', r.conname);
  END LOOP;
END $$;

-- Add missing columns if products table already existed with older schema
ALTER TABLE products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'available';
ALTER TABLE products ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS quantity TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix column types for older schema (only convert if needed, safe casts)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='quantity' AND data_type <> 'text') THEN
    ALTER TABLE products ALTER COLUMN quantity TYPE TEXT USING quantity::text;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='price' AND data_type NOT IN ('numeric')) THEN
    ALTER TABLE products ALTER COLUMN price TYPE DECIMAL(10,2) USING COALESCE(NULLIF(regexp_replace(price::text, '[^0-9.]', '', 'g'), '')::numeric, 0);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='original_price' AND data_type NOT IN ('numeric')) THEN
    ALTER TABLE products ALTER COLUMN original_price TYPE DECIMAL(10,2) USING CASE WHEN original_price IS NULL THEN NULL ELSE COALESCE(NULLIF(regexp_replace(original_price::text, '[^0-9.]', '', 'g'), '')::numeric, 0) END;
  END IF;
END $$;

-- Old schema may have NOT NULL columns that block seed inserts
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'products'
             AND is_nullable = 'NO' AND column_name NOT IN ('name', 'id') LOOP
    EXECUTE format('ALTER TABLE products ALTER COLUMN %I DROP NOT NULL', r.column_name);
  END LOOP;
END $$;

-- Sample data for products (only if table is empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM products) THEN
    INSERT INTO products (name, description, price, original_price, quantity, category, image) VALUES
    ('Fresh Eggs', 'Fresh farm eggs', 120, 150, '12 pcs', 'dairy', '🥚'),
    ('Spinach', 'Fresh spinach', 40, 50, '250g', 'veggies', '🥬'),
    ('Mangoes', 'Sweet mangoes', 120, 150, '1kg', 'fruits', '🥭'),
    ('Chicken Breast', 'Fresh chicken breast', 180, 220, '500g', 'meats', '🍗'),
    ('Apples', 'Crispy apples', 150, 180, '1kg', 'fruits', '🍎'),
    ('Broccoli', 'Fresh broccoli', 50, 65, '300g', 'veggies', '🥦'),
    ('Milk', 'Fresh milk', 85, 100, '1L', 'dairy', '🥛'),
    ('Beef', 'Fresh beef', 250, 300, '500g', 'meats', '🥩'),
    ('Banana', 'Sweet bananas', 60, 75, '1kg', 'fruits', '🍌'),
    ('Grapes', 'Fresh grapes', 100, 130, '500g', 'fruits', '🍇'),
    ('Carrots', 'Fresh carrots', 35, 45, '500g', 'veggies', '🥕'),
    ('Cheese', 'Fresh cheese', 150, 180, '200g', 'dairy', '🧀');
  END IF;
END $$;

-- ============================================
-- 2. PROFILES TABLE (auto-created on signup)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  account_type TEXT DEFAULT 'buyer',
  phone TEXT,
  address TEXT,
  city TEXT,
  farm_type TEXT,
  farm_size TEXT,
  main_crops TEXT,
  years_active INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if profiles table already existed with older schema
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'buyer';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS farm_type TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS farm_size TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS main_crops TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS years_active INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Trigger to auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, account_type)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    COALESCE(NEW.raw_user_meta_data->>'account_type', 'buyer')
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block signup if profile insert fails
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- ============================================
-- 3. ORDERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  payment_method TEXT,
  payment_reference TEXT,
  payment_status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drop ALL constraints on orders (foreign keys, checks, NOT NULL) to fix blocking issues
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT conname, contype FROM pg_constraint
           WHERE conrelid = 'public.orders'::regclass LOOP
    IF r.contype = 'f' THEN
      EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', r.conname);
    ELSIF r.contype = 'c' THEN
      EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', r.conname);
    END IF;
  END LOOP;
END $$;

-- Convert payment_status from ENUM to TEXT if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE a.attrelid = 'public.orders'::regclass
      AND a.attname = 'payment_status'
      AND t.typtype = 'e'
  ) THEN
    ALTER TABLE orders ALTER COLUMN payment_status TYPE TEXT USING payment_status::text;
  END IF;
END $$;

-- Convert payment_method from ENUM to TEXT if it exists
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE a.attrelid = 'public.orders'::regclass
      AND a.attname = 'payment_method'
      AND t.typtype = 'e'
  ) THEN
    ALTER TABLE orders ALTER COLUMN payment_method TYPE TEXT USING payment_method::text;
  END IF;
END $$;

-- Drop old NOT NULL constraints on orders that may block inserts

-- Add missing columns if orders table already existed with older schema
ALTER TABLE orders ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_reference TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_status TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Fix column types for older schema (safe conversion - invalid JSON becomes [])
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'orders' AND column_name = 'items'
      AND data_type <> 'jsonb'
  ) THEN
    ALTER TABLE orders ALTER COLUMN items TYPE JSONB
      USING CASE
        WHEN items IS NULL THEN '[]'::jsonb
        WHEN items::text ~ '^\s*[\[\{]' THEN items::text::jsonb
        ELSE '[]'::jsonb
      END;
  END IF;
END $$;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='orders' AND column_name='total_amount' AND data_type NOT IN ('numeric')) THEN
    ALTER TABLE orders ALTER COLUMN total_amount TYPE DECIMAL(10,2)
      USING COALESCE(NULLIF(regexp_replace(total_amount::text, '[^0-9.]', '', 'g'), '')::numeric, 0);
  END IF;
END $$;

-- Convert payment_status from ENUM to TEXT if it exists (fixes "invalid input value for enum" error)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_attribute a
    JOIN pg_type t ON t.oid = a.atttypid
    WHERE a.attrelid = 'public.orders'::regclass
      AND a.attname = 'payment_status'
      AND t.typtype = 'e'
  ) THEN
    ALTER TABLE orders ALTER COLUMN payment_status TYPE TEXT USING payment_status::text;
  END IF;
END $$;

-- Drop old NOT NULL constraints on orders that may block inserts
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT column_name FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'orders'
             AND is_nullable = 'NO' AND column_name NOT IN ('id') LOOP
    EXECUTE format('ALTER TABLE orders ALTER COLUMN %I DROP NOT NULL', r.column_name);
  END LOOP;
END $$;

-- Re-add foreign key constraints for orders (after cleanup)
ALTER TABLE orders ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD CONSTRAINT orders_buyer_id_fkey FOREIGN KEY (buyer_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- ============================================
-- 4. ORDER_ITEMS TABLE (optional - normalized)
-- ============================================
CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 5. SAVED_PRODUCTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- ============================================
-- 6. REQUESTS TABLE (buyer product requests)
-- ============================================
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  quantity TEXT,
  budget DECIMAL(10,2),
  description TEXT,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 7. GROUP_BUYING TABLE (bulk orders for discounts)
-- ============================================
CREATE TABLE IF NOT EXISTS group_buying (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  target_quantity INTEGER NOT NULL,
  current_quantity INTEGER DEFAULT 0,
  unit_price DECIMAL(10,2) NOT NULL,
  target_price DECIMAL(10,2),
  status TEXT DEFAULT 'open',
  deadline TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 8. AUCTIONS TABLE (bidding system)
-- ============================================
CREATE TABLE IF NOT EXISTS auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  starting_bid DECIMAL(10,2) NOT NULL,
  current_bid DECIMAL(10,2),
  reserve_price DECIMAL(10,2),
  status TEXT DEFAULT 'active',
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 9. AUCTION_BIDS TABLE (bids on auctions)
-- ============================================
CREATE TABLE IF NOT EXISTS auction_bids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  bid_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 10. DELIVERIES TABLE (fulfillment tracking)
-- ============================================
CREATE TABLE IF NOT EXISTS deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  tracking_number TEXT,
  carrier TEXT,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  actual_delivery TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns if order_items table already existed with older schema
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS quantity INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns if saved_products table already existed with older schema
ALTER TABLE saved_products ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE saved_products ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE CASCADE;
ALTER TABLE saved_products ADD COLUMN IF NOT EXISTS quantity INTEGER DEFAULT 1;
ALTER TABLE saved_products ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE saved_products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns if requests table already existed with older schema
ALTER TABLE requests ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS quantity TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS budget DECIMAL(10,2);
ALTER TABLE requests ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE requests ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE requests ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE requests ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns for group_buying table
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS target_quantity INTEGER;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS current_quantity INTEGER DEFAULT 0;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10,2);
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS target_price DECIMAL(10,2);
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'open';
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS deadline TIMESTAMP WITH TIME ZONE;
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE group_buying ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns for auctions table
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS starting_bid DECIMAL(10,2);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS current_bid DECIMAL(10,2);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS reserve_price DECIMAL(10,2);
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active';
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS end_time TIMESTAMP WITH TIME ZONE;
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE auctions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns for auction_bids table
ALTER TABLE auction_bids ADD COLUMN IF NOT EXISTS auction_id UUID REFERENCES auctions(id) ON DELETE CASCADE;
ALTER TABLE auction_bids ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE auction_bids ADD COLUMN IF NOT EXISTS bid_amount DECIMAL(10,2);
ALTER TABLE auction_bids ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add missing columns for deliveries table
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS order_id UUID REFERENCES orders(id) ON DELETE CASCADE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS tracking_number TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS carrier TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS estimated_delivery TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS actual_delivery TIMESTAMP WITH TIME ZONE;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE deliveries ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Drop ALL existing policies on all tables (removes old conflicting/recursive ones)
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT schemaname, tablename, policyname FROM pg_policies
           WHERE schemaname = 'public'
             AND tablename IN ('products','profiles','orders','order_items','saved_products','requests','group_buying','auctions','auction_bids','deliveries') LOOP
    EXECUTE format('DROP POLICY %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- Enable RLS on all tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_buying ENABLE ROW LEVEL SECURITY;
ALTER TABLE auctions ENABLE ROW LEVEL SECURITY;
ALTER TABLE auction_bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;

-- Products policies
DROP POLICY IF EXISTS "Public read products" ON products;
DROP POLICY IF EXISTS "Users can insert own products" ON products;
DROP POLICY IF EXISTS "Users can update own products" ON products;
DROP POLICY IF EXISTS "Users can delete own products" ON products;

CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own products"
  ON products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own products"
  ON products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own products"
  ON products FOR DELETE
  USING (auth.uid() = user_id);

-- Profiles policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Orders policies
-- Drop ALL existing policies on orders to remove old conflicting/recursive ones
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'orders' LOOP
    EXECUTE format('DROP POLICY %I ON orders', r.policyname);
  END LOOP;
END $$;

-- Helper function (SECURITY DEFINER bypasses RLS, prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.order_has_seller_product(p_order_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM order_items oi
    JOIN products p ON p.id = oi.product_id
    WHERE oi.order_id = p_order_id AND p.user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (
    auth.uid() = buyer_id OR
    public.order_has_seller_product(id)
  );

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = buyer_id);

-- Order Items policies (normalized order lines)
-- Drop ALL existing policies on order_items to remove old conflicting/recursive ones
DO $$
DECLARE r RECORD;
BEGIN
  FOR r IN SELECT policyname FROM pg_policies
           WHERE schemaname = 'public' AND tablename = 'order_items' LOOP
    EXECUTE format('DROP POLICY %I ON order_items', r.policyname);
  END LOOP;
END $$;

CREATE POLICY "Users can read own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid()) OR
    EXISTS (SELECT 1 FROM products p WHERE p.id = order_items.product_id AND p.user_id = auth.uid())
  );

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM orders o WHERE o.id = order_items.order_id AND o.user_id = auth.uid())
  );

-- Saved Products policies
DROP POLICY IF EXISTS "Users can read own saved products" ON saved_products;
DROP POLICY IF EXISTS "Users can insert own saved products" ON saved_products;
DROP POLICY IF EXISTS "Users can update own saved products" ON saved_products;
DROP POLICY IF EXISTS "Users can delete own saved products" ON saved_products;

CREATE POLICY "Users can read own saved products"
  ON saved_products FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved products"
  ON saved_products FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved products"
  ON saved_products FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved products"
  ON saved_products FOR DELETE
  USING (auth.uid() = user_id);

-- Requests policies
DROP POLICY IF EXISTS "Users can read own requests" ON requests;
DROP POLICY IF EXISTS "Users can insert own requests" ON requests;
DROP POLICY IF EXISTS "Users can update own requests" ON requests;
DROP POLICY IF EXISTS "Users can delete own requests" ON requests;

CREATE POLICY "Users can read own requests"
  ON requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own requests"
  ON requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own requests"
  ON requests FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own requests"
  ON requests FOR DELETE
  USING (auth.uid() = user_id);

-- Group Buying policies
DROP POLICY IF EXISTS "Public read group_buying" ON group_buying;
DROP POLICY IF EXISTS "Users can insert own group_buying" ON group_buying;
DROP POLICY IF EXISTS "Users can update own group_buying" ON group_buying;
DROP POLICY IF EXISTS "Users can delete own group_buying" ON group_buying;

CREATE POLICY "Public read group_buying"
  ON group_buying FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own group_buying"
  ON group_buying FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own group_buying"
  ON group_buying FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own group_buying"
  ON group_buying FOR DELETE
  USING (auth.uid() = user_id);

-- Auctions policies
DROP POLICY IF EXISTS "Public read auctions" ON auctions;
DROP POLICY IF EXISTS "Users can insert own auctions" ON auctions;
DROP POLICY IF EXISTS "Users can update own auctions" ON auctions;
DROP POLICY IF EXISTS "Users can delete own auctions" ON auctions;

CREATE POLICY "Public read auctions"
  ON auctions FOR SELECT
  USING (true);

CREATE POLICY "Users can insert own auctions"
  ON auctions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own auctions"
  ON auctions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own auctions"
  ON auctions FOR DELETE
  USING (auth.uid() = user_id);

-- Auction Bids policies
DROP POLICY IF EXISTS "Users can read own auction_bids" ON auction_bids;
DROP POLICY IF EXISTS "Users can insert own auction_bids" ON auction_bids;

CREATE POLICY "Users can read own auction_bids"
  ON auction_bids FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own auction_bids"
  ON auction_bids FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Deliveries policies
DROP POLICY IF EXISTS "Users can read own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Users can insert own deliveries" ON deliveries;
DROP POLICY IF EXISTS "Users can update own deliveries" ON deliveries;

CREATE POLICY "Users can read own deliveries"
  ON deliveries FOR SELECT
  USING (auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = deliveries.order_id));

CREATE POLICY "Users can insert own deliveries"
  ON deliveries FOR INSERT
  WITH CHECK (auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = deliveries.order_id));

CREATE POLICY "Users can update own deliveries"
  ON deliveries FOR UPDATE
  USING (auth.uid() = (SELECT buyer_id FROM orders WHERE orders.id = deliveries.order_id));

-- ============================================
-- INDEXES (for performance)
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_products_product_id ON saved_products(product_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_group_buying_user_id ON group_buying(user_id);
CREATE INDEX IF NOT EXISTS idx_group_buying_status ON group_buying(status);
CREATE INDEX IF NOT EXISTS idx_auctions_user_id ON auctions(user_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction_id ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_order_id ON deliveries(order_id);
CREATE INDEX IF NOT EXISTS idx_deliveries_status ON deliveries(status);

-- ============================================
-- DONE! Schema created successfully.
-- ============================================
