
-- First truncate orphaned commerce_order_items since their parent orders are gone
TRUNCATE public.commerce_order_items;

-- 1. commerce_integrations
CREATE TABLE public.commerce_integrations (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    source commerce_source NOT NULL,
    status integration_status NOT NULL DEFAULT 'pending'::integration_status,
    store_name text,
    store_domain text,
    external_store_id text,
    access_token_encrypted text,
    webhook_status webhook_status DEFAULT 'pending'::webhook_status,
    settings jsonb DEFAULT '{}'::jsonb,
    last_sync_at timestamptz,
    last_products_sync_at timestamptz,
    last_orders_sync_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.commerce_integrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org integrations" ON public.commerce_integrations
    FOR SELECT TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can create org integrations" ON public.commerce_integrations
    FOR INSERT TO authenticated
    WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org integrations" ON public.commerce_integrations
    FOR UPDATE TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()))
    WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete org integrations" ON public.commerce_integrations
    FOR DELETE TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()));

CREATE TRIGGER update_commerce_integrations_updated_at
    BEFORE UPDATE ON public.commerce_integrations
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 2. commerce_customers
CREATE TABLE public.commerce_customers (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    external_customer_id text,
    source commerce_source NOT NULL,
    first_name text,
    last_name text,
    email text,
    phone text,
    accepts_marketing boolean DEFAULT false,
    total_orders integer DEFAULT 0,
    total_spent numeric DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.commerce_customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org customers" ON public.commerce_customers
    FOR SELECT TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage customers" ON public.commerce_customers
    FOR ALL TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()))
    WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE TRIGGER update_commerce_customers_updated_at
    BEFORE UPDATE ON public.commerce_customers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 3. commerce_products
CREATE TABLE public.commerce_products (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    integration_id uuid NOT NULL REFERENCES public.commerce_integrations(id),
    external_product_id text NOT NULL,
    source commerce_source NOT NULL,
    title text NOT NULL,
    description text,
    vendor text,
    product_type text,
    status product_status DEFAULT 'active'::product_status,
    images jsonb,
    tags jsonb,
    synced_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.commerce_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org products" ON public.commerce_products
    FOR SELECT TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage products" ON public.commerce_products
    FOR ALL TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()))
    WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE TRIGGER update_commerce_products_updated_at
    BEFORE UPDATE ON public.commerce_products
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 4. commerce_product_variants
CREATE TABLE public.commerce_product_variants (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id uuid NOT NULL REFERENCES public.commerce_products(id) ON DELETE CASCADE,
    external_variant_id text NOT NULL,
    title text,
    sku text,
    price numeric,
    compare_at_price numeric,
    inventory_quantity integer,
    requires_shipping boolean DEFAULT true,
    weight numeric,
    weight_unit text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.commerce_product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org product variants" ON public.commerce_product_variants
    FOR SELECT TO authenticated
    USING (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage product variants" ON public.commerce_product_variants
    FOR ALL TO authenticated
    USING (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())))
    WITH CHECK (product_id IN (SELECT id FROM commerce_products WHERE organization_id = get_user_organization_id(auth.uid())));

CREATE TRIGGER update_commerce_product_variants_updated_at
    BEFORE UPDATE ON public.commerce_product_variants
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. commerce_orders
CREATE TABLE public.commerce_orders (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid NOT NULL REFERENCES public.organizations(id),
    integration_id uuid REFERENCES public.commerce_integrations(id),
    external_order_id text NOT NULL,
    order_number text,
    source commerce_source NOT NULL,
    customer_id uuid REFERENCES public.commerce_customers(id),
    customer_name text,
    customer_email text,
    customer_phone text,
    total_amount numeric NOT NULL,
    subtotal numeric,
    total_tax numeric,
    total_discounts numeric,
    currency text DEFAULT 'INR'::text,
    payment_type payment_type DEFAULT 'unknown'::payment_type,
    financial_status order_financial_status DEFAULT 'pending'::order_financial_status,
    fulfillment_status order_fulfillment_status DEFAULT 'unfulfilled'::order_fulfillment_status,
    trigger_ready trigger_ready_status,
    shipping_address jsonb,
    billing_address jsonb,
    items_count integer,
    notes text,
    tags jsonb,
    order_created_at timestamptz,
    call_enqueued_at timestamptz,
    synced_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.commerce_orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org orders" ON public.commerce_orders
    FOR SELECT TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()) OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "System can manage orders" ON public.commerce_orders
    FOR ALL TO authenticated
    USING (organization_id = get_user_organization_id(auth.uid()))
    WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE TRIGGER update_commerce_orders_updated_at
    BEFORE UPDATE ON public.commerce_orders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Re-add foreign keys on commerce_order_items
ALTER TABLE public.commerce_order_items
    ADD CONSTRAINT commerce_order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.commerce_orders(id);

ALTER TABLE public.commerce_order_items
    ADD CONSTRAINT commerce_order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.commerce_products(id);

ALTER TABLE public.commerce_order_items
    ADD CONSTRAINT commerce_order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES public.commerce_product_variants(id);

-- Re-add foreign keys on commerce_abandoned_carts
ALTER TABLE public.commerce_abandoned_carts
    ADD CONSTRAINT commerce_abandoned_carts_integration_id_fkey FOREIGN KEY (integration_id) REFERENCES public.commerce_integrations(id);

ALTER TABLE public.commerce_abandoned_carts
    ADD CONSTRAINT commerce_abandoned_carts_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.commerce_customers(id);
