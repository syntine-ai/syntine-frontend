import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Filter,
  X,
  Search,
  Calendar as CalendarIcon,
  RotateCcw
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface CallLogsFilters {
  search: string;
  status: string[];
  agent: string;
  organization: string;
  durationRange: [number, number];
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
}

interface CallLogsFiltersPanelProps {
  filters: CallLogsFilters;
  onFiltersChange: (filters: CallLogsFilters) => void;
  onClearFilters: () => void;
  agentOptions?: string[];
}

const statusOptions = ["Answered", "Ended", "Missed", "Failed"];
const defaultAgentOptions = ["All Agents"];
const organizationOptions = ["All Orgs"];

export function CallLogsFiltersPanel({
  filters,
  onFiltersChange,
  onClearFilters,
  agentOptions = defaultAgentOptions,
}: CallLogsFiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.search ||
    filters.status.length > 0 ||
    filters.agent !== "All Agents" ||
    filters.organization !== "All Orgs" ||
    filters.durationRange[0] > 0 ||
    filters.durationRange[1] < 600 ||
    filters.dateRange.from ||
    filters.dateRange.to;

  const activeFilterCount = [
    filters.search,
    filters.status.length > 0,
    filters.agent !== "All Agents",
    filters.organization !== "All Orgs",
    filters.durationRange[0] > 0 || filters.durationRange[1] < 600,
    filters.dateRange.from || filters.dateRange.to,
  ].filter(Boolean).length;

  const toggleStatus = (status: string) => {
    const newStatus = filters.status.includes(status)
      ? filters.status.filter((s) => s !== status)
      : [...filters.status, status];
    onFiltersChange({ ...filters, status: newStatus });
  };

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[280px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by call UUID, phone number..."
            value={filters.search}
            onChange={(e) =>
              onFiltersChange({ ...filters, search: e.target.value })
            }
            className="pl-9 bg-card border-border"
          />
        </div>
        <Button
          variant={isOpen ? "secondary" : "outline"}
          onClick={() => setIsOpen(!isOpen)}
          className="gap-2"
        >
          <Filter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-primary text-primary-foreground">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={onClearFilters} className="gap-1 text-muted-foreground">
            <RotateCcw className="h-3.5 w-3.5" />
            Clear
          </Button>
        )}
      </div>

      {/* Expandable Filters Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 bg-card border border-border rounded-xl space-y-5">
              {/* Status Multi-select */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Call Status</Label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map((status) => (
                    <Badge
                      key={status}
                      variant={filters.status.includes(status) ? "default" : "outline"}
                      className={cn(
                        "cursor-pointer transition-colors",
                        filters.status.includes(status)
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "hover:bg-muted"
                      )}
                      onClick={() => toggleStatus(status)}
                    >
                      {status}
                      {filters.status.includes(status) && (
                        <X className="h-3 w-3 ml-1" />
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Agent & Organization Selects */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Agent</Label>
                  <Select
                    value={filters.agent}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, agent: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select agent" />
                    </SelectTrigger>
                    <SelectContent>
                      {agentOptions.map((agent) => (
                        <SelectItem key={agent} value={agent}>
                          {agent}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-foreground">Organization</Label>
                  <Select
                    value={filters.organization}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, organization: value })
                    }
                  >
                    <SelectTrigger className="bg-background border-border">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizationOptions.map((org) => (
                        <SelectItem key={org} value={org}>
                          {org}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Duration Range Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-foreground">Duration (seconds)</Label>
                  <span className="text-sm text-muted-foreground">
                    {filters.durationRange[0]}s - {filters.durationRange[1]}s
                  </span>
                </div>
                <Slider
                  value={filters.durationRange}
                  onValueChange={(value) =>
                    onFiltersChange({
                      ...filters,
                      durationRange: value as [number, number],
                    })
                  }
                  min={0}
                  max={600}
                  step={10}
                  className="w-full"
                />
              </div>

              {/* Date Range Picker */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">Date Range</Label>
                <div className="flex flex-wrap gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal min-w-[140px]",
                          !filters.dateRange.from && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.from
                          ? format(filters.dateRange.from, "MMM dd, yyyy")
                          : "From"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.from}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            dateRange: { ...filters.dateRange, from: date },
                          })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                  <span className="flex items-center text-muted-foreground">to</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "justify-start text-left font-normal min-w-[140px]",
                          !filters.dateRange.to && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.dateRange.to
                          ? format(filters.dateRange.to, "MMM dd, yyyy")
                          : "To"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.dateRange.to}
                        onSelect={(date) =>
                          onFiltersChange({
                            ...filters,
                            dateRange: { ...filters.dateRange, to: date },
                          })
                        }
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
