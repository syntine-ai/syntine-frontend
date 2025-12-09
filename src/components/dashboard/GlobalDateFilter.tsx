import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type DatePreset = "today" | "7d" | "30d" | "90d" | "year" | "custom";

interface GlobalDateFilterProps {
  value: DatePreset;
  onChange: (value: DatePreset) => void;
  customRange?: { from: Date; to: Date };
  onCustomRangeChange?: (range: { from: Date; to: Date }) => void;
  className?: string;
}

const presets: { value: DatePreset; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d", label: "Last 7 days" },
  { value: "30d", label: "Last 30 days" },
  { value: "90d", label: "Last 90 days" },
  { value: "year", label: "This year" },
  { value: "custom", label: "Custom range" },
];

export function GlobalDateFilter({
  value,
  onChange,
  customRange,
  onCustomRangeChange,
  className,
}: GlobalDateFilterProps) {
  const [dateFrom, setDateFrom] = useState<Date | undefined>(customRange?.from);
  const [dateTo, setDateTo] = useState<Date | undefined>(customRange?.to);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  const selectedLabel = presets.find((p) => p.value === value)?.label || "Select range";

  const handlePresetChange = (preset: DatePreset) => {
    onChange(preset);
    if (preset !== "custom") {
      setIsCalendarOpen(false);
    }
  };

  const handleDateSelect = (date: Date | undefined, type: "from" | "to") => {
    if (type === "from") {
      setDateFrom(date);
    } else {
      setDateTo(date);
    }

    if (dateFrom && dateTo && onCustomRangeChange) {
      onCustomRangeChange({
        from: type === "from" ? date! : dateFrom,
        to: type === "to" ? date! : dateTo,
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select value={value} onValueChange={(v) => handlePresetChange(v as DatePreset)}>
        <SelectTrigger className="w-[160px] h-9 bg-card border-border/50">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <SelectValue placeholder="Select range" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {presets.map((preset) => (
            <SelectItem key={preset.value} value={preset.value}>
              {preset.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {value === "custom" && (
        <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 h-9 bg-card border-border/50"
            >
              {dateFrom && dateTo ? (
                <>
                  {format(dateFrom, "MMM d")} - {format(dateTo, "MMM d")}
                </>
              ) : (
                "Pick dates"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <div className="flex gap-2 p-3">
              <div>
                <p className="text-xs text-muted-foreground mb-2">From</p>
                <CalendarComponent
                  mode="single"
                  selected={dateFrom}
                  onSelect={(d) => handleDateSelect(d, "from")}
                  className="pointer-events-auto"
                />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">To</p>
                <CalendarComponent
                  mode="single"
                  selected={dateTo}
                  onSelect={(d) => handleDateSelect(d, "to")}
                  className="pointer-events-auto"
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
