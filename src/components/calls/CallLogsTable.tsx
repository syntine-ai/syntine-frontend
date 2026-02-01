import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CallLogEntry {
  id: string;
  caller: string;
  fromNumber: string | null;
  toNumber: string | null;
  callType: "inbound" | "outbound" | "webcall";
  status: "answered" | "ended" | "missed" | "failed";
  duration: string | null;
  agent: string;
  startedAt: string;
  rawDate?: string | null;
}

interface CallLogsTableProps {
  logs: CallLogEntry[];
  sortColumn: string | null;
  sortDirection: "asc" | "desc";
  onSort: (column: string) => void;
}

const statusConfig = {
  answered: { label: "Answered", className: "bg-success/15 text-success border-success/30" },
  ended: { label: "Ended", className: "bg-muted text-muted-foreground border-border" },
  missed: { label: "Missed", className: "bg-warning/15 text-warning border-warning/30" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const callTypeConfig = {
  inbound: { label: "Inbound", className: "bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30" },
  outbound: { label: "Outbound", className: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30" },
  webcall: { label: "Web Call", className: "bg-violet-500/15 text-violet-600 dark:text-violet-400 border-violet-500/30" },
};

export function CallLogsTable({
  logs,
  sortColumn,
  sortDirection,
  onSort,
}: CallLogsTableProps) {
  const navigate = useNavigate();

  const SortableHeader = ({
    column,
    label,
  }: {
    column: string;
    label: string;
  }) => (
    <TableHead
      className="text-muted-foreground font-medium cursor-pointer hover:text-foreground transition-colors"
      onClick={() => onSort(column)}
    >
      <div className="flex items-center gap-1">
        {label}
        <ArrowUpDown
          className={cn(
            "h-3.5 w-3.5 transition-colors",
            sortColumn === column ? "text-primary" : "text-muted-foreground/50"
          )}
        />
      </div>
    </TableHead>
  );

  return (
    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="border-border/50 hover:bg-transparent">
            <TableHead className="text-muted-foreground font-medium">Caller</TableHead>
            <TableHead className="text-muted-foreground font-medium">Type</TableHead>
            <TableHead className="text-muted-foreground font-medium">From → To</TableHead>
            <TableHead className="text-muted-foreground font-medium">Status</TableHead>
            <SortableHeader column="duration" label="Duration" />
            <TableHead className="text-muted-foreground font-medium">Agent</TableHead>
            <SortableHeader column="startedAt" label="Started At" />
            <TableHead className="text-muted-foreground font-medium w-[100px]">Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log, index) => (
            <motion.tr
              key={log.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className="border-border/50 hover:bg-muted/30 cursor-pointer transition-colors"
              onClick={() => navigate(`/calls/${log.id}`)}
            >
              <TableCell className="font-medium text-foreground">{log.caller}</TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("font-medium", callTypeConfig[log.callType].className)}
                >
                  {callTypeConfig[log.callType].label}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-sm">
                <span className="text-foreground">{log.fromNumber || "—"}</span>
                <span className="mx-1.5 text-muted-foreground/50">→</span>
                <span className="text-foreground">{log.toNumber || "—"}</span>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn("font-medium", statusConfig[log.status].className)}
                >
                  {statusConfig[log.status].label}
                </Badge>
              </TableCell>
              <TableCell className="text-foreground">
                {log.duration || "N/A"}
              </TableCell>
              <TableCell className="text-muted-foreground">{log.agent}</TableCell>
              <TableCell className="text-muted-foreground">{log.startedAt}</TableCell>
              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/calls/${log.id}`);
                  }}
                  className="gap-1 text-muted-foreground hover:text-primary"
                >
                  <ExternalLink className="h-4 w-4" />
                  View
                </Button>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
