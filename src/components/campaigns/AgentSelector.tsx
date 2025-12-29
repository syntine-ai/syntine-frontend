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
import { useAgents } from "@/hooks/useAgents";

interface AgentSelectorProps {
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  disabled?: boolean;
}

export function AgentSelector({ value, onChange, className, disabled }: AgentSelectorProps) {
  const { agents, isLoading } = useAgents();

  // Find the selected agent from real data
  const selectedAgent = agents.find((a) => a.id === value);

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium text-foreground">Assigned Agent</Label>
      <Select value={value} onValueChange={onChange} disabled={disabled || isLoading}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={isLoading ? "Loading agents..." : "Select an agent"}>
            {selectedAgent && (
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-primary" />
                <span>{selectedAgent.name}</span>
                <span className="text-xs text-muted-foreground">
                  ({selectedAgent.status === "active" ? "Active" : "Inactive"})
                </span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {agents.length === 0 ? (
            <div className="px-2 py-4 text-sm text-muted-foreground text-center">
              No agents available
            </div>
          ) : (
            agents.map((agent) => (
              <SelectItem key={agent.id} value={agent.id}>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-primary" />
                  <span>{agent.name}</span>
                  <span className="text-xs text-muted-foreground">
                    ({agent.status === "active" ? "Active" : "Inactive"})
                  </span>
                </div>
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
    </div>
  );
}
