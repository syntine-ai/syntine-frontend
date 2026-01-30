import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Bot, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mockAgents } from "@/data/demoAgentCampaignData";

const Agents = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [agentStatuses, setAgentStatuses] = useState<Record<string, boolean>>(
    Object.fromEntries(mockAgents.map((a) => [a.id, a.status === "Active"]))
  );

  const filteredAgents = mockAgents.filter((agent) =>
    agent.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = (agentId: string, checked: boolean) => {
    setAgentStatuses((prev) => ({ ...prev, [agentId]: checked }));
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Table */}
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
                    <span className="text-sm font-medium text-foreground">
                      {agent.name}
                    </span>
                  </div>
                </td>
                <td
                  className="px-4 py-3 hidden sm:table-cell cursor-pointer"
                  onClick={() => navigate(`/agents/${agent.id}`)}
                >
                  <span className="text-sm text-muted-foreground">
                    {agent.lastUpdated}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <Switch
                    checked={agentStatuses[agent.id]}
                    onCheckedChange={(checked) => handleToggle(agent.id, checked)}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Agents;
