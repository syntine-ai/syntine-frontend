import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAgents } from "@/hooks/useAgents";
import { useContacts } from "@/hooks/useContacts";

interface NewCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: {
    name: string;
    description?: string;
    concurrency?: number;
    agentIds?: string[];
    contactListIds?: string[];
    campaign_type?: string;
    auto_trigger_enabled?: boolean;
    max_retry_attempts?: number;
    retry_delay_minutes?: number;
  }) => Promise<void>;
}

const steps = [
  { id: 1, title: "Campaign Details" },
  { id: 2, title: "Assign Agent" },
  { id: 3, title: "Contact Source" },
  { id: 4, title: "Call Settings" },
];

export function NewCampaignModal({ open, onOpenChange, onSubmit }: NewCampaignModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    agent: "",
    contactList: "",
    concurrency: 3,
    campaign_type: "outbound",
    auto_trigger_enabled: false,
    max_retry_attempts: 3,
    retry_delay_minutes: 60,
  });

  const { agents, isLoading: agentsLoading } = useAgents();
  const { contactLists, isLoading: listsLoading } = useContacts();

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({
          name: formData.name,
          description: formData.description || undefined,
          concurrency: formData.concurrency,
          agentIds: formData.agent ? [formData.agent] : undefined,
          contactListIds: formData.contactList ? [formData.contactList] : undefined,
          campaign_type: formData.campaign_type,
          auto_trigger_enabled: formData.auto_trigger_enabled,
          max_retry_attempts: formData.max_retry_attempts,
          retry_delay_minutes: formData.retry_delay_minutes,
        });
      }
      // Reset form
      setCurrentStep(1);
      setFormData({
        name: "",
        description: "",
        agent: "",
        contactList: "",
        concurrency: 3,
        campaign_type: "outbound",
        auto_trigger_enabled: false,
        max_retry_attempts: 3,
        retry_delay_minutes: 60,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (isOpen: boolean) => {
    if (!isOpen) {
      setCurrentStep(1);
      setFormData({
        name: "",
        description: "",
        agent: "",
        contactList: "",
        concurrency: 3,
        campaign_type: "outbound",
        auto_trigger_enabled: false,
        max_retry_attempts: 3,
        retry_delay_minutes: 60,
      });
    }
    onOpenChange(isOpen);
  };

  const isNextDisabled = () => {
    if (currentStep === 1) return !formData.name;
    return false;
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Campaign Name</Label>
              <Input
                id="name"
                placeholder="Renewal Follow-up"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="campaign_type">Campaign Type</Label>
              <Select
                value={formData.campaign_type}
                onValueChange={(value) => setFormData({ ...formData, campaign_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="outbound">Outbound (Manual)</SelectItem>
                  <SelectItem value="order_conversion">Order Conversion (Auto)</SelectItem>
                  <SelectItem value="cart_recovery">Cart Recovery (Auto)</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the purpose of this campaign..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="min-h-[100px]"
              />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Select Agent</Label>
              <Select
                value={formData.agent}
                onValueChange={(value) => setFormData({ ...formData, agent: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={agentsLoading ? "Loading agents..." : "Choose an agent"} />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{agent.name}</span>
                        <span className="text-xs text-muted-foreground capitalize">
                          {agent.status}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {agents.length === 0 && !agentsLoading && (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      No agents available. Create an agent first.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Select the AI agent that will handle calls for this campaign. You can customize the agent's prompts later.
            </p>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Use Contact List</Label>
              <Select
                value={formData.contactList}
                onValueChange={(value) => setFormData({ ...formData, contactList: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder={listsLoading ? "Loading lists..." : "Select a contact list"} />
                </SelectTrigger>
                <SelectContent>
                  {contactLists.map((list) => (
                    <SelectItem key={list.id} value={list.id}>
                      <div className="flex items-center justify-between gap-2">
                        <span>{list.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {list.contactCount} contacts
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                  {contactLists.length === 0 && !listsLoading && (
                    <div className="px-2 py-3 text-sm text-muted-foreground text-center">
                      No contact lists available. Create a list first.
                    </div>
                  )}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              Choose an existing contact list or upload a new CSV file with phone numbers.
            </p>
          </div>
        );
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Max Concurrent Calls</Label>
                <span className="text-2xl font-semibold text-primary">{formData.concurrency}</span>
              </div>
              <Slider
                value={[formData.concurrency]}
                onValueChange={(vals) => setFormData({ ...formData, concurrency: vals[0] })}
                min={1}
                max={10}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1</span>
                <span>10</span>
              </div>
            </div>

            {/* Auto Trigger Settings */}
            {(formData.campaign_type === "order_conversion" || formData.campaign_type === "cart_recovery") && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Auto-Trigger Enabled</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start calls when new orders arrive
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="auto_trigger"
                      className="h-4 w-4 rounded border-gray-300"
                      checked={formData.auto_trigger_enabled}
                      onChange={(e) => setFormData({ ...formData, auto_trigger_enabled: e.target.checked })}
                    />
                  </div>
                </div>

                {formData.auto_trigger_enabled && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="max_retry">Max Retries</Label>
                      <Input
                        id="max_retry"
                        type="number"
                        min={0}
                        max={5}
                        value={formData.max_retry_attempts}
                        onChange={(e) => setFormData({ ...formData, max_retry_attempts: parseInt(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retry_delay">Retry Delay (min)</Label>
                      <Input
                        id="retry_delay"
                        type="number"
                        min={5}
                        max={1440}
                        value={formData.retry_delay_minutes}
                        onChange={(e) => setFormData({ ...formData, retry_delay_minutes: parseInt(e.target.value) })}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <p className="text-sm text-muted-foreground">
              This controls how many calls can be made simultaneously. Higher values increase throughput but may affect quality.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Campaign</DialogTitle>
          <DialogDescription>
            Set up a new AI calling campaign in a few simple steps.
          </DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-6">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                  currentStep > step.id
                    ? "bg-primary text-primary-foreground"
                    : currentStep === step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-12 mx-2 transition-colors",
                    currentStep > step.id ? "bg-primary" : "bg-secondary"
                  )}
                />
              )}
            </div>
          ))}
        </div>

        {/* Step Title */}
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-foreground">
            {steps[currentStep - 1].title}
          </h3>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="min-h-[180px]"
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className="gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
          {currentStep < steps.length ? (
            <Button onClick={handleNext} disabled={isNextDisabled()} className="gap-2">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !formData.name}
              className="gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Campaign
                  <Check className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
