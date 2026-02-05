-- Add campaign type and auto-trigger settings to campaigns table
ALTER TABLE campaigns 
ADD COLUMN IF NOT EXISTS campaign_type text DEFAULT 'outbound',
ADD COLUMN IF NOT EXISTS auto_trigger_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS max_retry_attempts integer DEFAULT 3,
ADD COLUMN IF NOT EXISTS retry_delay_minutes integer DEFAULT 60;

-- Add call_enqueued_at to commerce_orders table
ALTER TABLE commerce_orders 
ADD COLUMN IF NOT EXISTS call_enqueued_at timestamptz;

-- Index for finding trigger-ready orders that haven't been queued
CREATE INDEX IF NOT EXISTS idx_orders_trigger_ready_enqueued 
ON commerce_orders (organization_id, trigger_ready, call_enqueued_at) 
WHERE trigger_ready = 'ready' AND call_enqueued_at IS NULL;

-- Create call_queue table (removed contacts FK since table doesn't exist)
CREATE TABLE IF NOT EXISTS call_queue (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id uuid REFERENCES organizations(id) NOT NULL,
    campaign_id uuid REFERENCES campaigns(id) NOT NULL,
    order_id uuid REFERENCES commerce_orders(id),
    cart_id uuid REFERENCES commerce_abandoned_carts(id),
    customer_id uuid REFERENCES commerce_customers(id),
    phone_number text NOT NULL,
    status text NOT NULL DEFAULT 'pending',
    scheduled_at timestamptz DEFAULT now(),
    retry_count integer DEFAULT 0,
    error_message text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Add comment for status values
COMMENT ON COLUMN call_queue.status IS 'pending, processing, completed, failed, cancelled';

-- Unique constraint for idempotency (one queue item per order per campaign)
CREATE UNIQUE INDEX IF NOT EXISTS idx_call_queue_order_idempotency 
ON call_queue (order_id, campaign_id) 
WHERE order_id IS NOT NULL;

-- Unique constraint for cart idempotency
CREATE UNIQUE INDEX IF NOT EXISTS idx_call_queue_cart_idempotency 
ON call_queue (cart_id, campaign_id) 
WHERE cart_id IS NOT NULL;

-- Index for finding pending items for a campaign
CREATE INDEX IF NOT EXISTS idx_call_queue_processing 
ON call_queue (campaign_id, status, scheduled_at) 
WHERE status = 'pending';

-- Index for counting active calls (processing)
CREATE INDEX IF NOT EXISTS idx_call_queue_active 
ON call_queue (campaign_id, status) 
WHERE status = 'processing';

-- Trigger to update updated_at (using existing function)
CREATE TRIGGER update_call_queue_updated_at
    BEFORE UPDATE ON call_queue
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Enable RLS on call_queue
ALTER TABLE call_queue ENABLE ROW LEVEL SECURITY;

-- RLS Policies for call_queue
CREATE POLICY "Users can view org call queue" 
ON call_queue FOR SELECT 
TO authenticated
USING (
    organization_id = get_user_organization_id(auth.uid()) 
    OR has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Users can create org call queue items" 
ON call_queue FOR INSERT 
TO authenticated
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can update org call queue items" 
ON call_queue FOR UPDATE 
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));

CREATE POLICY "Users can delete org call queue items" 
ON call_queue FOR DELETE 
TO authenticated
USING (organization_id = get_user_organization_id(auth.uid()));