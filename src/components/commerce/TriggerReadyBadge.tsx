import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, MinusCircle } from "lucide-react";

interface TriggerReadyBadgeProps {
  status: "ready" | "missing_phone" | "not_applicable" | null;
}

export function TriggerReadyBadge({ status }: TriggerReadyBadgeProps) {
  switch (status) {
    case "ready":
      return (
        <Badge className="bg-success/15 text-success border-success/40 border">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Ready
        </Badge>
      );
    case "missing_phone":
      return (
        <Badge className="bg-warning/15 text-warning border-warning/40 border">
          <AlertCircle className="h-3 w-3 mr-1" />
          Missing Phone
        </Badge>
      );
    case "not_applicable":
      return (
        <Badge className="bg-muted text-muted-foreground border-border border">
          <MinusCircle className="h-3 w-3 mr-1" />
          N/A
        </Badge>
      );
    default:
      return (
        <Badge className="bg-muted text-muted-foreground border-border border">
          Unknown
        </Badge>
      );
  }
}
