import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Bot, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { chatService, type ChatAgentConfig } from "@/api/services/chat.service";

// ─── Types ───

interface FormState {
  name: string;
  system_prompt: string;
  custom_system_prefix: string;
  greeting_message: string;
  fallback_message_web: string;
  fallback_message_wa: string;
  use_summary: boolean;
  enabled_templates: boolean;
}

const DEFAULT_FORM: FormState = {
  name: "WhatsApp Bot",
  system_prompt: "",
  custom_system_prefix: "",
  greeting_message: "",
  fallback_message_web: "I'm having trouble. Please try again shortly.",
  fallback_message_wa: "We'll get back to you soon ❤️",
  use_summary: true,
  enabled_templates: false,
};

// ─── Component ───

export function AgentConfigPanel({ agentId }: { agentId: string }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);

  // 1. Fetch Config
  const { data: activeConfig, isLoading } = useQuery({
    queryKey: ["chat-agent-config", agentId],
    queryFn: () => chatService.getAgentConfig(agentId),
    enabled: !!agentId,
  });

  // 2. Sync Form
  useEffect(() => {
    if (activeConfig) {
      setForm({
        name: activeConfig.agent_name || DEFAULT_FORM.name,
        system_prompt: activeConfig.system_prompt || "",
        custom_system_prefix: activeConfig.custom_system_prefix || "",
        greeting_message: activeConfig.greeting_message || "",
        fallback_message_web: activeConfig.fallback_message_web || DEFAULT_FORM.fallback_message_web,
        fallback_message_wa: activeConfig.fallback_message_wa || DEFAULT_FORM.fallback_message_wa,
        use_summary: activeConfig.use_summary ?? true,
        enabled_templates: activeConfig.enabled_templates ?? false,
      });
    }
  }, [activeConfig]);

  const updateField = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  // 3. Save Mutation
  const saveMutation = useMutation({
    mutationFn: async (data: FormState) => {
      // API expects slightly different keys or same?
      // ChatAgentConfigUpdate schema in backend:
      // agent_name, system_prompt, etc.
      // We map form to payload
      const payload = {
        agent_name: data.name,
        system_prompt: data.system_prompt,
        custom_system_prefix: data.custom_system_prefix,
        greeting_message: data.greeting_message,
        fallback_message_web: data.fallback_message_web,
        fallback_message_wa: data.fallback_message_wa,
        use_summary: data.use_summary,
        enabled_templates: data.enabled_templates
        // messaging_provider, model, temperature preserved by backend patch or we send current?
        // Let's assume PUT merges or explicit PATCH
        // The service uses post/put.
      };

      // If endpoint is POST /chat/config (create) or PUT /chat/config/{agent_id} (update)
      return chatService.updateAgentConfig(agentId, payload);
    },
    onSuccess: (data) => {
      toast.success("Agent configuration saved");
      queryClient.invalidateQueries({ queryKey: ["chat-agent-config", agentId] });
    },
    onError: (err) => {
      toast.error("Failed to save configuration");
      console.error(err);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(form);
  };

  const isNew = !activeConfig;
  const saving = saveMutation.isPending;

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-[hsl(142,71%,45%)]/10 flex items-center justify-center">
                <Bot className="h-5 w-5 text-[hsl(142,71%,45%)]" />
              </div>
              <div>
                <CardTitle className="text-lg">
                  {isNew ? "Create Chat Agent" : "Agent Configuration"}
                </CardTitle>
                {activeConfig && (
                  <p className="text-xs text-muted-foreground mt-0.5">
                    v{activeConfig.version} · Last updated{" "}
                    {new Date(activeConfig.updated_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            {activeConfig && (
              <Badge
                variant={activeConfig.agent_status === "active" ? "default" : "secondary"}
              >
                {activeConfig.agent_status}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Agent name */}
          <div className="space-y-1.5">
            <Label className="text-sm">Agent Name</Label>
            <Input
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="My Chat Agent"
            />
          </div>

          <Separator />

          {/* Prompts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Agent Behavior</h3>
            <div className="space-y-1.5">
              <Label className="text-sm">System Prompt</Label>
              <Textarea
                rows={4}
                placeholder="Define how the bot should behave, its personality, goals..."
                value={form.system_prompt}
                onChange={(e) => updateField("system_prompt", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                The core instructions for your AI agent — define its role, tone, and what it should do.
              </p>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Brand Voice Prefix</Label>
              <Textarea
                rows={2}
                placeholder="Custom brand-specific instructions prepended to every conversation..."
                value={form.custom_system_prefix}
                onChange={(e) => updateField("custom_system_prefix", e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">
                Greeting Message{" "}
                <span className="text-xs text-muted-foreground">
                  (supports {"{business_name}"}, {"{agent_name}"})
                </span>
              </Label>
              <Input
                placeholder="Hello! How can I help you today?"
                value={form.greeting_message}
                onChange={(e) => updateField("greeting_message", e.target.value)}
              />
            </div>
          </div>

          <Separator />

          {/* Fallback messages */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Fallback Messages</h3>
            <p className="text-xs text-muted-foreground -mt-2">
              Shown when the AI cannot generate a response
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm">Web Widget</Label>
                <Input
                  value={form.fallback_message_web}
                  onChange={(e) => updateField("fallback_message_web", e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">WhatsApp</Label>
                <Input
                  value={form.fallback_message_wa}
                  onChange={(e) => updateField("fallback_message_wa", e.target.value)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Features</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Conversation Summaries</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Automatically summarize long conversations
                  </p>
                </div>
                <Switch
                  checked={form.use_summary}
                  onCheckedChange={(v) => updateField("use_summary", v)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm">Template Messages</Label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Enable sending pre-approved templates
                  </p>
                </div>
                <Switch
                  checked={form.enabled_templates}
                  onCheckedChange={(v) => updateField("enabled_templates", v)}
                />
              </div>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end pt-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
              ) : (
                <Save className="h-4 w-4 mr-1.5" />
              )}
              {isNew ? "Create Agent" : "Save Configuration"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
