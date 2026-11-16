# AgriHub Supabase Database Schema

## Tables

### 1. products
```sql
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  quantity TEXT,
  category TEXT NOT NULL,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Sample Data:**
```sql
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
```

### 2. profiles (auto-created on signup)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  account_type TEXT DEFAULT 'buyer' CHECK (account_type IN ('buyer', 'seller')),
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
```

**Account Types:**
- `buyer` - For customers who purchase products
- `seller` - For farmers/suppliers who sell products

**Trigger to auto-create profile:**
```sql
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
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

### 3. orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',
  total_amount DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Sample Data:**
```sql
INSERT INTO orders (user_id, status, total_amount, items) VALUES
('user-uuid-here', 'pending', 500, '[{"product_id":"1","name":"Fresh Eggs","quantity":5,"price":120}]');
```

### 4. order_items (optional - for normalized structure)
```sql
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 5. saved_products
```sql
CREATE TABLE saved_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);
```

## Row Level Security (RLS)

### Enable RLS on all tables
```sql
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_products ENABLE ROW LEVEL SECURITY;
```

### Products - Public read
```sql
CREATE POLICY "Public read products"
  ON products FOR SELECT
  USING (true);
```

### Profiles - Users can read/update their own profile
```sql
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
```

### Orders - Users can read/create their own orders
```sql
CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own orders"
  ON orders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Saved Products - Users can manage their own saved products
```sql
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
```

## Indexes (for performance)
```sql
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_saved_products_user_id ON saved_products(user_id);
CREATE INDEX idx_saved_products_product_id ON saved_products(product_id);
```

## Environment Variables
Add these to your `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then update `lib/supabase.js`:
```javascript
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```
