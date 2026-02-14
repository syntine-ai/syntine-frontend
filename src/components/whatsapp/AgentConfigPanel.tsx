import { useState, useEffect } from "react";
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
import { restClient } from "@/api/client/rest.client";

// ─── Types ───

interface ChatAgentConfig {
  id: string;
  agent_id: string;
  organization_id: string;
  agent_name: string;
  agent_status: string;
  system_prompt: string | null;
  custom_system_prefix: string | null;
  greeting_message: string | null;
  fallback_message_web: string;
  fallback_message_wa: string;
  use_summary: boolean;
  enabled_templates: boolean;
  version: number;
  created_at: string;
  updated_at: string;
}

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

export function WhatsAppAgentConfigPanel() {
  const [activeConfig, setActiveConfig] = useState<ChatAgentConfig | null>(null);
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isNew, setIsNew] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const data = await restClient.get<ChatAgentConfig[]>("/chat/config");
      if (data.length > 0) {
        selectConfig(data[0]);
      } else {
        setIsNew(true);
      }
    } catch {
      setIsNew(true);
    } finally {
      setLoading(false);
    }
  }

  function selectConfig(config: ChatAgentConfig) {
    setActiveConfig(config);
    setIsNew(false);
    setForm({
      name: config.agent_name,
      system_prompt: config.system_prompt || "",
      custom_system_prefix: config.custom_system_prefix || "",
      greeting_message: config.greeting_message || "",
      fallback_message_web: config.fallback_message_web,
      fallback_message_wa: config.fallback_message_wa,
      use_summary: config.use_summary,
      enabled_templates: config.enabled_templates,
    });
  }

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error("Agent name is required");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: form.name,
        system_prompt: form.system_prompt || null,
        custom_system_prefix: form.custom_system_prefix || null,
        greeting_message: form.greeting_message || null,
        fallback_message_web: form.fallback_message_web,
        fallback_message_wa: form.fallback_message_wa,
        use_summary: form.use_summary,
        enabled_templates: form.enabled_templates,
      };

      if (isNew) {
        const created = await restClient.post<ChatAgentConfig>("/chat/config", payload);
        toast.success("Chat agent created!");
        selectConfig(created);
      } else if (activeConfig) {
        const updated = await restClient.put<ChatAgentConfig>(
          `/chat/config/${activeConfig.agent_id}`,
          payload
        );
        toast.success("Configuration saved!");
        selectConfig(updated);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save configuration");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading config...</span>
      </div>
    );
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
