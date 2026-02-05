import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ConcurrencySlider } from "./ConcurrencySlider";
import { AgentSelector } from "./AgentSelector";
 import { AutoTriggerSettingsCard } from "./AutoTriggerSettingsCard";
import { useCampaigns, CampaignWithDetails } from "@/hooks/useCampaigns";

interface CampaignControlsTabProps {
  campaign?: CampaignWithDetails;
}

export function CampaignControlsTab({ campaign }: CampaignControlsTabProps) {
  const { updateCampaign, linkAgent, unlinkAgent } = useCampaigns();

  const [concurrency, setConcurrency] = useState(campaign?.concurrency || 5);
  const [selectedAgent, setSelectedAgent] = useState(campaign?.agents?.[0]?.id || "");

  // Update local state when campaign changes
  useEffect(() => {
    if (campaign) {
      setConcurrency(campaign.concurrency || 5);
      if (campaign.agents?.[0]) {
        setSelectedAgent(campaign.agents[0].id);
      } else {
        setSelectedAgent("");
      }
    }
  }, [campaign]);

  const handleConcurrencyChange = async (value: number) => {
    setConcurrency(value);
    if (campaign) {
      await updateCampaign(campaign.id, { concurrency: value });
    }
  };

  const handleAgentChange = async (agentId: string) => {
    if (!campaign) return;

    // Unlink old agent if exists
    if (selectedAgent) {
      await unlinkAgent(campaign.id, selectedAgent);
    }

    // Link new agent
    if (agentId) {
      await linkAgent(campaign.id, agentId, true);
    }

    setSelectedAgent(agentId);
  };

   const handleAutoTriggerUpdate = async (data: {
     auto_trigger_enabled?: boolean;
     max_retry_attempts?: number;
     retry_delay_minutes?: number;
   }) => {
     if (!campaign) return;
     await updateCampaign(campaign.id, data);
   };
 
  return (
    <div className="space-y-6">
      {/* Concurrency Control */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Concurrency Control</CardTitle>
            <CardDescription>
              Control how many calls can run simultaneously
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ConcurrencySlider
              value={concurrency}
              onChange={handleConcurrencyChange}
              min={1}
              max={20}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Connected Agent */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Connected Agent</CardTitle>
            <CardDescription>
              The AI agent handling calls for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AgentSelector
              value={selectedAgent}
              onChange={handleAgentChange}
            />
            {!selectedAgent && (
              <p className="text-sm text-muted-foreground mt-2">
                No agent connected. Select an agent to handle calls.
              </p>
            )}
          </CardContent>
        </Card>
      </motion.div>
 
       {/* Auto-Trigger Settings (only for order_conversion/cart_recovery types) */}
       <AutoTriggerSettingsCard
         campaign={campaign}
         onUpdate={handleAutoTriggerUpdate}
       />
    </div>
  );
}
