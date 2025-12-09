import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ConcurrencySlider } from "./ConcurrencySlider";
import { AgentSelector } from "./AgentSelector";
import { Copy, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function CampaignControlsTab() {
  const { toast } = useToast();
  const [concurrency, setConcurrency] = useState(5);
  const [maxRetries, setMaxRetries] = useState(3);
  const [backoffType, setBackoffType] = useState("exponential");
  const [retryDelay, setRetryDelay] = useState(10);
  const [selectedAgent, setSelectedAgent] = useState("1");
  const [agentEnabled, setAgentEnabled] = useState(true);

  const mockEndpoints = {
    campaignId: "camp_8f4b2a3c9d1e",
    webhookUrl: "https://api.syntine.io/webhooks/8f4b2a3c9d1e",
    callbackEndpoint: "https://api.syntine.io/v1/campaigns/8f4b2a3c9d1e/callback",
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied.`,
    });
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
              onChange={setConcurrency}
              min={1}
              max={20}
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Retry Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Retry Configuration</CardTitle>
            <CardDescription>
              Configure how failed calls are retried
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxRetries">Max Retries</Label>
                <Input
                  id="maxRetries"
                  type="number"
                  value={maxRetries}
                  onChange={(e) => setMaxRetries(Number(e.target.value))}
                  min={0}
                  max={10}
                />
              </div>
              <div className="space-y-2">
                <Label>Backoff Type</Label>
                <Select value={backoffType} onValueChange={setBackoffType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Delay</SelectItem>
                    <SelectItem value="exponential">Exponential Backoff</SelectItem>
                    <SelectItem value="linear">Linear Backoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="retryDelay">Base Delay (minutes)</Label>
                <Input
                  id="retryDelay"
                  type="number"
                  value={retryDelay}
                  onChange={(e) => setRetryDelay(Number(e.target.value))}
                  min={1}
                  max={60}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {backoffType === "exponential" 
                ? `Retry delays will be: ${retryDelay}m, ${retryDelay * 2}m, ${retryDelay * 4}m...`
                : backoffType === "linear"
                ? `Retry delays will be: ${retryDelay}m, ${retryDelay * 2}m, ${retryDelay * 3}m...`
                : `All retries will wait ${retryDelay} minutes.`
              }
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* AI Agent State */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">AI Agent State</CardTitle>
            <CardDescription>
              Configure the active AI agent for this campaign
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Agent Enabled</p>
                <p className="text-sm text-muted-foreground">
                  Enable or disable AI agent for calls
                </p>
              </div>
              <Switch checked={agentEnabled} onCheckedChange={setAgentEnabled} />
            </div>
            <div className="space-y-2">
              <Label>Active Agent</Label>
              <AgentSelector
                value={selectedAgent}
                onChange={setSelectedAgent}
                disabled={!agentEnabled}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Backend IDs & Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="text-lg">Backend Configuration</CardTitle>
            <CardDescription>
              Read-only endpoint and ID references
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(mockEndpoints).map(([key, value]) => (
              <div key={key} className="flex items-center gap-3">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground uppercase tracking-wider">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="flex-1 px-3 py-2 bg-secondary/50 rounded-md text-sm font-mono text-foreground truncate">
                      {value}
                    </code>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(value, key)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {value.startsWith("http") && (
                      <Button variant="ghost" size="icon" asChild>
                        <a href={value} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
