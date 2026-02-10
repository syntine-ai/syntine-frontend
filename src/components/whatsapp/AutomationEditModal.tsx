import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";

interface AutomationConfig {
  type: string;
  label: string;
  description: string;
  isEnabled: boolean;
  delay_minutes: number;
  min_order_value: number;
  max_followups: number;
  discount_enabled: boolean;
  discount_percent: number;
}

interface AutomationEditModalProps {
  automation: AutomationConfig;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (config: AutomationConfig) => void;
}

export function AutomationEditModal({ automation, open, onOpenChange, onSave }: AutomationEditModalProps) {
  const [config, setConfig] = useState(automation);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Configure {config.label}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-sm">Delay (minutes)</Label>
            <Input
              type="number"
              value={config.delay_minutes}
              onChange={(e) => setConfig((c) => ({ ...c, delay_minutes: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Min Order Value (₹)</Label>
            <Input
              type="number"
              value={config.min_order_value}
              onChange={(e) => setConfig((c) => ({ ...c, min_order_value: Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Max Follow-ups</Label>
            <Input
              type="number"
              value={config.max_followups}
              onChange={(e) => setConfig((c) => ({ ...c, max_followups: Number(e.target.value) }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-sm">Offer Discount</Label>
            <Switch
              checked={config.discount_enabled}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, discount_enabled: v }))}
            />
          </div>
          {config.discount_enabled && (
            <div className="space-y-1.5">
              <Label className="text-sm">Discount %</Label>
              <Input
                type="number"
                value={config.discount_percent}
                onChange={(e) => setConfig((c) => ({ ...c, discount_percent: Number(e.target.value) }))}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => onSave(config)}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
