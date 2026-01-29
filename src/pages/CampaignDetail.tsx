import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Megaphone,
  ArrowLeft,
  Zap,
  Bot,
  CheckCircle2,
  Clock,
  TrendingUp,
  Phone,
  List,
  Shield,
  Lock,
} from "lucide-react";
import { getCampaignById, getAgentById } from "@/data/demoAgentCampaignData";

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const campaign = id ? getCampaignById(id) : undefined;
  const agent = campaign ? getAgentById(campaign.agentId) : undefined;

  if (!campaign) {
    return (
      <OrgAppShell>
        <PageContainer>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Campaign not found</h2>
            <p className="text-muted-foreground mb-4">
              The campaign you're looking for doesn't exist.
            </p>
            <Button onClick={() => navigate("/app/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  const isEnabled = campaign.status === "Enabled";

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Campaigns
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Megaphone className="h-7 w-7 text-primary" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                    {campaign.name}
                  </h1>
                  {isEnabled ? (
                    <Badge className="bg-success/15 text-success border-success/40 border">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Enabled
                    </Badge>
                  ) : (
                    <Badge className="bg-muted text-muted-foreground border-border border">
                      Disabled
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">{campaign.triggerDescription}</p>
              </div>
            </div>
          </div>

          {/* Metrics Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Trigger</p>
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-warning" />
                <span className="font-semibold text-foreground">{campaign.trigger}</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Last Triggered</p>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-foreground">
                  {campaign.metrics.lastTriggered}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Success Rate</p>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                <span className="font-semibold text-foreground">
                  {campaign.metrics.successRate}
                </span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border border-border/50">
              <p className="text-sm text-muted-foreground mb-1">Total Calls</p>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" />
                <span className="font-semibold text-foreground">
                  {campaign.metrics.totalCalls}
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What Triggers Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Zap className="h-5 w-5 text-warning" />
                  What triggers this campaign
                </CardTitle>
                <CardDescription>
                  The event that automatically starts this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground leading-relaxed">{campaign.details.whatTriggers}</p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Agent Used Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Bot className="h-5 w-5 text-primary" />
                  Agent Used
                </CardTitle>
                <CardDescription>
                  The AI agent that handles calls for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className="p-4 rounded-lg bg-muted/50 border border-border/50 cursor-pointer hover:bg-muted/70 transition-colors"
                  onClick={() => navigate(`/app/agents/${campaign.agentId}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{campaign.agentUsed}</p>
                      <p className="text-sm text-muted-foreground">{agent?.purpose}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Step by Step Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <List className="h-5 w-5 text-success" />
                  How it works
                </CardTitle>
                <CardDescription>Step-by-step breakdown of the campaign flow</CardDescription>
              </CardHeader>
              <CardContent>
                <ol className="space-y-4">
                  {campaign.details.stepByStep.map((step, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <p className="text-foreground pt-1">{step}</p>
                    </li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          </motion.div>

          {/* Disclaimer Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Shield className="h-5 w-5 text-warning" />
                  Important Disclaimer
                </CardTitle>
                <CardDescription>Transactional use-case notice</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-foreground leading-relaxed">{campaign.details.disclaimer}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Restrictions Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="p-4 rounded-xl bg-muted/50 border border-border/50">
              <div className="flex items-center gap-2 mb-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">
                  This campaign is read-only
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Campaign triggers, agents, and behavior cannot be modified in this version. All
                campaigns are pre-configured for transactional e-commerce use cases.
              </p>
            </div>
          </motion.div>
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CampaignDetail;
