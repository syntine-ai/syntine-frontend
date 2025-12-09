import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, Pause, Eye } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  calls: number;
  successRate: number;
  avgDuration: string;
  sentiment: number;
  dbStatus: "ok" | "error" | "syncing";
  agentStatus: "online" | "offline" | "busy";
}

const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Renewal Follow-up Q4",
    status: "active",
    calls: 2340,
    successRate: 87.5,
    avgDuration: "3m 24s",
    sentiment: 72,
    dbStatus: "ok",
    agentStatus: "online",
  },
  {
    id: "2",
    name: "Lead Qualification",
    status: "active",
    calls: 1890,
    successRate: 91.2,
    avgDuration: "2m 48s",
    sentiment: 78,
    dbStatus: "ok",
    agentStatus: "online",
  },
  {
    id: "3",
    name: "Customer Feedback Survey",
    status: "paused",
    calls: 4520,
    successRate: 82.1,
    avgDuration: "4m 12s",
    sentiment: 65,
    dbStatus: "syncing",
    agentStatus: "offline",
  },
  {
    id: "4",
    name: "Product Launch Outreach",
    status: "active",
    calls: 890,
    successRate: 79.3,
    avgDuration: "3m 55s",
    sentiment: 68,
    dbStatus: "ok",
    agentStatus: "busy",
  },
  {
    id: "5",
    name: "Churn Prevention",
    status: "completed",
    calls: 3200,
    successRate: 94.8,
    avgDuration: "5m 02s",
    sentiment: 84,
    dbStatus: "ok",
    agentStatus: "offline",
  },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  paused: { label: "Paused", className: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
};

const dbStatusConfig = {
  ok: { label: "DB OK", className: "bg-success/15 text-success" },
  error: { label: "DB Error", className: "bg-destructive/15 text-destructive" },
  syncing: { label: "Syncing", className: "bg-warning/15 text-warning" },
};

const agentStatusConfig = {
  online: { label: "Online", className: "bg-success/15 text-success" },
  offline: { label: "Offline", className: "bg-muted text-muted-foreground" },
  busy: { label: "Busy", className: "bg-warning/15 text-warning" },
};

export function CampaignsTable() {
  const navigate = useNavigate();

  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Campaign</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Calls</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Success</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Avg Duration</TableHead>
            <TableHead className="text-muted-foreground font-medium text-right">Sentiment</TableHead>
            <TableHead className="text-muted-foreground font-medium">System</TableHead>
            <TableHead className="text-muted-foreground font-medium w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockCampaigns.map((campaign, index) => (
            <motion.tr
              key={campaign.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
              onClick={() => navigate(`/app/campaigns/${campaign.id}`)}
              className={cn(
                "border-border/50 cursor-pointer transition-colors",
                "hover:bg-muted/30"
              )}
            >
              <TableCell className="font-medium text-foreground">{campaign.name}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("border", statusConfig[campaign.status].className)}
                >
                  {statusConfig[campaign.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-medium">
                {campaign.calls.toLocaleString()}
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    "font-medium",
                    campaign.successRate >= 90
                      ? "text-success"
                      : campaign.successRate >= 80
                      ? "text-foreground"
                      : "text-warning"
                  )}
                >
                  {campaign.successRate}%
                </span>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {campaign.avgDuration}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <div className="w-16 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full",
                        campaign.sentiment >= 70
                          ? "bg-success"
                          : campaign.sentiment >= 50
                          ? "bg-warning"
                          : "bg-destructive"
                      )}
                      style={{ width: `${campaign.sentiment}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-8">
                    {campaign.sentiment}
                  </span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-1.5">
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] px-1.5 py-0", dbStatusConfig[campaign.dbStatus].className)}
                  >
                    {dbStatusConfig[campaign.dbStatus].label}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn("text-[10px] px-1.5 py-0", agentStatusConfig[campaign.agentStatus].className)}
                  >
                    {agentStatusConfig[campaign.agentStatus].label}
                  </Badge>
                </div>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                      {campaign.status === "active" ? (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause Campaign
                        </>
                      ) : (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Resume Campaign
                        </>
                      )}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
