-- Add foreign key columns to calls table for linking to commerce data
ALTER TABLE public.calls 
ADD COLUMN order_id UUID REFERENCES public.commerce_orders(id) ON DELETE SET NULL,
ADD COLUMN cart_id UUID REFERENCES public.commerce_abandoned_carts(id) ON DELETE SET NULL;

-- Add indexes for efficient lookups
CREATE INDEX idx_calls_order_id ON public.calls(order_id) WHERE order_id IS NOT NULL;
CREATE INDEX idx_calls_cart_id ON public.calls(cart_id) WHERE cart_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.calls.order_id IS 'Links call to a commerce order (for COD confirmation calls)';
COMMENT ON COLUMN public.calls.cart_id IS 'Links call to an abandoned cart (for cart recovery calls)';