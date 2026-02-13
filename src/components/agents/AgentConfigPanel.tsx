import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Brain, AlertTriangle, HelpCircle, Shield,
  FileText, Clock, Link2, User, Bot, X, Plus
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

// ─── Types ───────────────────────────────────────────────────────────
export interface PromptConfig {
  agent_instructions: string;
  off_topic_response: string;
  no_context_response: string;
  guardrails: string[];
}

interface AgentConfigPanelProps {
  promptConfig: PromptConfig;
  onPromptConfigChange: (config: PromptConfig) => void;
  // Legacy: raw system prompt for old agents without prompt_config
  legacySystemPrompt?: string;
  onLegacySystemPromptChange?: (value: string) => void;
  isLegacyMode?: boolean;
  firstMessage: string;
  onFirstMessageChange: (value: string) => void;
  firstSpeaker?: string;
  onFirstSpeakerChange?: (value: string) => void;
  firstMessageDelayMs?: number;
  onFirstMessageDelayMsChange?: (value: number) => void;
  isReadOnly?: boolean;
  agentId?: string;
  linkedCampaigns?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Prompt Assembler (Frontend mirror for live preview) ─────────────
const DEFAULT_OFF_TOPIC = "Politely redirect the conversation back to the main purpose of the call.";
const DEFAULT_NO_CONTEXT = "Politely ask the caller to clarify or repeat their request.";

export function assemblePreview(config: PromptConfig): string {
  const sections: string[] = [];

  // 1. Agent Instructions (core prompt)
  const instructions = config.agent_instructions?.trim();
  if (instructions) {
    sections.push(`## Agent Instructions\n${instructions}`);
  }

  // 2. Off-Topic
  const offTopic = config.off_topic_response?.trim() || DEFAULT_OFF_TOPIC;
  sections.push(`## Off-Topic Handling\nIf asked about unrelated topics:\n${offTopic}`);

  // 3. No-Context
  const noContext = config.no_context_response?.trim() || DEFAULT_NO_CONTEXT;
  sections.push(`## No-Context Handling\nIf context is unclear or the caller is silent:\n${noContext}`);

  // 4. Guardrails
  const rules = (config.guardrails || []).filter(r => r.trim());
  if (rules.length > 0) {
    sections.push(`## Guardrails\nYou must NEVER:\n${rules.map(r => `- ${r}`).join("\n")}`);
  }

  // 5. Global Principles
  sections.push(`## Conversation Principles
- Speak naturally and conversationally.
- Keep responses concise.
- Ask one question at a time.
- Confirm important details before proceeding.
- Never generate long monologues.`);

  return sections.join("\n\n").trim();
}

const PROMPT_SOFT_LIMIT = 4000;

// ─── Component ────────────────────────────────────────────────────────
export function AgentConfigPanel({
  promptConfig,
  onPromptConfigChange,
  legacySystemPrompt,
  onLegacySystemPromptChange,
  isLegacyMode = false,
  firstMessage,
  onFirstMessageChange,
  firstSpeaker = "agent",
  onFirstSpeakerChange,
  firstMessageDelayMs = 2000,
  onFirstMessageDelayMsChange,
  isReadOnly = false,
  agentId,
  linkedCampaigns = 0,
  createdAt,
  updatedAt,
}: AgentConfigPanelProps) {
  const [newGuardrail, setNewGuardrail] = useState("");


  // Field updaters
  const updateField = (field: keyof PromptConfig, value: string | string[]) => {
    onPromptConfigChange({ ...promptConfig, [field]: value });
  };

  const addGuardrail = () => {
    const rule = newGuardrail.trim();
    if (!rule) return;
    if (promptConfig.guardrails.includes(rule)) {
      toast.error("This rule already exists");
      return;
    }
    updateField("guardrails", [...promptConfig.guardrails, rule]);
    setNewGuardrail("");
  };

  const removeGuardrail = (index: number) => {
    updateField("guardrails", promptConfig.guardrails.filter((_, i) => i !== index));
  };

  const handleGuardrailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addGuardrail();
    }
  };

  // ─── Legacy Mode ─────────────────────────────────────────────────
  if (isLegacyMode) {
    return (
      <div className="space-y-6">
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <CardTitle className="text-base font-medium">Legacy Prompt Mode</CardTitle>
            </div>
            <CardDescription>
              This agent uses a raw system prompt. Edit directly below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={legacySystemPrompt || ""}
              onChange={(e) => onLegacySystemPromptChange?.(e.target.value)}
              className="min-h-[280px] font-mono text-sm resize-y"
              placeholder="Enter system prompt..."
              disabled={isReadOnly}
            />
          </CardContent>
        </Card>

        {/* First Message Settings */}
        {renderFirstMessageCard()}

        {/* Metadata */}
        {agentId && renderMetadataCard()}
      </div>
    );
  }

  // ─── Structured Mode ─────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* 1. Agent Instructions (THE MAIN PROMPT) */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium">Agent Instructions</CardTitle>
          </div>
          <CardDescription>
            The core prompt that defines who this agent is, what it does, its persona, goal, and any specific task instructions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={promptConfig.agent_instructions}
            onChange={(e) => updateField("agent_instructions", e.target.value)}
            placeholder={`You are a friendly appointment scheduling assistant for Dr. Smith's dental clinic.\n\nYour job is to:\n- Help callers book, reschedule, or cancel appointments\n- Answer questions about available time slots\n- Collect patient name, phone number, and preferred date/time\n- Confirm all details before finalizing`}
            className="min-h-[200px] resize-y"
            disabled={isReadOnly}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {promptConfig.agent_instructions.length} characters — Be specific about persona, goal, and task flow.
          </p>
        </CardContent>
      </Card>

      {/* 2. Off-Topic Response */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <CardTitle className="text-base font-medium">Off-Topic Response</CardTitle>
          </div>
          <CardDescription>
            How the agent should respond when asked irrelevant questions.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={promptConfig.off_topic_response}
            onChange={(e) => updateField("off_topic_response", e.target.value)}
            placeholder="I can only help with appointment-related questions. Is there anything else I can assist you with regarding your appointment?"
            className="min-h-[80px] resize-y"
            disabled={isReadOnly}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Leave blank for default: "{DEFAULT_OFF_TOPIC}"
          </p>
        </CardContent>
      </Card>

      {/* 3. No-Context Response */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-4 w-4 text-blue-500" />
            <CardTitle className="text-base font-medium">No-Context Response</CardTitle>
          </div>
          <CardDescription>
            What the agent says when the caller is silent or context is unclear.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={promptConfig.no_context_response}
            onChange={(e) => updateField("no_context_response", e.target.value)}
            placeholder="I'm sorry, could you please repeat that? I want to make sure I understand correctly."
            className="min-h-[80px] resize-y"
            disabled={isReadOnly}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Leave blank for default: "{DEFAULT_NO_CONTEXT}"
          </p>
        </CardContent>
      </Card>

      {/* 4. Guardrails */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-red-500" />
            <CardTitle className="text-base font-medium">Guardrails</CardTitle>
          </div>
          <CardDescription>
            Rules the agent must NEVER break. Add strict behavioral boundaries.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Chips */}
          {promptConfig.guardrails.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {promptConfig.guardrails.map((rule, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1.5 text-sm gap-1.5 max-w-full"
                >
                  <span className="truncate">{rule}</span>
                  {!isReadOnly && (
                    <button
                      onClick={() => removeGuardrail(index)}
                      className="ml-1 hover:text-destructive transition-colors shrink-0"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
          )}

          {/* Add new rule */}
          {!isReadOnly && (
            <div className="flex gap-2">
              <Input
                value={newGuardrail}
                onChange={(e) => setNewGuardrail(e.target.value)}
                onKeyDown={handleGuardrailKeyDown}
                placeholder="e.g. Never promise specific delivery dates"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={addGuardrail}
                disabled={!newGuardrail.trim()}
                className="gap-1.5 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </Button>
            </div>
          )}

          {promptConfig.guardrails.length === 0 && (
            <p className="text-xs text-muted-foreground italic">
              No guardrails set. Add rules to prevent unwanted agent behavior.
            </p>
          )}
        </CardContent>
      </Card>

      {/* First Message Settings */}
      {renderFirstMessageCard()}



      {/* Metadata */}
      {agentId && renderMetadataCard()}
    </div>
  );

  // ─── Shared Sub-components ────────────────────────────────────────
  function renderFirstMessageCard() {
    return (
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-primary" />
            <CardTitle className="text-base font-medium">First Message Settings</CardTitle>
          </div>
          <CardDescription>
            Configure who speaks first when the call connects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Who speaks first?</Label>
            <Select
              value={firstSpeaker}
              onValueChange={(value) => onFirstSpeakerChange?.(value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select who speaks first" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="agent">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    <span>Agent speaks first</span>
                  </div>
                </SelectItem>
                <SelectItem value="user">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>User speaks first (agent waits)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {firstSpeaker === "agent" && (
            <>
              <div className="space-y-2">
                <Label>First Message</Label>
                <Textarea
                  value={firstMessage}
                  onChange={(e) => onFirstMessageChange(e.target.value)}
                  placeholder="Hello! I'm calling regarding your recent order. Is this a good time to talk?"
                  className="min-h-[100px] resize-y"
                  disabled={isReadOnly}
                />
                <p className="text-xs text-muted-foreground">
                  {firstMessage.length} characters • Supports variables: <code className="bg-muted px-1 py-0.5 rounded">{"{{customer_name}}"}</code>
                </p>
              </div>

              <div className="space-y-2">
                <Label>Delay before speaking (ms)</Label>
                <Input
                  type="number"
                  value={firstMessageDelayMs}
                  onChange={(e) => onFirstMessageDelayMsChange?.(parseInt(e.target.value) || 2000)}
                  min={500}
                  max={5000}
                  step={100}
                  disabled={isReadOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Wait time before agent speaks (500-5000ms recommended)
                </p>
              </div>
            </>
          )}

          {firstSpeaker === "user" && (
            <p className="text-sm text-muted-foreground italic">
              Agent will wait silently for the user to speak first.
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  function renderMetadataCard() {
    return (
      <Card className="bg-muted/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Metadata</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs mb-1">Agent ID</p>
              <code className="text-xs bg-muted px-2 py-1 rounded font-mono block truncate">
                {agentId}
              </code>
            </div>
            <div>
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <Link2 className="h-3 w-3" />
                Linked Campaigns
              </p>
              <p className="font-medium">{linkedCampaigns}</p>
            </div>
            {createdAt && (
              <div>
                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Created
                </p>
                <p className="text-xs">{format(new Date(createdAt), "MMM d, yyyy")}</p>
              </div>
            )}
            {updatedAt && (
              <div>
                <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Last Updated
                </p>
                <p className="text-xs">{format(new Date(updatedAt), "MMM d, yyyy h:mm a")}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
}