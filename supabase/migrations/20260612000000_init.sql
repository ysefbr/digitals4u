-- Database Migration for DigitalServices4U
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Tables

-- Profile/Users table extending Supabase Auth
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT CHECK (role IN ('admin', 'customer')) DEFAULT 'customer' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  stock_count INTEGER NOT NULL DEFAULT 0,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  status TEXT CHECK (status IN ('Pending Confirmation', 'Waiting for Payment', 'Paid', 'Processing', 'Delivered', 'Cancelled')) DEFAULT 'Pending Confirmation' NOT NULL,
  customer_details JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order Items table
CREATE TABLE public.order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  price_at_purchase NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Secure Vault table for digital delivery
CREATE TABLE public.secure_vault (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE UNIQUE NOT NULL,
  credentials_text TEXT NOT NULL,
  is_revealed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Global Settings table (restricted to one row)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT '00000000-0000-0000-0000-000000000000'::uuid,
  whatsapp_number TEXT NOT NULL,
  site_name TEXT NOT NULL DEFAULT 'DigitalServices4U',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  CONSTRAINT settings_single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid)
);

-- Seed Settings
INSERT INTO public.settings (id, whatsapp_number, site_name)
VALUES ('00000000-0000-0000-0000-000000000000', '+21694268200', 'DigitalServices4U')
ON CONFLICT (id) DO NOTHING;


-- 2. Setup Row Level Security (RLS)

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.secure_vault ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;


-- 3. Helper Functions

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to deduct product stock securely (bypasses RLS write check)
CREATE OR REPLACE FUNCTION public.deduct_product_stock(product_id UUID, amount INT)
RETURNS void AS $$
BEGIN
  UPDATE public.products
  SET stock_count = stock_count - amount
  WHERE id = product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to securely auto-cancel expired orders (>24 hours) and restore stock
CREATE OR REPLACE FUNCTION public.auto_cancel_expired_orders()
RETURNS TABLE (cancelled_order_id UUID) AS $$
DECLARE
  order_rec RECORD;
  item_rec RECORD;
  threshold TIMESTAMP WITH TIME ZONE;
BEGIN
  threshold := now() - INTERVAL '24 hours';
  
  -- Loop through expired orders
  FOR order_rec IN 
    SELECT id FROM public.orders
    WHERE status IN ('Pending Confirmation', 'Waiting for Payment')
      AND created_at < threshold
  LOOP
    -- 1. Restore stock for each item in the order
    FOR item_rec IN 
      SELECT product_id, quantity FROM public.order_items
      WHERE order_id = order_rec.id
    LOOP
      UPDATE public.products
      SET stock_count = stock_count + item_rec.quantity
      WHERE id = item_rec.product_id;
    END LOOP;
    
    -- 2. Update order status to Cancelled
    UPDATE public.orders
    SET status = 'Cancelled'
    WHERE id = order_rec.id;
    
    cancelled_order_id := order_rec.id;
    RETURN NEXT;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 4. RLS Policies

-- Public Users Policies
CREATE POLICY "Users are viewable by owner or admin" ON public.users
  FOR SELECT USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can edit their own profiles" ON public.users
  FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Categories Policies
CREATE POLICY "Categories are readable by everyone" ON public.categories
  FOR SELECT USING (true);

CREATE POLICY "Categories are manageable by admin" ON public.categories
  FOR ALL USING (public.is_admin());

-- Products Policies
CREATE POLICY "Active products are readable by everyone" ON public.products
  FOR SELECT USING (is_active = true OR public.is_admin());

CREATE POLICY "Products are manageable by admin" ON public.products
  FOR ALL USING (public.is_admin());

-- Orders Policies
CREATE POLICY "Orders can be created by owner or guests" ON public.orders
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Orders are viewable by owner, guest, or admin" ON public.orders
  FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL OR public.is_admin());

CREATE POLICY "Orders are manageable by admin" ON public.orders
  FOR ALL USING (public.is_admin());

-- Order Items Policies
CREATE POLICY "Order items can be inserted by owner or guests" ON public.order_items
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    )
  );

CREATE POLICY "Order items are viewable by owner, guest, or admin" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = order_items.order_id 
        AND (user_id = auth.uid() OR user_id IS NULL)
    ) OR public.is_admin()
  );

CREATE POLICY "Order items are manageable by admin" ON public.order_items
  FOR ALL USING (public.is_admin());

-- Secure Vault Policies
-- Customers can only view credentials if order belongs to them and status is Delivered
CREATE POLICY "Vault is viewable by owner on delivery or admin" ON public.secure_vault
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE id = secure_vault.order_id
        AND user_id = auth.uid()
        AND status = 'Delivered'
    ) OR public.is_admin()
  );

CREATE POLICY "Vault is manageable by admin" ON public.secure_vault
  FOR ALL USING (public.is_admin());

-- Settings Policies
CREATE POLICY "Settings are viewable by everyone" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "Settings are manageable by admin" ON public.settings
  FOR ALL USING (public.is_admin());


-- 5. Automation Triggers

-- Trigger: Automatically create profile in public.users on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  is_first_user boolean;
BEGIN
  -- Default first signup to admin for testing, others to customer
  SELECT NOT EXISTS (SELECT 1 FROM public.users) INTO is_first_user;

  INSERT INTO public.users (id, email, role)
  VALUES (
    new.id,
    new.email,
    CASE WHEN is_first_user THEN 'admin' ELSE 'customer' END
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 6. Seed Categories & Products with valid UUIDs

-- Seed Categories
INSERT INTO public.categories (id, name, slug, image)
VALUES
  ('c1000000-0000-0000-0000-000000000001'::uuid, 'AI Tools', 'ai-tools', 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=400&q=80'),
  ('c2000000-0000-0000-0000-000000000002'::uuid, 'Streaming', 'streaming', 'https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?w=400&q=80'),
  ('c3000000-0000-0000-0000-000000000003'::uuid, 'Software & Dev', 'software-dev', 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=400&q=80')
ON CONFLICT (id) DO NOTHING;

-- Seed Products
INSERT INTO public.products (id, title, description, price, stock_count, category_id, is_active)
VALUES
  ('11000000-0000-0000-0000-000000000001'::uuid, 'ChatGPT Plus Premium', 'Access GPT-4, DALL-E, and advanced data analysis tools. Direct delivery with shared or private options.', 65.00, 15, 'c1000000-0000-0000-0000-000000000001'::uuid, true),
  ('22000000-0000-0000-0000-000000000002'::uuid, 'Midjourney Pro Plan', 'Generate breathtaking images with the world''s leading AI art creator. Unlimited relaxed GPU hours.', 95.00, 3, 'c1000000-0000-0000-0000-000000000001'::uuid, true),
  ('33000000-0000-0000-0000-000000000003'::uuid, 'Netflix Premium 4K', 'Stream unlimited movies and TV shows in 4K Ultra HD. 4 concurrent screens supported.', 15.00, 8, 'c2000000-0000-0000-0000-000000000002'::uuid, true),
  ('44000000-0000-0000-0000-000000000004'::uuid, 'Spotify Premium Individual', 'Listen to music without ad interruptions, download tracks for offline playing, and high quality audio.', 8.50, 22, 'c2000000-0000-0000-0000-000000000002'::uuid, true),
  ('55000000-0000-0000-0000-000000000005'::uuid, 'Canva Pro Annual', 'Design anything like a professional. Millions of premium templates, photos, and fonts.', 45.00, 12, 'c3000000-0000-0000-0000-000000000003'::uuid, true),
  ('66000000-0000-0000-0000-000000000006'::uuid, 'YouTube Premium 1-Month', 'Watch YouTube without ads, play video in background, and download videos to play offline.', 9.00, 19, 'c2000000-0000-0000-0000-000000000002'::uuid, true)
ON CONFLICT (id) DO NOTHING;
