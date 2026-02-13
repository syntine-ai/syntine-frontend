import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Brain, AlertTriangle, HelpCircle, Shield,
  MessageSquare, ChevronDown, Bot, X, Plus, User
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────
export interface PromptConfig {
  agent_instructions: string;
  off_topic_response: string;
  no_context_response: string;
  guardrails: string[];
}

export type ConfigHealth = "ready" | "warning" | "error";

export function getConfigHealth(promptConfig: PromptConfig, firstMessage: string): { status: ConfigHealth; label: string } {
  if (!promptConfig.agent_instructions.trim()) {
    return { status: "error", label: "No instructions defined" };
  }
  if (!firstMessage.trim()) {
    return { status: "warning", label: "Missing greeting" };
  }
  return { status: "ready", label: "Ready to test" };
}

interface AgentConfigPanelProps {
  promptConfig: PromptConfig;
  onPromptConfigChange: (config: PromptConfig) => void;
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
}

// ─── Prompt Assembler (Frontend mirror for live preview) ─────────────
const DEFAULT_OFF_TOPIC = "Politely redirect the conversation back to the main purpose of the call.";
const DEFAULT_NO_CONTEXT = "Politely ask the caller to clarify or repeat their request.";

export function assemblePreview(config: PromptConfig): string {
  const sections: string[] = [];
  const instructions = config.agent_instructions?.trim();
  if (instructions) {
    sections.push(`## Agent Instructions\n${instructions}`);
  }
  const offTopic = config.off_topic_response?.trim() || DEFAULT_OFF_TOPIC;
  sections.push(`## Off-Topic Handling\nIf asked about unrelated topics:\n${offTopic}`);
  const noContext = config.no_context_response?.trim() || DEFAULT_NO_CONTEXT;
  sections.push(`## No-Context Handling\nIf context is unclear or the caller is silent:\n${noContext}`);
  const rules = (config.guardrails || []).filter(r => r.trim());
  if (rules.length > 0) {
    sections.push(`## Guardrails\nYou must NEVER:\n${rules.map(r => `- ${r}`).join("\n")}`);
  }
  sections.push(`## Conversation Principles
- Speak naturally and conversationally.
- Keep responses concise.
- Ask one question at a time.
- Confirm important details before proceeding.
- Never generate long monologues.`);
  return sections.join("\n\n").trim();
}

const MAX_GUARDRAILS = 8;
const DELAY_MARKS = [500, 1000, 2000, 3000, 5000];

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
}: AgentConfigPanelProps) {
  const [newGuardrail, setNewGuardrail] = useState("");
  const [behaviorOpen, setBehaviorOpen] = useState(true);
  const [safetyOpen, setSafetyOpen] = useState(true);

  const updateField = (field: keyof PromptConfig, value: string | string[]) => {
    onPromptConfigChange({ ...promptConfig, [field]: value });
  };

  const addGuardrail = () => {
    const rule = newGuardrail.trim();
    if (!rule) return;
    if (promptConfig.guardrails.length >= MAX_GUARDRAILS) {
      toast.error(`Maximum ${MAX_GUARDRAILS} guardrails allowed`);
      return;
    }
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

  const delayLabel = useMemo(() => {
    if (firstMessageDelayMs < 1000) return `${firstMessageDelayMs}ms`;
    return `${(firstMessageDelayMs / 1000).toFixed(1)}s`;
  }, [firstMessageDelayMs]);

  // ─── Legacy Mode ─────────────────────────────────────────────────
  if (isLegacyMode) {
    return (
      <div className="space-y-6">
        <Card className="border-warning/30 bg-warning/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-warning" />
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
        {renderFirstMessageSection()}
      </div>
    );
  }

  // ─── Structured Mode ─────────────────────────────────────────────
  return (
    <div className="space-y-5">
      {/* ═══ TIER 1: Core Identity — Always Expanded ═══ */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold">Agent Instructions</CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Define persona, goal, and task flow
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Textarea
            value={promptConfig.agent_instructions}
            onChange={(e) => updateField("agent_instructions", e.target.value)}
            placeholder={`You are a friendly appointment scheduling assistant for Dr. Smith's dental clinic.\n\nYour job is to:\n- Help callers book, reschedule, or cancel appointments\n- Answer questions about available time slots\n- Collect patient name, phone number, and preferred date/time\n- Confirm all details before finalizing`}
            className="min-h-[260px] resize-y text-sm leading-relaxed"
            disabled={isReadOnly}
          />
          <p className="text-xs text-muted-foreground mt-2">
            {promptConfig.agent_instructions.length} characters
          </p>
        </CardContent>
      </Card>

      {/* ═══ TIER 2: Conversation Behavior — Collapsible ═══ */}
      <Collapsible open={behaviorOpen} onOpenChange={setBehaviorOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-primary/5 flex items-center justify-center">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">Conversation Behavior</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      First message, off-topic & no-context handling
                    </p>
                  </div>
                </div>
                <motion.div
                  animate={{ rotate: behaviorOpen ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </motion.div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6 pt-0">
              {/* First Message */}
              {renderFirstMessageSection()}

              <div className="border-t border-border" />

              {/* Off-Topic */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  <Label className="text-sm font-medium">Off-Topic Handling</Label>
                </div>
                <Textarea
                  value={promptConfig.off_topic_response}
                  onChange={(e) => updateField("off_topic_response", e.target.value)}
                  placeholder="I can only help with appointment-related questions. Is there anything else I can assist you with?"
                  className="min-h-[72px] resize-y text-sm"
                  disabled={isReadOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for default behavior
                </p>
              </div>

              <div className="border-t border-border" />

              {/* No-Context */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-3.5 w-3.5 text-primary" />
                  <Label className="text-sm font-medium">No-Context Handling</Label>
                </div>
                <Textarea
                  value={promptConfig.no_context_response}
                  onChange={(e) => updateField("no_context_response", e.target.value)}
                  placeholder="I'm sorry, could you please repeat that? I want to make sure I understand correctly."
                  className="min-h-[72px] resize-y text-sm"
                  disabled={isReadOnly}
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank for default behavior
                </p>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* ═══ TIER 3: Safety & Compliance — Collapsible ═══ */}
      <Collapsible open={safetyOpen} onOpenChange={setSafetyOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="pb-3 cursor-pointer hover:bg-muted/30 transition-colors rounded-t-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <Shield className="h-4 w-4 text-destructive" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-medium">Safety & Compliance</CardTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Hard rules the agent must never break
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {promptConfig.guardrails.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {promptConfig.guardrails.length} of {MAX_GUARDRAILS}
                    </span>
                  )}
                  <motion.div
                    animate={{ rotate: safetyOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </motion.div>
                </div>
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-3 pt-0">
              {/* Guardrail badges with animation */}
              <AnimatePresence mode="popLayout">
                {promptConfig.guardrails.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {promptConfig.guardrails.map((rule, index) => (
                      <motion.div
                        key={rule}
                        initial={{ opacity: 0, scale: 0.8, y: 5 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -5 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Badge
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
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>

              {/* Add new rule */}
              {!isReadOnly && (
                <TooltipProvider>
                  <div className="flex gap-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="flex-1">
                          <Input
                            value={newGuardrail}
                            onChange={(e) => setNewGuardrail(e.target.value)}
                            onKeyDown={handleGuardrailKeyDown}
                            placeholder={
                              promptConfig.guardrails.length >= MAX_GUARDRAILS
                                ? "Maximum rules reached"
                                : "e.g. Never promise specific delivery dates"
                            }
                            className="flex-1"
                            disabled={promptConfig.guardrails.length >= MAX_GUARDRAILS}
                          />
                        </div>
                      </TooltipTrigger>
                      {promptConfig.guardrails.length >= MAX_GUARDRAILS && (
                        <TooltipContent>
                          <p>Maximum {MAX_GUARDRAILS} guardrails reached</p>
                        </TooltipContent>
                      )}
                    </Tooltip>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addGuardrail}
                      disabled={!newGuardrail.trim() || promptConfig.guardrails.length >= MAX_GUARDRAILS}
                      className="gap-1.5 shrink-0"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add
                    </Button>
                  </div>
                </TooltipProvider>
              )}

              {promptConfig.guardrails.length === 0 && (
                <p className="text-xs text-muted-foreground italic">
                  No guardrails set. Add rules to prevent unwanted behavior.
                </p>
              )}

              <p className="text-xs text-muted-foreground">
                {promptConfig.guardrails.length} of {MAX_GUARDRAILS} rules used
              </p>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
    </div>
  );

  // ─── Shared: First Message Section ────────────────────────────────
  function renderFirstMessageSection() {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Who speaks first?</Label>
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
                  <span>User speaks first</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {firstSpeaker === "agent" && (
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">First Message</Label>
              <Textarea
                value={firstMessage}
                onChange={(e) => onFirstMessageChange(e.target.value)}
                placeholder="Hello! I'm calling regarding your recent order. Is this a good time to talk?"
                className="min-h-[80px] resize-y text-sm"
                disabled={isReadOnly}
              />
              <p className="text-xs text-muted-foreground">
                Supports variables: <code className="bg-muted px-1 py-0.5 rounded text-xs">{"{{customer_name}}"}</code>
              </p>
            </div>

            {/* Live Chat Bubble Preview */}
            {firstMessage.trim() && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-lg border border-border bg-muted/20 p-3"
              >
                <p className="text-[11px] text-muted-foreground mb-2 uppercase tracking-wider font-medium">Preview</p>
                <div className="flex gap-2 items-start">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="h-3 w-3 text-primary" />
                  </div>
                  <div className="bg-primary/10 rounded-xl rounded-tl-sm px-3 py-2 max-w-[85%]">
                    <p className="text-sm text-foreground leading-relaxed">{firstMessage}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Delay Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Delay before speaking</Label>
                <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
                  {delayLabel}
                </span>
              </div>
              <Slider
                value={[firstMessageDelayMs]}
                onValueChange={(val) => onFirstMessageDelayMsChange?.(val[0])}
                min={500}
                max={5000}
                step={100}
                disabled={isReadOnly}
                className="w-full"
              />
              <div className="flex justify-between text-[10px] text-muted-foreground">
                {DELAY_MARKS.map((ms) => (
                  <span key={ms}>{ms >= 1000 ? `${ms / 1000}s` : `${ms}ms`}</span>
                ))}
              </div>
            </div>
          </>
        )}

        {firstSpeaker === "user" && (
          <p className="text-sm text-muted-foreground italic">
            Agent will wait silently for the user to speak first.
          </p>
        )}
      </div>
    );
  }
}
