import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  trigger: string;
  agent: string;
  calls: number;
  successRate: string;
  lastRun: string;
  defaultEnabled: boolean;
}

const campaigns: Campaign[] = [
  {
    id: "order_confirmation",
    name: "Order Confirmation",
    trigger: "COD order placed",
    agent: "Order Confirmation Agent",
    calls: 124,
    successRate: "78%",
    lastRun: "2 minutes ago",
    defaultEnabled: true,
  },
  {
    id: "cart_abandonment",
    name: "Cart Abandonment",
    trigger: "Cart abandoned",
    agent: "Cart Abandonment Agent",
    calls: 0,
    successRate: "—",
    lastRun: "—",
    defaultEnabled: false,
  },
];

const Campaigns = () => {
  const [enabledStates, setEnabledStates] = useState<Record<string, boolean>>(
    Object.fromEntries(campaigns.map((c) => [c.id, c.defaultEnabled]))
  );

  const handleToggle = (id: string, checked: boolean) => {
    setEnabledStates((prev) => ({ ...prev, [id]: checked }));
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Campaigns"
        subtitle="Transactional voice automation for orders and carts"
      >
        <div className="flex flex-col gap-4">
          {campaigns.map((campaign) => {
            const isEnabled = enabledStates[campaign.id];
            return (
              <div
                key={campaign.id}
                className="bg-card border border-border rounded-xl p-4"
              >
                {/* Top Row: Name, Badge, Toggle */}
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <h3 className="text-base font-semibold text-foreground truncate">
                      {campaign.name}
                    </h3>
                    <Badge
                      className={cn(
                        "shrink-0 text-xs px-2 py-0.5",
                        isEnabled
                          ? "bg-success/15 text-success border-success/40 border"
                          : "bg-muted text-muted-foreground border-border border"
                      )}
                    >
                      {isEnabled ? "Enabled" : "Paused"}
                    </Badge>
                  </div>
                  <Switch
                    checked={isEnabled}
                    onCheckedChange={(checked) => handleToggle(campaign.id, checked)}
                    className="shrink-0"
                  />
                </div>

                {/* Middle Row: Trigger & Agent */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">Trigger</span>
                    <span className="text-sm text-foreground">{campaign.trigger}</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs text-muted-foreground w-14 shrink-0">Agent</span>
                    <span className="text-sm text-foreground">{campaign.agent}</span>
                  </div>
                </div>

                {/* Bottom Row: Stats */}
                <div className="flex items-center gap-6 pt-3 border-t border-border/50">
                  <div>
                    <span className="text-xs text-muted-foreground">Calls</span>
                    <p className="text-sm font-medium text-foreground">{campaign.calls}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Success</span>
                    <p className="text-sm font-medium text-foreground">{campaign.successRate}</p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">Last Run</span>
                    <p className="text-sm font-medium text-foreground">{campaign.lastRun}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Campaigns;
