import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Smile, Meh, Frown, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const sentimentConfig = [
  {
    type: "positive" as const,
    label: "Positive Sentiment",
    icon: Smile,
    color: "success",
    bgClass: "bg-success/10",
    iconClass: "text-success",
    pillClass: "bg-success/15 text-success border-success/30",
    placeholder: "e.g., Thank the customer warmly, offer exclusive upsell opportunities, reinforce positive experience...",
    example: "When the customer expresses satisfaction, thank them genuinely and explore if there are additional needs we can help with.",
  },
  {
    type: "neutral" as const,
    label: "Neutral Sentiment",
    icon: Meh,
    color: "muted",
    bgClass: "bg-muted",
    iconClass: "text-muted-foreground",
    pillClass: "bg-warning/15 text-warning border-warning/30",
    placeholder: "e.g., Continue with standard conversation flow, gather more information, clarify questions...",
    example: "Maintain professional tone, continue with the conversation script, and look for opportunities to add value.",
  },
  {
    type: "negative" as const,
    label: "Negative Sentiment",
    icon: Frown,
    color: "destructive",
    bgClass: "bg-destructive/10",
    iconClass: "text-destructive",
    pillClass: "bg-destructive/15 text-destructive border-destructive/30",
    placeholder: "e.g., Acknowledge concerns, apologize if appropriate, offer solutions, escalate if needed...",
    example: "First acknowledge the customer's frustration, apologize for any inconvenience, and offer concrete solutions. If unresolved, escalate to human agent.",
  },
];

export function CampaignSentimentTab() {
  const { toast } = useToast();
  const [instructions, setInstructions] = useState<Record<string, string>>({
    positive: "Thank the customer warmly for their positive feedback. Explore opportunities to offer additional services or upgrades that might benefit them.",
    neutral: "Continue with the standard conversation flow. Ask clarifying questions to better understand the customer's needs and provide relevant information.",
    negative: "Acknowledge the customer's concerns with empathy. Apologize for any inconvenience and offer concrete solutions. If unable to resolve, offer to escalate to a human agent.",
  });
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [logSentiment, setLogSentiment] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Sentiment rules saved",
      description: "Your sentiment handling configuration has been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Sentiment Handling Rules</h3>
          <p className="text-sm text-muted-foreground">
            Configure how the AI agent responds based on detected customer sentiment
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Sentiment Pills Preview */}
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground">Sentiment indicators:</span>
        {sentimentConfig.map((config) => (
          <span
            key={config.type}
            className={cn(
              "px-3 py-1 rounded-full text-xs font-medium border",
              config.pillClass
            )}
          >
            {config.type.charAt(0).toUpperCase() + config.type.slice(1)}
          </span>
        ))}
      </div>

      {/* Sentiment Cards */}
      {sentimentConfig.map((config, index) => (
        <motion.div
          key={config.type}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="border-border/50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", config.bgClass)}>
                  <config.icon className={cn("h-5 w-5", config.iconClass)} />
                </div>
                <div>
                  <CardTitle className="text-base">{config.label}</CardTitle>
                  <CardDescription>Instructions when {config.type} sentiment is detected</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">AI Agent Instructions</Label>
                <Textarea
                  value={instructions[config.type]}
                  onChange={(e) => setInstructions(prev => ({ ...prev, [config.type]: e.target.value }))}
                  placeholder={config.placeholder}
                  className="min-h-[120px] resize-none"
                />
              </div>
              <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                <p className="text-xs font-medium text-muted-foreground mb-1">Example response behavior:</p>
                <p className="text-sm text-foreground">{config.example}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {/* Settings */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-base">Additional Settings</CardTitle>
          <CardDescription>Configure sentiment-related automation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-escalate negative calls</p>
              <p className="text-sm text-muted-foreground">
                Automatically flag calls with persistent negative sentiment for human review
              </p>
            </div>
            <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Log sentiment data</p>
              <p className="text-sm text-muted-foreground">
                Store sentiment analysis results for analytics and reporting
              </p>
            </div>
            <Switch checked={logSentiment} onCheckedChange={setLogSentiment} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
