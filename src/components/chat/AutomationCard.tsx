import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

interface AutomationCardProps {
  label: string;
  description: string;
  isEnabled: boolean;
  onToggle: () => void;
  onEdit: () => void;
}

export function AutomationCard({ label, description, isEnabled, onToggle, onEdit }: AutomationCardProps) {
  return (
    <Card className="relative">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h3 className="text-sm font-semibold text-foreground">{label}</h3>
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          </div>
          <Switch checked={isEnabled} onCheckedChange={onToggle} />
        </div>
        <Button variant="outline" size="sm" className="w-full gap-2" onClick={onEdit}>
          <Settings className="h-3.5 w-3.5" />
          Configure
        </Button>
      </CardContent>
    </Card>
  );
}
