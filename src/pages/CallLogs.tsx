import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  Download,
  PhoneOff,
  ShoppingBag,
  ShoppingCart,
  PhoneIncoming,
  FileText,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  demoCallLogs,
  demoCallLogStats,
  formatCurrency,
  type DemoCallLog,
} from "@/data/demoOutcomesData";

const outcomeConfig: Record<string, { label: string; className: string }> = {
  confirmed: {
    label: "Confirmed",
    className: "bg-success/15 text-success border-success/30",
  },
  rejected: {
    label: "Rejected",
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  no_response: {
    label: "No Response",
    className: "bg-muted text-muted-foreground border-border",
  },
  recovered: {
    label: "Recovered",
    className: "bg-success/15 text-success border-success/30",
  },
  not_recovered: {
    label: "Not Recovered",
    className: "bg-warning/15 text-warning border-warning/30",
  },
  handled: {
    label: "Handled",
    className: "bg-primary/15 text-primary border-primary/30",
  },
};

const relatedToConfig: Record<string, { label: string; className: string }> = {
  order: {
    label: "Order",
    className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30",
  },
  cart: {
    label: "Cart",
    className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30",
  },
  inbound: {
    label: "Inbound",
    className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CallLogs = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [relatedToFilter, setRelatedToFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");

  const filteredLogs = useMemo(() => {
    return demoCallLogs.filter((call) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesPhone = call.customerPhone.toLowerCase().includes(searchLower);
        const matchesName = call.customerName.toLowerCase().includes(searchLower);
        const matchesId = call.relatedId?.toLowerCase().includes(searchLower);
        if (!matchesPhone && !matchesName && !matchesId) return false;
      }
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) return false;
      if (relatedToFilter !== "all" && call.relatedTo !== relatedToFilter) return false;
      if (campaignFilter !== "all") {
        if (campaignFilter === "order" && call.campaign !== "Order Confirmation") return false;
        if (campaignFilter === "cart" && call.campaign !== "Cart Abandonment") return false;
        if (campaignFilter === "inbound" && call.campaign !== null) return false;
      }
      return true;
    });
  }, [search, outcomeFilter, relatedToFilter, campaignFilter]);

  const clearFilters = () => {
    setSearch("");
    setOutcomeFilter("all");
    setRelatedToFilter("all");
    setCampaignFilter("all");
  };

  const hasActiveFilters =
    search || outcomeFilter !== "all" || relatedToFilter !== "all" || campaignFilter !== "all";

  const formatDuration = (seconds: number) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: string) => {
    return format(new Date(date), "MMM d, h:mm a");
  };

  const handleExport = () => {
    const csvContent = [
      ["Time", "Customer", "Related To", "ID", "Campaign", "Agent", "Duration", "Outcome"].join(","),
      ...filteredLogs.map((call) =>
        [
          call.createdAt,
          call.customerName,
          call.relatedTo,
          call.relatedId || "-",
          call.campaign || "Inbound",
          call.agent,
          call.duration,
          call.outcome,
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `call-logs-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Call Logs"
        subtitle="Review voice calls linked to orders and carts."
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Summary Cards */}
          <motion.div variants={itemVariants}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricCard
                label="Calls Linked to Orders"
                value={demoCallLogStats.callsLinkedToOrders.toString()}
                icon={ShoppingBag}
              />
              <MetricCard
                label="Calls Linked to Carts"
                value={demoCallLogStats.callsLinkedToCarts.toString()}
                icon={ShoppingCart}
              />
              <MetricCard
                label="Inbound Handled"
                value={demoCallLogStats.inboundCallsHandled.toString()}
                icon={PhoneIncoming}
              />
              <MetricCard
                label="No Response"
                value={demoCallLogStats.noResponseCalls.toString()}
                icon={PhoneOff}
              />
            </div>
          </motion.div>

          {/* Filters */}
          <motion.div variants={itemVariants}>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, phone, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={relatedToFilter} onValueChange={setRelatedToFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Related To" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="order">Order</SelectItem>
                  <SelectItem value="cart">Cart</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
              <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Outcome" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outcomes</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="recovered">Recovered</SelectItem>
                  <SelectItem value="not_recovered">Not Recovered</SelectItem>
                  <SelectItem value="no_response">No Response</SelectItem>
                  <SelectItem value="handled">Handled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={campaignFilter} onValueChange={setCampaignFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="order">Order Confirmation</SelectItem>
                  <SelectItem value="cart">Cart Abandonment</SelectItem>
                  <SelectItem value="inbound">Inbound</SelectItem>
                </SelectContent>
              </Select>
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Clear filters
                </Button>
              )}
              <div className="flex-1" />
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export CSV
              </Button>
            </div>
          </motion.div>

          {/* Table */}
          <motion.div variants={itemVariants}>
            {filteredLogs.length === 0 ? (
              <EmptyState
                icon={PhoneOff}
                title="No call logs found"
                description={
                  hasActiveFilters
                    ? "Try adjusting your filters to find what you're looking for."
                    : "Call logs will appear here once your campaigns start making calls."
                }
                actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
                onAction={hasActiveFilters ? clearFilters : undefined}
              />
            ) : (
              <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/50 hover:bg-transparent">
                      <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Customer</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Related To</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Order / Cart ID</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Outcome</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Campaign</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Agent</TableHead>
                      <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                      <TableHead className="text-muted-foreground font-medium w-[100px]">Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((call, index) => (
                      <motion.tr
                        key={call.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        className="border-border/50 hover:bg-muted/30 cursor-pointer"
                        onClick={() => navigate(`/app/calls/${call.id}`)}
                      >
                        <TableCell className="text-muted-foreground">
                          {formatTime(call.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{call.customerName}</span>
                            <span className="text-xs text-muted-foreground">{call.customerPhone}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("font-medium", relatedToConfig[call.relatedTo].className)}
                          >
                            {relatedToConfig[call.relatedTo].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {call.relatedId ? (
                            <Link
                              to={call.relatedTo === "order" ? `/app/orders` : `/app/abandoned-carts`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-primary hover:underline font-mono text-sm"
                            >
                              {call.relatedId}
                            </Link>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={cn("font-medium", outcomeConfig[call.outcome].className)}
                          >
                            {outcomeConfig[call.outcome].label}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {call.campaign || "Inbound"}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          <Link
                            to={`/app/agents/${call.agent.toLowerCase().replace(/ /g, "_")}`}
                            onClick={(e) => e.stopPropagation()}
                            className="hover:text-primary hover:underline"
                          >
                            {call.agent}
                          </Link>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {formatDuration(call.duration)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/app/calls/${call.id}`);
                            }}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallLogs;
