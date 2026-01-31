import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bot, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAgents } from "@/hooks/useAgents";
import { format } from "date-fns";
import { toast } from "sonner";

const Agents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { agents, isLoading, error, updateAgentStatus } = useAgents();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (agentId: string, currentStatus: string) => {
    try {
      setTogglingId(agentId);
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await updateAgentStatus(agentId, newStatus);
      toast.success(`Agent ${newStatus === "active" ? "activated" : "deactivated"}`);
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-foreground">All Agents</h1>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64 text-destructive">
          Error loading agents: {error}
        </div>
      ) : filteredAgents.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-lg">
          <Bot className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No agents found.</p>
        </div>
      ) : (
        <div className="border border-border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3">
                  Agent Name
                </th>
                <th className="text-left text-sm font-medium text-muted-foreground px-4 py-3 hidden sm:table-cell">
                  Last Updated
                </th>
                <th className="text-center text-sm font-medium text-muted-foreground px-4 py-3 w-24">
                  Enabled
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAgents.map((agent) => (
                <tr
                  key={agent.id}
                  className="border-b border-border last:border-b-0 hover:bg-muted/20 transition-colors"
                >
                  <td
                    className="px-4 py-3 cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {agent.name}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {agent.language} • {agent.tone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td
                    className="px-4 py-3 hidden sm:table-cell cursor-pointer"
                    onClick={() => navigate(`/agents/${agent.id}`)}
                  >
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(agent.updated_at || agent.created_at), "MMM d, yyyy h:mm a")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Switch
                      checked={agent.status === "active"}
                      onCheckedChange={() => handleToggle(agent.id, agent.status)}
                      disabled={togglingId === agent.id}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Agents;
