import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { Button } from "@/components/ui/button";
import { CallLogsFiltersPanel, CallLogsFilters } from "@/components/calls/CallLogsFiltersPanel";
import { CallLogsTable, CallLogEntry } from "@/components/calls/CallLogsTable";
import { Phone, PhoneIncoming, PhoneMissed, Clock, Download, PhoneOff } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useCallLogs } from "@/hooks/useCallLogs";
import { format } from "date-fns";

const defaultFilters: CallLogsFilters = {
  search: "",
  status: [],
  agent: "All Agents",
  organization: "All Orgs",
  durationRange: [0, 600],
  dateRange: { from: undefined, to: undefined },
};

// Map database outcome to display status
const outcomeToStatus = (outcome: string | null): "answered" | "ended" | "missed" | "failed" => {
  switch (outcome) {
    case "answered":
      return "answered";
    case "no_answer":
      return "missed";
    case "busy":
    case "voicemail":
      return "ended";
    case "failed":
      return "failed";
    default:
      return "ended";
  }
};

// Map database call_type to display format
const mapCallType = (callType: string | null, direction: string | null): "inbound" | "outbound" | "webcall" => {
  if (callType === "webcall") return "webcall";
  if (callType === "inbound" || direction === "inbound") return "inbound";
  return "outbound";
};

// Format duration from seconds to "M:SS" string
const formatDuration = (seconds: number | null): string | null => {
  if (!seconds) return null;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const RecentCalls = () => {
  const { calls, isLoading } = useCallLogs();
  const [filters, setFilters] = useState<CallLogsFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  // Transform database calls to CallLogEntry format
  const callLogs: CallLogEntry[] = useMemo(() => {
    return calls.map((call) => ({
      id: call.id,
      caller: call.contact_name || "Unknown",
      fromNumber: call.from_number || call.phone_number || null,
      toNumber: call.to_number || call.phone_number || null,
      callType: mapCallType(call.call_type, call.direction),
      status: outcomeToStatus(call.outcome),
      duration: formatDuration(call.duration_seconds),
      agent: call.agent_name || "Unknown Agent",
      startedAt: call.created_at
        ? format(new Date(call.created_at), "dd/MM/yyyy, hh:mm a")
        : "N/A",
    }));
  }, [calls]);

  // Get unique agents for filter
  const agentOptions = useMemo(() => {
    const uniqueAgents = new Set<string>();
    uniqueAgents.add("All Agents");
    calls.forEach((call) => {
      if (call.agent_name) {
        uniqueAgents.add(call.agent_name);
      }
    });
    return Array.from(uniqueAgents);
  }, [calls]);

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
        if (log.startedAt === "N/A") return false;
        // Parse the date from "dd/MM/yyyy, hh:mm a" format
        const parts = log.startedAt.split(",")[0].split("/");
        const logDate = new Date(
          parseInt(parts[2]),
          parseInt(parts[1]) - 1,
          parseInt(parts[0])
        );
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
          const aParts = a.startedAt.split(",")[0].split("/");
          const bParts = b.startedAt.split(",")[0].split("/");
          aVal = a.startedAt !== "N/A"
            ? new Date(parseInt(aParts[2]), parseInt(aParts[1]) - 1, parseInt(aParts[0])).getTime()
            : 0;
          bVal = b.startedAt !== "N/A"
            ? new Date(parseInt(bParts[2]), parseInt(bParts[1]) - 1, parseInt(bParts[0])).getTime()
            : 0;
        } else {
          return 0;
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

    const callsWithDuration = callLogs.filter((l) => l.duration);
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
    <OrgAppShell>
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
          {isLoading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SkeletonCard key={i} className="h-[100px]" />
              ))}
            </div>
          ) : (
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
          )}

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
    </OrgAppShell>
  );
};

export default RecentCalls;
