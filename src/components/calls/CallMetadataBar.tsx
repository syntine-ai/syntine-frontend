import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Info, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

export interface CallMetadata {
  callUuid: string;
  phone: string | null;
  startTime: string;
  duration: string | null;
  organization: string;
  agent: string;
  status: "answered" | "ended" | "missed" | "failed";
}

interface CallMetadataBarProps {
  metadata: CallMetadata;
  onExport: () => void;
}

const statusConfig = {
  answered: { label: "Answered", className: "bg-success/15 text-success border-success/30" },
  ended: { label: "Ended", className: "bg-muted text-muted-foreground border-border" },
  missed: { label: "Missed", className: "bg-warning/15 text-warning border-warning/30" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

export function CallMetadataBar({ metadata, onExport }: CallMetadataBarProps) {
  const [copied, setCopied] = useState(false);

  const copyUuid = async () => {
    await navigator.clipboard.writeText(metadata.callUuid);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const metadataFields = [
    {
      label: "Call UUID",
      value: (
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm">{metadata.callUuid}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={copyUuid}
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-success" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      ),
    },
    {
      label: "Phone",
      value: metadata.phone || "N/A",
    },
    {
      label: "Start Time",
      value: metadata.startTime,
    },
    {
      label: "Duration",
      value: metadata.duration || "N/A",
    },
    {
      label: "Organization",
      value: (
        <span className="font-mono text-sm text-primary hover:underline cursor-pointer">
          {metadata.organization}
        </span>
      ),
    },
    {
      label: "Agent",
      value: metadata.agent,
    },
  ];

  return (
    <div className="bg-card rounded-xl border border-border/50 p-5">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-foreground">Call Details</h2>
          <Badge
            variant="outline"
            className={cn("font-medium", statusConfig[metadata.status].className)}
          >
            {statusConfig[metadata.status].label}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Info className="h-4 w-4 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>View additional call information</p>
            </TooltipContent>
          </Tooltip>
          <Button variant="outline" size="sm" onClick={onExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export Call Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {metadataFields.map((field, index) => (
          <div key={index} className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              {field.label}
            </p>
            <div className="text-sm text-foreground">{field.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
