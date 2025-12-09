import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { StatusPill } from "@/components/shared/StatusPill";
import { TonePresetSelector } from "@/components/agents/TonePresetSelector";
import { PromptEditorCard } from "@/components/agents/PromptEditorCard";
import { SentimentRulesCard } from "@/components/agents/SentimentRulesCard";
import { TestCallCard } from "@/components/agents/TestCallCard";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Bot, Copy, Globe, Layers } from "lucide-react";

const linkedCampaigns = [
  { id: "1", name: "Renewal Follow-up", status: "running" as const, callsToday: 134 },
  { id: "2", name: "Customer Feedback", status: "running" as const, callsToday: 89 },
  { id: "3", name: "Lead Qualification", status: "paused" as const, callsToday: 0 },
];

const AgentDetail = () => {
  const { id } = useParams();
  const [isActive, setIsActive] = useState(true);
  const [tone, setTone] = useState("professional");
  const [prompt, setPrompt] = useState(
`You are a helpful AI assistant for customer service calls.

Guidelines:
- Be polite and professional at all times
- Listen carefully to customer concerns
- Provide clear and concise answers
- Offer solutions when possible
- Escalate to a human agent if needed

Remember to:
- Introduce yourself at the start of each call
- Confirm customer details before proceeding
- Summarize key points at the end of the call`
  );

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Bot className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                    Sales Assistant
                  </h1>
                  <StatusPill status={isActive ? "active" : "inactive"} />
                </div>
                <p className="text-muted-foreground">Agent ID: {id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 mr-4">
                <span className="text-sm text-muted-foreground">Active</span>
                <Switch checked={isActive} onCheckedChange={setIsActive} />
              </div>
              <Button variant="outline" className="gap-2">
                <Copy className="h-4 w-4" /> Duplicate Agent
              </Button>
            </div>
          </div>

          {/* Subinfo */}
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">English</span>
            </div>
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-foreground">3 Linked Campaigns</span>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Prompt Editor */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PromptEditorCard value={prompt} onChange={setPrompt} />
          </motion.div>

          {/* Tone Presets */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Tone Presets</CardTitle>
                <CardDescription>
                  Select the personality style for this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TonePresetSelector value={tone} onChange={setTone} />
              </CardContent>
            </Card>
          </motion.div>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sentiment Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <SentimentRulesCard />
            </motion.div>

            {/* Test Call */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <TestCallCard />
            </motion.div>
          </div>

          {/* Linked Campaigns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Linked Campaigns</CardTitle>
                <CardDescription>
                  Campaigns using this agent
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Campaign Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Calls Today</th>
                      </tr>
                    </thead>
                    <tbody>
                      {linkedCampaigns.map((campaign, i) => (
                        <motion.tr
                          key={campaign.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.05 }}
                          className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
                        >
                          <td className="p-3 font-medium text-foreground">{campaign.name}</td>
                          <td className="p-3">
                            <StatusPill status={campaign.status} />
                          </td>
                          <td className="p-3 text-foreground">{campaign.callsToday}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default AgentDetail;
