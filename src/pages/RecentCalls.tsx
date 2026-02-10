import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { Button } from "@/components/ui/button";
import { CallLogsFiltersPanel, CallLogsFilters } from "@/components/calls/CallLogsFiltersPanel";
import { CallLogsTable, CallLogEntry } from "@/components/calls/CallLogsTable";
import { Phone, PhoneIncoming, PhoneMissed, Clock, Download, PhoneOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useCallLogs } from "@/hooks/useCallLogs";

const defaultFilters: CallLogsFilters = {
  search: "",
  status: [],
  agent: "All Agents",
  organization: "All Orgs",
  durationRange: [0, 600],
  dateRange: { from: undefined, to: undefined },
};

// Map real outcome to display status
const outcomeToStatus = (outcome: string | null): "answered" | "ended" | "missed" | "failed" => {
  if (!outcome) return "ended";
  switch (outcome) {
    case "confirmed":
    case "rejected":
    case "recovered":
    case "not_recovered":
    case "answered":
    case "handled":
      return "answered";
    case "no_response":
    case "missed":
    case "busy":
      return "missed";
    case "failed":
      return "failed";
    default:
      return "ended";
  }
};

// Map real call_type to display format
const mapCallType = (callType: string | null): "inbound" | "outbound" | "webcall" => {
  if (callType === "inbound") return "inbound";
  if (callType === "webcall") return "webcall";
  return "outbound";
};

// Format duration from seconds to "M:SS" string
const formatDuration = (seconds: number | null): string => {
  if (!seconds) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RecentCalls = () => {
  const [filters, setFilters] = useState<CallLogsFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const { calls, isLoading } = useCallLogs();

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Transform real calls to CallLogEntry format
  const callLogs: CallLogEntry[] = useMemo(() => {
    return calls.map((call) => ({
      id: call.id,
      caller: call.contact_name || call.to_number || "Unknown",
      fromNumber: call.from_number || undefined,
      toNumber: call.to_number || undefined,
      callType: mapCallType(call.call_type),
      status: outcomeToStatus(call.outcome),
      outcome: call.outcome,
      rawStatus: call.status,
      displayStatus: "", // Handled by table logic
      duration: formatDuration(call.duration_seconds),
      agent: call.agent_name || "System",
      startedAt: call.created_at ? format(new Date(call.created_at), "dd/MM/yyyy, hh:mm a") : "N/A",
      rawDate: call.created_at, // for sorting
    }));
  }, [calls]);

  // Get unique agents for filter
  const agentOptions = useMemo(() => {
    const uniqueAgents = new Set<string>();
    uniqueAgents.add("All Agents");
    callLogs.forEach((call) => {
      if (call.agent) {
        uniqueAgents.add(call.agent);
      }
    });
    return Array.from(uniqueAgents);
  }, [callLogs]);

  const filteredLogs = useMemo(() => {
    let result = [...callLogs];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.id.toLowerCase().includes(search) ||
          (log.fromNumber?.toLowerCase().includes(search)) ||
          (log.toNumber?.toLowerCase().includes(search)) ||
          log.caller.toLowerCase().includes(search)
      );
    }

    // Status filter
    if (filters.status.length > 0) {
      result = result.filter((log) =>
        filters.status.some((s) => s.toLowerCase() === log.status)
      );
    }

    // Agent filter
    if (filters.agent !== "All Agents") {
      result = result.filter((log) => log.agent === filters.agent);
    }

    // Duration filter
    if (filters.durationRange[0] > 0 || filters.durationRange[1] < 600) {
      result = result.filter((log) => {
        if (!log.duration) return filters.durationRange[0] === 0;
        const [m, s] = log.duration.split(":").map(Number);
        const durationSec = m * 60 + s;
        return durationSec >= filters.durationRange[0] && durationSec <= filters.durationRange[1];
      });
    }

    // Date range filter
    if (filters.dateRange.from || filters.dateRange.to) {
      result = result.filter((log) => {
        if (!log.rawDate) return false;
        const logDate = new Date(log.rawDate);
        if (filters.dateRange.from && logDate < filters.dateRange.from) return false;
        if (filters.dateRange.to && logDate > filters.dateRange.to) return false;
        return true;
      });
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: number, bVal: number;
        if (sortColumn === "duration") {
          aVal = a.duration ? parseInt(a.duration.replace(":", "")) : 0;
          bVal = b.duration ? parseInt(b.duration.replace(":", "")) : 0;
        } else if (sortColumn === "startedAt") {
          // Use rawDate for accurate sorting
          aVal = a.rawDate ? new Date(a.rawDate).getTime() : 0;
          bVal = b.rawDate ? new Date(b.rawDate).getTime() : 0;
        } else {
          // generic string sort
          const aStr = (a as any)[sortColumn]?.toString() || "";
          const bStr = (b as any)[sortColumn]?.toString() || "";
          return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [callLogs, filters, sortColumn, sortDirection]);

  const stats = useMemo(() => {
    const total = callLogs.length;
    const answered = callLogs.filter((l) => l.status === "answered").length;
    const missed = callLogs.filter((l) => l.status === "missed").length;

    const callsWithDuration = callLogs.filter((l) => l.duration !== "0:00");
    const totalDurationSec = callsWithDuration.reduce((acc, l) => {
      if (!l.duration) return acc;
      const [m, s] = l.duration.split(":").map(Number);
      return acc + m * 60 + s;
    }, 0);

    const avgDurationSec = callsWithDuration.length > 0
      ? totalDurationSec / callsWithDuration.length
      : 0;
    const avgMins = Math.floor(avgDurationSec / 60);
    const avgSecs = Math.floor(avgDurationSec % 60);

    return {
      total,
      answered,
      missed,
      avgDuration: callsWithDuration.length > 0 ? `${avgMins}m ${avgSecs}s` : "0m 0s",
    };
  }, [callLogs]);

  const handleExport = () => {
    if (filteredLogs.length === 0) {
      toast({
        title: "No data to export",
        description: "There are no call logs matching your filters.",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      ["ID", "Caller", "Type", "From Number", "To Number", "Status", "Duration", "Agent", "Started At"].join(","),
      ...filteredLogs.map((log) =>
        [
          log.id,
          log.caller,
          log.callType,
          log.fromNumber || "N/A",
          log.toNumber || "N/A",
          log.status,
          log.duration || "N/A",
          log.agent,
          log.startedAt,
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

    toast({
      title: "Export complete",
      description: `Exported ${filteredLogs.length} call logs.`,
    });
  };

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.agent !== "All Agents" ||
    filters.organization !== "All Orgs" ||
    filters.durationRange[0] > 0 ||
    filters.durationRange[1] < 600 ||
    filters.dateRange.from ||
    filters.dateRange.to;

  return (
    <PageContainer
      title="Recent Calls"
      subtitle="Monitor and inspect all AI-driven calls"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Calls"
            value={stats.total}
            icon={Phone}
            iconColor="primary"
          />
          <StatCard
            title="Answered"
            value={stats.answered}
            icon={PhoneIncoming}
            iconColor="success"
          />
          <StatCard
            title="Missed"
            value={stats.missed}
            icon={PhoneMissed}
            iconColor="warning"
          />
          <StatCard
            title="Avg Duration"
            value={stats.avgDuration}
            icon={Clock}
            iconColor="primary"
          />
        </div>

        {/* Header Actions */}
        <div className="flex items-center justify-end">
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Filters */}
        <CallLogsFiltersPanel
          filters={filters}
          onFiltersChange={setFilters}
          onClearFilters={() => setFilters(defaultFilters)}
          agentOptions={agentOptions}
        />

        {/* Table */}
        {isLoading ? (
          <SkeletonTable rows={8} columns={8} />
        ) : filteredLogs.length === 0 ? (
          <EmptyState
            icon={PhoneOff}
            title="No calls found"
            description={
              hasActiveFilters
                ? "Try adjusting your filters to find what you're looking for."
                : "Call logs will appear here once your agents start making calls."
            }
            actionLabel={hasActiveFilters ? "Clear Filters" : undefined}
            onAction={hasActiveFilters ? () => setFilters(defaultFilters) : undefined}
          />
        ) : (
          <CallLogsTable
            logs={filteredLogs}
            sortColumn={sortColumn}
            sortDirection={sortDirection}
            onSort={handleSort}
          />
        )}
      </motion.div>
    </PageContainer>
  );
};

export default RecentCalls;
