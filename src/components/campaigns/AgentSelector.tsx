import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface Agent {
  id: string;
  name: string;
  type: string;
}

const mockAgents: Agent[] = [
  { id: "1", name: "Sales Assistant", type: "Outbound" },
  { id: "2", name: "Support Bot", type: "Inbound" },
  { id: "3", name: "Lead Qualifier", type: "Hybrid" },
  { id: "4", name: "Feedback Collector", type: "Outbound" },
];

interface AgentSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function AgentSelector({ value, onChange, className }: AgentSelectorProps) {
  const selectedAgent = mockAgents.find((a) => a.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">Assigned Agent</Label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an agent">
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>{selectedAgent.name}</span>
                <span className="text-xs text-muted-foreground">({selectedAgent.type})</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {mockAgents.map((agent) => (
            <SelectItem key={agent.id} value={agent.id}>
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>{agent.name}</span>
                <span className="text-xs text-muted-foreground">({agent.type})</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
