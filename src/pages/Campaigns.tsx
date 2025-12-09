import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/StatusPill";
import { FilterChip, FilterChipGroup } from "@/components/shared/FilterChip";
import { Plus, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Input } from "@/components/ui/input";

const campaigns = [
  { id: 1, name: "Black Friday Outreach", status: "running" as const, contacts: 2340, sent: 1890, opened: 45.2 },
  { id: 2, name: "Q4 Newsletter", status: "paused" as const, contacts: 1890, sent: 1200, opened: 38.5 },
  { id: 3, name: "Product Launch", status: "draft" as const, contacts: 0, sent: 0, opened: 0 },
  { id: 4, name: "Holiday Special", status: "running" as const, contacts: 4500, sent: 4200, opened: 52.1 },
  { id: 5, name: "Re-engagement Flow", status: "inactive" as const, contacts: 890, sent: 890, opened: 22.3 },
];

const Campaigns = () => {
  const [activeFilter, setActiveFilter] = useState<string>("all");

  return (
    <OrgAppShell>
      <PageContainer
        title="Campaigns"
        subtitle="Manage and monitor your marketing campaigns"
        actions={
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Campaign
          </Button>
        }
      >
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search campaigns..." className="pl-9" />
          </div>
          <FilterChipGroup>
            {["all", "running", "paused", "draft"].map((filter) => (
              <FilterChip
                key={filter}
                label={filter.charAt(0).toUpperCase() + filter.slice(1)}
                isActive={activeFilter === filter}
                onToggle={() => setActiveFilter(filter)}
              />
            ))}
          </FilterChipGroup>
        </div>

        {/* Campaigns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((campaign, i) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.02, y: -2 }}
              className="bg-card rounded-lg shadow-card border border-border/50 p-5 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold text-foreground">{campaign.name}</h3>
                <StatusPill status={campaign.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-semibold text-foreground">{campaign.contacts.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Contacts</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{campaign.sent.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Sent</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">{campaign.opened}%</p>
                  <p className="text-xs text-muted-foreground">Opened</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Campaigns;
