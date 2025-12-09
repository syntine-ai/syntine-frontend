import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, AlertTriangle, Info, Copy, Clock, Server, Hash } from "lucide-react";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import type { LogEntry } from "./LogsTable";

interface LogDetailsDrawerProps {
  log: LogEntry | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const levelConfig = {
  info: {
    icon: Info,
    className: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    label: "Info",
  },
  warning: {
    icon: AlertTriangle,
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    label: "Warning",
  },
  error: {
    icon: AlertCircle,
    className: "bg-destructive/10 text-destructive border-destructive/20",
    label: "Error",
  },
};

export const LogDetailsDrawer = ({
  log,
  open,
  onOpenChange,
}: LogDetailsDrawerProps) => {
  const { toast } = useToast();

  if (!log) return null;

  const config = levelConfig[log.level];
  const LevelIcon = config.icon;

  const handleCopyRaw = () => {
    navigator.clipboard.writeText(JSON.stringify(log, null, 2));
    toast({
      title: "Copied to clipboard",
      description: "Raw log data has been copied.",
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] p-0 overflow-hidden">
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className="h-full flex flex-col"
          >
            <SheetHeader className="px-6 pt-6 pb-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <SheetTitle className="text-lg font-semibold">Log Details</SheetTitle>
                <Badge variant="outline" className={`${config.className} gap-1`}>
                  <LevelIcon className="h-3 w-3" />
                  {config.label}
                </Badge>
              </div>
            </SheetHeader>

            <ScrollArea className="flex-1 px-6 py-5">
              <div className="space-y-6">
                {/* Metadata */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Timestamp:</span>
                    <span className="font-mono text-foreground">
                      {format(log.timestamp, "MMM dd, yyyy HH:mm:ss.SSS")}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Server className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Service:</span>
                    <span className="text-foreground">{log.service}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <Hash className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Request ID:</span>
                    <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono">
                      {log.requestId}
                    </code>
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Message</h4>
                  <div className="p-3 bg-muted/50 rounded-lg border border-border/50">
                    <p className="text-sm text-foreground leading-relaxed">
                      {log.message}
                    </p>
                  </div>
                </div>

                {/* Raw JSON */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-foreground">Raw Log Data</h4>
                    <Button variant="ghost" size="sm" onClick={handleCopyRaw}>
                      <Copy className="h-3.5 w-3.5 mr-1.5" />
                      Copy
                    </Button>
                  </div>
                  <div className="relative">
                    <Textarea
                      readOnly
                      value={JSON.stringify(log, null, 2)}
                      className="font-mono text-xs h-[200px] resize-none bg-muted/30"
                    />
                  </div>
                </div>

                {/* Additional Details */}
                {Object.keys(log.details).length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Additional Details</h4>
                    <div className="space-y-2">
                      {Object.entries(log.details).map(([key, value]) => (
                        <div
                          key={key}
                          className="flex items-start justify-between text-sm p-2 bg-muted/30 rounded"
                        >
                          <span className="text-muted-foreground">{key}</span>
                          <span className="text-foreground font-mono text-xs">
                            {typeof value === "object"
                              ? JSON.stringify(value)
                              : String(value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </motion.div>
        </AnimatePresence>
      </SheetContent>
    </Sheet>
  );
};
