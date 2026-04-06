-- Create user role enum
CREATE TYPE public.user_role AS ENUM ('user', 'admin');

-- Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  email text UNIQUE NOT NULL,
  role user_role NOT NULL DEFAULT 'user',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create companies table
CREATE TABLE public.companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  company_name text NOT NULL,
  gst_number text NOT NULL,
  address text NOT NULL,
  contact_phone text,
  contact_email text,
  logo_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Create bills table
CREATE TABLE public.bills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  bill_no text NOT NULL,
  bill_date date NOT NULL DEFAULT CURRENT_DATE,
  customer_name text NOT NULL,
  customer_address text,
  customer_gst_number text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  total_cgst numeric(12,2) NOT NULL DEFAULT 0,
  total_sgst numeric(12,2) NOT NULL DEFAULT 0,
  grand_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, bill_no)
);

-- Create bill_items table
CREATE TABLE public.bill_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bill_id uuid NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  hsn_code text,
  quantity numeric(12,2) NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 9.00,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 9.00,
  cgst_amount numeric(12,2) NOT NULL,
  sgst_amount numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create purchase_orders table
CREATE TABLE public.purchase_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  po_no text NOT NULL,
  po_date date NOT NULL DEFAULT CURRENT_DATE,
  supplier_name text NOT NULL,
  supplier_contact text,
  supplier_address text,
  supplier_gst_number text,
  subtotal numeric(12,2) NOT NULL DEFAULT 0,
  total_cgst numeric(12,2) NOT NULL DEFAULT 0,
  total_sgst numeric(12,2) NOT NULL DEFAULT 0,
  grand_total numeric(12,2) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, po_no)
);

-- Create purchase_order_items table
CREATE TABLE public.purchase_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id uuid NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  hsn_code text,
  quantity numeric(12,2) NOT NULL,
  unit_price numeric(12,2) NOT NULL,
  cgst_rate numeric(5,2) NOT NULL DEFAULT 9.00,
  sgst_rate numeric(5,2) NOT NULL DEFAULT 9.00,
  cgst_amount numeric(12,2) NOT NULL,
  sgst_amount numeric(12,2) NOT NULL,
  line_total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create stock_items table
CREATE TABLE public.stock_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  item_name text NOT NULL,
  hsn_code text,
  quantity numeric(12,2) NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'pcs',
  low_stock_threshold numeric(12,2) NOT NULL DEFAULT 10,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, item_name, hsn_code)
);

-- Create indexes
CREATE INDEX idx_bills_user_id ON bills(user_id);
CREATE INDEX idx_bills_bill_date ON bills(bill_date);
CREATE INDEX idx_bill_items_bill_id ON bill_items(bill_id);
CREATE INDEX idx_purchase_orders_user_id ON purchase_orders(user_id);
CREATE INDEX idx_purchase_orders_po_date ON purchase_orders(po_date);
CREATE INDEX idx_purchase_order_items_po_id ON purchase_order_items(po_id);
CREATE INDEX idx_stock_items_user_id ON stock_items(user_id);
CREATE INDEX idx_companies_user_id ON companies(user_id);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;
ALTER TABLE bill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;

-- Create helper function to check admin role
CREATE OR REPLACE FUNCTION is_admin(uid uuid)
RETURNS boolean LANGUAGE sql SECURITY DEFINER AS $$
  SELECT EXISTS (
    SELECT 1 FROM profiles p
    WHERE p.id = uid AND p.role = 'admin'::user_role
  );
$$;

-- Profiles policies
CREATE POLICY "Admins have full access to profiles" ON profiles
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE TO authenticated USING (auth.uid() = id)
  WITH CHECK (role IS NOT DISTINCT FROM (SELECT role FROM profiles WHERE id = auth.uid()));

-- Companies policies
CREATE POLICY "Users can view their own company" ON companies
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own company" ON companies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own company" ON companies
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Admins have full access to companies" ON companies
  FOR ALL TO authenticated USING (is_admin(auth.uid()));

-- Bills policies
CREATE POLICY "Users can view their own bills" ON bills
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own bills" ON bills
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" ON bills
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills" ON bills
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Bill items policies
CREATE POLICY "Users can view bill items for their bills" ON bill_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = bill_items.bill_id AND bills.user_id = auth.uid())
  );

CREATE POLICY "Users can insert bill items for their bills" ON bill_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = bill_items.bill_id AND bills.user_id = auth.uid())
  );

CREATE POLICY "Users can update bill items for their bills" ON bill_items
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = bill_items.bill_id AND bills.user_id = auth.uid())
  );

CREATE POLICY "Users can delete bill items for their bills" ON bill_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM bills WHERE bills.id = bill_items.bill_id AND bills.user_id = auth.uid())
  );

-- Purchase orders policies
CREATE POLICY "Users can view their own purchase orders" ON purchase_orders
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own purchase orders" ON purchase_orders
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own purchase orders" ON purchase_orders
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own purchase orders" ON purchase_orders
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Purchase order items policies
CREATE POLICY "Users can view PO items for their POs" ON purchase_order_items
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.po_id AND purchase_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can insert PO items for their POs" ON purchase_order_items
  FOR INSERT TO authenticated WITH CHECK (
    EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.po_id AND purchase_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can update PO items for their POs" ON purchase_order_items
  FOR UPDATE TO authenticated USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.po_id AND purchase_orders.user_id = auth.uid())
  );

CREATE POLICY "Users can delete PO items for their POs" ON purchase_order_items
  FOR DELETE TO authenticated USING (
    EXISTS (SELECT 1 FROM purchase_orders WHERE purchase_orders.id = purchase_order_items.po_id AND purchase_orders.user_id = auth.uid())
  );

-- Stock items policies
CREATE POLICY "Users can view their own stock items" ON stock_items
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own stock items" ON stock_items
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stock items" ON stock_items
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own stock items" ON stock_items
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Create trigger function to sync auth.users to profiles
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count int;
  username_part text;
BEGIN
  SELECT COUNT(*) INTO user_count FROM profiles;
  
  -- Extract username from email (before @)
  username_part := split_part(NEW.email, '@', 1);
  
  -- Insert a profile synced with fields collected at signup
  INSERT INTO public.profiles (id, username, email, role)
  VALUES (
    NEW.id,
    username_part,
    NEW.email,
    CASE WHEN user_count = 0 THEN 'admin'::public.user_role ELSE 'user'::public.user_role END
  );
  RETURN NEW;
END;
$$;

-- Create trigger to sync users on confirmation
DROP TRIGGER IF EXISTS on_auth_user_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.confirmed_at IS NULL AND NEW.confirmed_at IS NOT NULL)
  EXECUTE FUNCTION handle_new_user();

-- Create storage bucket for company logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('aexewhy21fr5_company_logos', 'aexewhy21fr5_company_logos', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for company logos
CREATE POLICY "Authenticated users can upload logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'aexewhy21fr5_company_logos');

CREATE POLICY "Public can view logos"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'aexewhy21fr5_company_logos');

CREATE POLICY "Users can update their own logos"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'aexewhy21fr5_company_logos');

CREATE POLICY "Users can delete their own logos"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'aexewhy21fr5_company_logos');