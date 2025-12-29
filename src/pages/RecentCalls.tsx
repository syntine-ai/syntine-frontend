import { useState, useEffect, useMemo } from "react";
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

// Mock data
const mockCallLogs: CallLogEntry[] = [
  {
    id: "call-001",
    caller: "Test Call",
    phoneNumber: "+91 98765 43210",
    status: "answered",
    duration: "2:34",
    organization: "42487a3f",
    agent: "Agent A",
    startedAt: "28/12/2024, 10:30 AM",
  },
  {
    id: "call-002",
    caller: "Web Call",
    phoneNumber: "N/A",
    status: "ended",
    duration: "1:15",
    organization: "42487a3f",
    agent: "Agent B",
    startedAt: "28/12/2024, 10:25 AM",
  },
  {
    id: "call-003",
    caller: "Outbound Campaign",
    phoneNumber: "+1 555 123 4567",
    status: "missed",
    duration: null,
    organization: "7b3e2a1c",
    agent: "Agent A",
    startedAt: "28/12/2024, 10:20 AM",
  },
  {
    id: "call-004",
    caller: "Test Call",
    phoneNumber: "+44 20 7946 0958",
    status: "answered",
    duration: "5:42",
    organization: "42487a3f",
    agent: "Agent C",
    startedAt: "28/12/2024, 10:15 AM",
  },
  {
    id: "call-005",
    caller: "Inbound Lead",
    phoneNumber: "+91 87654 32109",
    status: "failed",
    duration: null,
    organization: "9f8d4c5e",
    agent: "Agent B",
    startedAt: "28/12/2024, 10:10 AM",
  },
  {
    id: "call-006",
    caller: "Follow-up Call",
    phoneNumber: "+1 555 987 6543",
    status: "answered",
    duration: "3:18",
    organization: "42487a3f",
    agent: "Agent A",
    startedAt: "28/12/2024, 10:05 AM",
  },
  {
    id: "call-007",
    caller: "Web Call",
    phoneNumber: "N/A",
    status: "missed",
    duration: null,
    organization: "7b3e2a1c",
    agent: "Agent C",
    startedAt: "28/12/2024, 10:00 AM",
  },
  {
    id: "call-008",
    caller: "Demo Request",
    phoneNumber: "+49 30 12345678",
    status: "answered",
    duration: "8:22",
    organization: "42487a3f",
    agent: "Agent B",
    startedAt: "27/12/2024, 04:45 PM",
  },
];

const defaultFilters: CallLogsFilters = {
  search: "",
  status: [],
  agent: "All Agents",
  organization: "All Orgs",
  durationRange: [0, 600],
  dateRange: { from: undefined, to: undefined },
};

const RecentCalls = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<CallLogsFilters>(defaultFilters);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("desc");
    }
  };

  const filteredLogs = useMemo(() => {
    let result = [...mockCallLogs];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (log) =>
          log.id.toLowerCase().includes(search) ||
          log.phoneNumber.toLowerCase().includes(search) ||
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

    // Organization filter
    if (filters.organization !== "All Orgs") {
      result = result.filter((log) => log.organization === filters.organization);
    }

    // Sort
    if (sortColumn) {
      result.sort((a, b) => {
        let aVal: any, bVal: any;
        if (sortColumn === "duration") {
          aVal = a.duration ? parseInt(a.duration.replace(":", "")) : 0;
          bVal = b.duration ? parseInt(b.duration.replace(":", "")) : 0;
        } else if (sortColumn === "startedAt") {
          aVal = new Date(a.startedAt.split(",")[0].split("/").reverse().join("-")).getTime();
          bVal = new Date(b.startedAt.split(",")[0].split("/").reverse().join("-")).getTime();
        }
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      });
    }

    return result;
  }, [filters, sortColumn, sortDirection]);

  const stats = useMemo(() => {
    const total = mockCallLogs.length;
    const answered = mockCallLogs.filter((l) => l.status === "answered").length;
    const missed = mockCallLogs.filter((l) => l.status === "missed").length;
    const avgDuration = mockCallLogs
      .filter((l) => l.duration)
      .reduce((acc, l) => {
        const [m, s] = l.duration!.split(":").map(Number);
        return acc + m * 60 + s;
      }, 0);
    const avgMins = Math.floor(avgDuration / mockCallLogs.filter((l) => l.duration).length / 60);
    const avgSecs = Math.floor((avgDuration / mockCallLogs.filter((l) => l.duration).length) % 60);

    return {
      total,
      answered,
      missed,
      avgDuration: `${avgMins}m ${avgSecs}s`,
    };
  }, []);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Your call logs export is being prepared.",
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
