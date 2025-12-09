import { useState } from "react";
import { motion } from "framer-motion";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  AlertCircle,
  AlertTriangle,
  Info,
  CheckCircle,
} from "lucide-react";
import { format } from "date-fns";

export interface AdminLogEntry {
  id: string;
  timestamp: Date;
  level: "info" | "warning" | "error" | "success";
  service: string;
  message: string;
  requestId: string;
  orgId?: string;
  details: Record<string, unknown>;
}

interface AdminLogsTableProps {
  logs: AdminLogEntry[];
  onViewDetails: (log: AdminLogEntry) => void;
  compact?: boolean;
}

const levelConfig = {
  info: {
    icon: Info,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  },
  error: {
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
  },
  success: {
    icon: CheckCircle,
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  },
};

const services = ["All Services", "Agent", "Dialer", "DB", "Worker", "API", "Auth"];
const levels = ["All Levels", "Info", "Warning", "Error", "Success"];

export const AdminLogsTable = ({
  logs,
  onViewDetails,
  compact = false,
}: AdminLogsTableProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("All Levels");
  const [selectedService, setSelectedService] = useState("All Services");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = compact ? 5 : 10;

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.requestId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === "All Levels" ||
      log.level.toLowerCase() === selectedLevel.toLowerCase();
    const matchesService =
      selectedService === "All Services" || log.service === selectedService;
    return matchesSearch && matchesLevel && matchesService;
  });

  const totalPages = Math.ceil(filteredLogs.length / perPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * perPage,
    currentPage * perPage
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      {!compact && (
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              {levels.map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedService} onValueChange={setSelectedService}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Service" />
            </SelectTrigger>
            <SelectContent>
              {services.map((service) => (
                <SelectItem key={service} value={service}>
                  {service}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30 hover:bg-muted/30">
              <TableHead className="w-[150px]">Timestamp</TableHead>
              <TableHead className="w-[90px]">Level</TableHead>
              <TableHead className="w-[100px]">Service</TableHead>
              <TableHead>Message</TableHead>
              <TableHead className="w-[70px] text-right">Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedLogs.map((log, index) => {
              const config = levelConfig[log.level];
              const LevelIcon = config.icon;

              return (
                <motion.tr
                  key={log.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className="group hover:bg-muted/30 cursor-pointer transition-colors"
                  onClick={() => onViewDetails(log)}
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {format(log.timestamp, "MMM dd, HH:mm:ss")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${config.className} gap-1`}>
                      <LevelIcon className="h-3 w-3" />
                      {log.level}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{log.service}</TableCell>
                  <TableCell className="text-sm text-foreground max-w-[280px] truncate">
                    {log.message}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(log);
                      }}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </motion.tr>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {!compact && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(currentPage - 1) * perPage + 1}–
            {Math.min(currentPage * perPage, filteredLogs.length)} of{" "}
            {filteredLogs.length} logs
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-3">
              {currentPage} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
