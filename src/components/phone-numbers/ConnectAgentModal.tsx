import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Bot, Loader2 } from "lucide-react";
import { useAgents } from "@/hooks/useAgents";
import type { PhoneNumberWithAgent } from "@/hooks/usePhoneNumbers";

interface ConnectAgentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  phoneNumber: PhoneNumberWithAgent | null;
  onConnect: (numberId: string, agentId: string) => Promise<boolean>;
  existingConnections: string[]; // agent IDs that already have numbers
}

const getCountryFlag = (countryCode: string) => {
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split("")
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🌐";
  }
};

export function ConnectAgentModal({
  open,
  onOpenChange,
  phoneNumber,
  onConnect,
  existingConnections,
}: ConnectAgentModalProps) {
  const { agents, isLoading: agentsLoading } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = useState<string>("");
  const [isConnecting, setIsConnecting] = useState(false);

  // Filter agents that don't already have a phone number
  const availableAgents = agents.filter(
    (agent) =>
      agent.status === "active" &&
      !existingConnections.includes(agent.id)
  );

  const handleConnect = async () => {
    if (!phoneNumber || !selectedAgentId) return;

    setIsConnecting(true);
    try {
      const success = await onConnect(phoneNumber.id, selectedAgentId);
      if (success) {
        setSelectedAgentId("");
        onOpenChange(false);
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setSelectedAgentId("");
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Connect to Agent</DialogTitle>
          <DialogDescription>
            Select an agent to connect this phone number to.
          </DialogDescription>
        </DialogHeader>

        {phoneNumber && (
          <div className="space-y-4">
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Phone Number</p>
              <p className="font-mono text-lg">
                {getCountryFlag(phoneNumber.country)} {phoneNumber.phone_number}
              </p>
              {phoneNumber.region && (
                <p className="text-sm text-muted-foreground">{phoneNumber.region}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="agent-select">Select Agent</Label>
              <Select
                value={selectedAgentId}
                onValueChange={setSelectedAgentId}
                disabled={agentsLoading}
              >
                <SelectTrigger id="agent-select">
                  <SelectValue placeholder="Choose an agent..." />
                </SelectTrigger>
                <SelectContent>
                  {availableAgents.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No active agents available
                    </div>
                  ) : (
                    availableAgents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-primary" />
                          <span>{agent.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleConnect}
            disabled={!selectedAgentId || isConnecting}
          >
            {isConnecting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Connect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
