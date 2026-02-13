
-- Fix: campaign_active_calls missing RLS (pre-existing issue)
ALTER TABLE campaign_active_calls ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view org campaign active calls"
ON campaign_active_calls FOR SELECT TO authenticated
USING (campaign_id IN (
    SELECT id FROM campaigns
    WHERE organization_id = get_user_organization_id(auth.uid())
));

CREATE POLICY "Users can manage org campaign active calls"
ON campaign_active_calls FOR ALL TO authenticated
USING (campaign_id IN (
    SELECT id FROM campaigns
    WHERE organization_id = get_user_organization_id(auth.uid())
))
WITH CHECK (campaign_id IN (
    SELECT id FROM campaigns
    WHERE organization_id = get_user_organization_id(auth.uid())
));
