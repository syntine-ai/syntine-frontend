-- Make integration_id nullable for manual orders
ALTER TABLE public.commerce_orders 
ALTER COLUMN integration_id DROP NOT NULL;

-- Add comment to clarify manual orders
COMMENT ON COLUMN public.commerce_orders.integration_id IS 'Integration that synced this order. NULL for manually created orders.';

-- Update the external_order_id to allow auto-generation for manual orders
-- We'll generate a unique ID like 'manual_<uuid>' in the application code