
-- Create source-agnostic enums
CREATE TYPE public.commerce_source AS ENUM ('shopify', 'woocommerce', 'custom_webhook');
CREATE TYPE public.integration_status AS ENUM ('connected', 'disconnected', 'error', 'pending');
CREATE TYPE public.webhook_status AS ENUM ('active', 'failed', 'pending');
CREATE TYPE public.product_status AS ENUM ('active', 'draft', 'archived');
CREATE TYPE public.order_financial_status AS ENUM ('pending', 'paid', 'refunded', 'partially_refunded', 'voided');
CREATE TYPE public.order_fulfillment_status AS ENUM ('unfulfilled', 'partial', 'fulfilled', 'restocked');
CREATE TYPE public.payment_type AS ENUM ('cod', 'prepaid', 'unknown');
CREATE TYPE public.cart_status AS ENUM ('abandoned', 'recovered', 'expired');
CREATE TYPE public.trigger_ready_status AS ENUM ('ready', 'missing_phone', 'not_applicable');

-- Commerce Integrations (source-agnostic)
CREATE TABLE public.commerce_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source commerce_source NOT NULL,
  status integration_status NOT NULL DEFAULT 'pending',
  store_name text,
  store_domain text,
  external_store_id text,
  access_token_encrypted text,
  webhook_status webhook_status DEFAULT 'pending',
  last_sync_at timestamptz,
  last_products_sync_at timestamptz,
  last_orders_sync_at timestamptz,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, source)
);

-- Commerce Products (source-agnostic)
CREATE TABLE public.commerce_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.commerce_integrations(id) ON DELETE CASCADE,
  source commerce_source NOT NULL,
  external_product_id text NOT NULL,
  title text NOT NULL,
  description text,
  vendor text,
  product_type text,
  status product_status DEFAULT 'active',
  tags jsonb DEFAULT '[]',
  images jsonb DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, source, external_product_id)
);

-- Commerce Product Variants
CREATE TABLE public.commerce_product_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.commerce_products(id) ON DELETE CASCADE,
  external_variant_id text NOT NULL,
  title text,
  sku text,
  price numeric(10,2),
  compare_at_price numeric(10,2),
  inventory_quantity integer DEFAULT 0,
  weight numeric(10,2),
  weight_unit text DEFAULT 'kg',
  requires_shipping boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(product_id, external_variant_id)
);

-- Commerce Customers (source-agnostic, deduplicated by phone)
CREATE TABLE public.commerce_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  source commerce_source NOT NULL,
  external_customer_id text,
  first_name text,
  last_name text,
  email text,
  phone text,
  accepts_marketing boolean DEFAULT false,
  total_orders integer DEFAULT 0,
  total_spent numeric(12,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, phone) -- Deduplicate by phone within org
);

-- Commerce Orders (source-agnostic)
CREATE TABLE public.commerce_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.commerce_integrations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.commerce_customers(id),
  source commerce_source NOT NULL,
  external_order_id text NOT NULL,
  order_number text,
  customer_name text,
  customer_phone text,
  customer_email text,
  subtotal numeric(12,2),
  total_tax numeric(12,2),
  total_discounts numeric(12,2),
  total_amount numeric(12,2) NOT NULL,
  currency text DEFAULT 'INR',
  financial_status order_financial_status DEFAULT 'pending',
  fulfillment_status order_fulfillment_status DEFAULT 'unfulfilled',
  payment_type payment_type DEFAULT 'unknown',
  trigger_ready trigger_ready_status GENERATED ALWAYS AS (
    CASE 
      WHEN payment_type = 'prepaid' THEN 'not_applicable'::trigger_ready_status
      WHEN payment_type = 'cod' AND customer_phone IS NOT NULL AND customer_phone != '' THEN 'ready'::trigger_ready_status
      ELSE 'missing_phone'::trigger_ready_status
    END
  ) STORED,
  items_count integer DEFAULT 0,
  notes text,
  tags jsonb DEFAULT '[]',
  shipping_address jsonb,
  billing_address jsonb,
  order_created_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, source, external_order_id)
);

-- Commerce Order Items
CREATE TABLE public.commerce_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id uuid NOT NULL REFERENCES public.commerce_orders(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.commerce_products(id),
  variant_id uuid REFERENCES public.commerce_product_variants(id),
  external_line_item_id text,
  title text NOT NULL,
  variant_title text,
  sku text,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Abandoned Carts (source-agnostic)
CREATE TABLE public.commerce_abandoned_carts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  integration_id uuid NOT NULL REFERENCES public.commerce_integrations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.commerce_customers(id),
  source commerce_source NOT NULL,
  external_cart_id text NOT NULL,
  customer_name text,
  customer_phone text,
  customer_email text,
  total_value numeric(12,2) DEFAULT 0,
  currency text DEFAULT 'INR',
  items_count integer DEFAULT 0,
  status cart_status DEFAULT 'abandoned',
  trigger_ready trigger_ready_status GENERATED ALWAYS AS (
    CASE 
      WHEN customer_phone IS NOT NULL AND customer_phone != '' THEN 'ready'::trigger_ready_status
      ELSE 'missing_phone'::trigger_ready_status
    END
  ) STORED,
  recovery_url text,
  abandoned_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  synced_at timestamptz DEFAULT now(),
  UNIQUE(organization_id, source, external_cart_id)
);

-- Abandoned Cart Items
CREATE TABLE public.commerce_cart_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id uuid NOT NULL REFERENCES public.commerce_abandoned_carts(id) ON DELETE CASCADE,
  product_id uuid REFERENCES public.commerce_products(id),
  variant_id uuid REFERENCES public.commerce_product_variants(id),
  external_line_item_id text,
  title text NOT NULL,
  variant_title text,
  quantity integer NOT NULL DEFAULT 1,
  price numeric(10,2) NOT NULL,
  total numeric(10,2) NOT NULL,
  image_url text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.commerce_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_abandoned_carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commerce_cart_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for commerce_integrations
CREATE POLICY "Users can view org integrations" ON public.commerce_integrations
FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Org admins can create integrations" ON public.commerce_integrations
FOR INSERT TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()) AND is_org_admin(auth.uid()));

CREATE POLICY "Org admins can update integrations" ON public.commerce_integrations
FOR UPDATE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) AND is_org_admin(auth.uid()));

CREATE POLICY "Org admins can delete integrations" ON public.commerce_integrations
FOR DELETE TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) AND is_org_admin(auth.uid()));

-- RLS Policies for commerce_products
CREATE POLICY "Users can view org products" ON public.commerce_products
FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage products" ON public.commerce_products
FOR ALL TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies for commerce_product_variants
CREATE POLICY "Users can view org variants" ON public.commerce_product_variants
FOR SELECT TO authenticated
USING (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage variants" ON public.commerce_product_variants
FOR ALL TO authenticated
USING (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())))
WITH CHECK (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())));

-- RLS Policies for commerce_customers
CREATE POLICY "Users can view org customers" ON public.commerce_customers
FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage customers" ON public.commerce_customers
FOR ALL TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies for commerce_orders
CREATE POLICY "Users can view org orders" ON public.commerce_orders
FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage orders" ON public.commerce_orders
FOR ALL TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies for commerce_order_items
CREATE POLICY "Users can view org order items" ON public.commerce_order_items
FOR SELECT TO authenticated
USING (order_id IN (SELECT id FROM commerce_orders WHERE organization_id = get_user_organization_id(auth.uid())) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage order items" ON public.commerce_order_items
FOR ALL TO authenticated
USING (order_id IN (SELECT id FROM commerce_orders WHERE organization_id = get_user_organization_id(auth.uid())))
WITH CHECK (order_id IN (SELECT id FROM commerce_orders WHERE organization_id = get_user_organization_id(auth.uid())));

-- RLS Policies for commerce_abandoned_carts
CREATE POLICY "Users can view org carts" ON public.commerce_abandoned_carts
FOR SELECT TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage carts" ON public.commerce_abandoned_carts
FOR ALL TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

-- RLS Policies for commerce_cart_items
CREATE POLICY "Users can view org cart items" ON public.commerce_cart_items
FOR SELECT TO authenticated
USING (cart_id IN (SELECT id FROM commerce_abandoned_carts WHERE organization_id = get_user_organization_id(auth.uid())) OR has_role(auth.uid(), 'admin'));

CREATE POLICY "System can manage cart items" ON public.commerce_cart_items
FOR ALL TO authenticated
USING (cart_id IN (SELECT id FROM commerce_abandoned_carts WHERE organization_id = get_user_organization_id(auth.uid())))
WITH CHECK (cart_id IN (SELECT id FROM commerce_abandoned_carts WHERE organization_id = get_user_organization_id(auth.uid())));

-- Indexes for performance
CREATE INDEX idx_commerce_integrations_org ON public.commerce_integrations(organization_id);
CREATE INDEX idx_commerce_integrations_source ON public.commerce_integrations(source);
CREATE INDEX idx_commerce_products_org ON public.commerce_products(organization_id);
CREATE INDEX idx_commerce_products_source ON public.commerce_products(source);
CREATE INDEX idx_commerce_products_status ON public.commerce_products(status);
CREATE INDEX idx_commerce_orders_org ON public.commerce_orders(organization_id);
CREATE INDEX idx_commerce_orders_source ON public.commerce_orders(source);
CREATE INDEX idx_commerce_orders_trigger ON public.commerce_orders(trigger_ready);
CREATE INDEX idx_commerce_orders_created ON public.commerce_orders(order_created_at DESC);
CREATE INDEX idx_commerce_carts_org ON public.commerce_abandoned_carts(organization_id);
CREATE INDEX idx_commerce_carts_source ON public.commerce_abandoned_carts(source);
CREATE INDEX idx_commerce_carts_trigger ON public.commerce_abandoned_carts(trigger_ready);
CREATE INDEX idx_commerce_carts_abandoned ON public.commerce_abandoned_carts(abandoned_at DESC);
CREATE INDEX idx_commerce_customers_phone ON public.commerce_customers(organization_id, phone);

-- Auto-update timestamps
CREATE TRIGGER update_commerce_integrations_updated_at BEFORE UPDATE ON public.commerce_integrations
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commerce_products_updated_at BEFORE UPDATE ON public.commerce_products
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commerce_product_variants_updated_at BEFORE UPDATE ON public.commerce_product_variants
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commerce_customers_updated_at BEFORE UPDATE ON public.commerce_customers
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commerce_orders_updated_at BEFORE UPDATE ON public.commerce_orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_commerce_carts_updated_at BEFORE UPDATE ON public.commerce_abandoned_carts
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
