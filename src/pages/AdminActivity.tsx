import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AdminActivityTimeline, type ActivityEvent } from "@/components/admin/AdminActivityTimeline";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Search, CalendarIcon, RefreshCw, Loader2 } from "lucide-react";
import { format, subDays, subHours, subMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// Generate mock events
const generateMockEvents = (): ActivityEvent[] => {
  const now = new Date();
  return [
    {
      id: 1,
      type: "organization",
      title: "New organization created",
      description: "Bluewave Technologies was added to the platform.",
      icon: "Building2",
      time: "10m ago",
      timestamp: subMinutes(now, 10),
      metadata: { user: "Admin A", org: "Bluewave Technologies" },
    },
    {
      id: 2,
      type: "billing",
      title: "Subscription upgraded",
      description: "Acme Corp upgraded from Pro to Enterprise plan.",
      icon: "CreditCard",
      time: "1h ago",
      timestamp: subHours(now, 1),
      metadata: { user: "Admin B", org: "Acme Corp", plan: "Enterprise" },
    },
    {
      id: 3,
      type: "system",
      title: "AI runtime auto-restarted",
      description: "Latency threshold exceeded 200ms, automatic restart triggered.",
      icon: "Cpu",
      time: "3h ago",
      timestamp: subHours(now, 3),
      metadata: { system: "AI Cluster", region: "us-east-1" },
    },
    {
      id: 4,
      type: "security",
      title: "Admin login from new device",
      description: "Admin A logged in from a previously unseen device.",
      icon: "ShieldCheck",
      time: "4h ago",
      timestamp: subHours(now, 4),
      metadata: { user: "Admin A", ip: "192.168.1.100", device: "Chrome/MacOS" },
    },
    {
      id: 5,
      type: "organization",
      title: "Organization suspended",
      description: "HealthTech Pro suspended due to payment failure.",
      icon: "AlertTriangle",
      time: "6h ago",
      timestamp: subHours(now, 6),
      metadata: { user: "System", org: "HealthTech Pro", reason: "Payment failed" },
    },
    {
      id: 6,
      type: "billing",
      title: "Invoice generated",
      description: "Monthly invoice generated for Global Systems.",
      icon: "CreditCard",
      time: "8h ago",
      timestamp: subHours(now, 8),
      metadata: { org: "Global Systems", amount: "$2,450.00" },
    },
    {
      id: 7,
      type: "security",
      title: "API key rotated",
      description: "Production API key rotated for TechStart Inc.",
      icon: "RefreshCw",
      time: "Yesterday",
      timestamp: subDays(now, 1),
      metadata: { user: "Admin C", org: "TechStart Inc" },
    },
    {
      id: 8,
      type: "organization",
      title: "User added to organization",
      description: "New user john@acme.com added to Acme Corp.",
      icon: "UserPlus",
      time: "Yesterday",
      timestamp: subDays(now, 1),
      metadata: { user: "Admin A", org: "Acme Corp", newUser: "john@acme.com" },
    },
    {
      id: 9,
      type: "system",
      title: "Database maintenance completed",
      description: "Scheduled database maintenance completed successfully.",
      icon: "CheckCircle",
      time: "Yesterday",
      timestamp: subDays(now, 1),
      metadata: { system: "PostgreSQL", duration: "45 minutes" },
    },
    {
      id: 10,
      type: "billing",
      title: "Subscription canceled",
      description: "Innovation Co canceled their Pro subscription.",
      icon: "Trash2",
      time: "2 days ago",
      timestamp: subDays(now, 2),
      metadata: { org: "Innovation Co", reason: "Customer request" },
    },
    {
      id: 11,
      type: "security",
      title: "Failed login attempt",
      description: "Multiple failed login attempts detected for admin@syntine.io.",
      icon: "AlertTriangle",
      time: "3 days ago",
      timestamp: subDays(now, 3),
      metadata: { user: "admin@syntine.io", attempts: "5", ip: "10.0.0.45" },
    },
    {
      id: 12,
      type: "organization",
      title: "Organization settings updated",
      description: "FinanceFirst Ltd updated their notification preferences.",
      icon: "Settings",
      time: "4 days ago",
      timestamp: subDays(now, 4),
      metadata: { user: "Admin B", org: "FinanceFirst Ltd" },
    },
  ];
};

const INITIAL_COUNT = 8;
const LOAD_MORE_COUNT = 4;

const AdminActivity = () => {
  const [eventTypeFilter, setEventTypeFilter] = useState("all");
  const [orgSearch, setOrgSearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [isLoading, setIsLoading] = useState(false);

  const allEvents = useMemo(() => generateMockEvents(), []);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      // Event type filter
      if (eventTypeFilter !== "all" && event.type !== eventTypeFilter) {
        return false;
      }

      // Organization search
      if (orgSearch) {
        const orgName = event.metadata?.org?.toLowerCase() || "";
        if (!orgName.includes(orgSearch.toLowerCase())) {
          return false;
        }
      }

      // Admin user search
      if (adminSearch) {
        const userName = event.metadata?.user?.toLowerCase() || "";
        if (!userName.includes(adminSearch.toLowerCase())) {
          return false;
        }
      }

      // Date range filter
      if (dateRange?.from) {
        const eventDate = new Date(event.timestamp);
        if (eventDate < dateRange.from) return false;
        if (dateRange.to && eventDate > dateRange.to) return false;
      }

      return true;
    });
  }, [allEvents, eventTypeFilter, orgSearch, adminSearch, dateRange]);

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  const handleLoadMore = () => {
    setIsLoading(true);
    // Simulate loading delay
    setTimeout(() => {
      setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
      setIsLoading(false);
    }, 500);
  };

  const handleReset = () => {
    setEventTypeFilter("all");
    setOrgSearch("");
    setAdminSearch("");
    setDateRange(undefined);
    setVisibleCount(INITIAL_COUNT);
  };

  return (
    <AdminAppShell>
      <PageContainer
        title="Activity Logs"
        subtitle="Track all administrative events, system actions, and organization-level activity"
        actions={
          <Button variant="outline" size="icon" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        }
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {/* Filters */}
          <div className="bg-card rounded-xl border border-border/50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Event Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Event Type
                </label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All events" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Events</SelectItem>
                    <SelectItem value="organization">Organization</SelectItem>
                    <SelectItem value="billing">Billing</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Date Range */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Date Range
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !dateRange && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateRange?.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "LLL dd")} -{" "}
                            {format(dateRange.to, "LLL dd")}
                          </>
                        ) : (
                          format(dateRange.from, "LLL dd, y")
                        )
                      ) : (
                        "Select dates"
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      initialFocus
                      mode="range"
                      defaultMonth={dateRange?.from}
                      selected={dateRange}
                      onSelect={setDateRange}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Organization Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Organization
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search organization..."
                    value={orgSearch}
                    onChange={(e) => setOrgSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              {/* Admin User Search */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Admin User
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search admin..."
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Results Summary */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {visibleEvents.length} of {filteredEvents.length} events
            </p>
          </div>

          {/* Timeline */}
          <AdminActivityTimeline events={visibleEvents} />

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center pt-4">
              <Button
                variant="outline"
                onClick={handleLoadMore}
                disabled={isLoading}
                className="min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  `Load More (${filteredEvents.length - visibleCount} remaining)`
                )}
              </Button>
            </div>
          )}
        </motion.div>
      </PageContainer>
    </AdminAppShell>
  );
};

export default AdminActivity;
