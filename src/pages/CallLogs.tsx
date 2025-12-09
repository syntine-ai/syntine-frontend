import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, FileText, ArrowLeft, Download, PhoneOff } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CallLog {
  id: string;
  time: string;
  caller: string;
  campaign: string;
  agent: string;
  duration: string;
  outcome: "answered" | "no_answer" | "busy" | "failed";
  sentiment: "positive" | "neutral" | "negative" | null;
  transcript?: string;
}

const mockLogs: CallLog[] = [
  { id: "1", time: "Today 3:45 PM", caller: "+1 555-0123", campaign: "Renewal Q4", agent: "Renewal Assistant", duration: "4:23", outcome: "answered", sentiment: "positive", transcript: "Agent: Hello, this is Syntine calling about your renewal...\nCustomer: Oh hi, yes I was expecting this call...\nAgent: Great! I wanted to discuss your options..." },
  { id: "2", time: "Today 3:42 PM", caller: "+1 555-0456", campaign: "Lead Qual", agent: "Lead Qualifier", duration: "2:45", outcome: "answered", sentiment: "neutral", transcript: "Agent: Hi, I'm calling from Syntine...\nCustomer: What is this regarding?..." },
  { id: "3", time: "Today 3:38 PM", caller: "+1 555-0789", campaign: "Feedback", agent: "Feedback Bot", duration: "-", outcome: "no_answer", sentiment: null },
  { id: "4", time: "Today 3:35 PM", caller: "+1 555-0321", campaign: "Renewal Q4", agent: "Renewal Assistant", duration: "5:12", outcome: "answered", sentiment: "positive", transcript: "Agent: Good afternoon! This is your renewal call..." },
  { id: "5", time: "Today 3:30 PM", caller: "+1 555-0654", campaign: "Lead Qual", agent: "Lead Qualifier", duration: "-", outcome: "failed", sentiment: null },
  { id: "6", time: "Today 3:28 PM", caller: "+1 555-0987", campaign: "Renewal Q4", agent: "Renewal Assistant", duration: "3:18", outcome: "answered", sentiment: "negative", transcript: "Agent: Hello, calling about your renewal...\nCustomer: I'm not happy with the service..." },
  { id: "7", time: "Today 3:25 PM", caller: "+1 555-0147", campaign: "Feedback", agent: "Feedback Bot", duration: "2:05", outcome: "answered", sentiment: "neutral" },
  { id: "8", time: "Today 3:20 PM", caller: "+1 555-0258", campaign: "Lead Qual", agent: "Lead Qualifier", duration: "-", outcome: "busy", sentiment: null },
];

const outcomeConfig = {
  answered: { label: "Answered", className: "bg-success/15 text-success" },
  no_answer: { label: "No Answer", className: "bg-muted text-muted-foreground" },
  busy: { label: "Busy", className: "bg-warning/15 text-warning" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
};

const sentimentConfig = {
  positive: { label: "Positive", className: "bg-success/15 text-success" },
  neutral: { label: "Neutral", className: "bg-warning/15 text-warning" },
  negative: { label: "Negative", className: "bg-destructive/15 text-destructive" },
};

const CallLogs = () => {
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const filteredLogs = mockLogs.filter((log) => {
    if (search && !log.caller.includes(search) && !log.id.includes(search)) return false;
    if (sentimentFilter !== "all" && log.sentiment !== sentimentFilter) return false;
    if (outcomeFilter !== "all" && log.outcome !== outcomeFilter) return false;
    if (campaignFilter !== "all" && !log.campaign.toLowerCase().includes(campaignFilter.toLowerCase())) return false;
    return true;
  });

  const clearFilters = () => {
    setSearch("");
    setSentimentFilter("all");
    setOutcomeFilter("all");
    setCampaignFilter("all");
  };

  const hasActiveFilters = search || sentimentFilter !== "all" || outcomeFilter !== "all" || campaignFilter !== "all";

  return (
    <OrgAppShell>
      <PageContainer
        title="Call Logs"
        subtitle="Detailed log of all calls with transcripts"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="ghost" asChild>
              <Link to="/app/calls">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Analytics
              </Link>
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by caller or call ID..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiment</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="answered">Answered</SelectItem>
                <SelectItem value="no_answer">No Answer</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="renewal">Renewal Q4</SelectItem>
                <SelectItem value="lead">Lead Qual</SelectItem>
                <SelectItem value="feedback">Feedback</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Content */}
          {isLoading ? (
            <SkeletonTable rows={8} columns={8} />
          ) : filteredLogs.length === 0 ? (
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
            /* Table */
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Caller</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Campaign</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Agent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Outcome</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Sentiment</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log, index) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-border/50 hover:bg-muted/30"
                    >
                      <TableCell className="text-muted-foreground">{log.time}</TableCell>
                      <TableCell className="font-medium text-foreground">{log.caller}</TableCell>
                      <TableCell className="text-muted-foreground">{log.campaign}</TableCell>
                      <TableCell className="text-muted-foreground">{log.agent}</TableCell>
                      <TableCell className="text-foreground">{log.duration}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className={outcomeConfig[log.outcome].className}>
                          {outcomeConfig[log.outcome].label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.sentiment ? (
                          <Badge variant="secondary" className={sentimentConfig[log.sentiment].className}>
                            {sentimentConfig[log.sentiment].label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {log.transcript && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                          >
                            <FileText className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Transcript Dialog */}
        <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Call Transcript</DialogTitle>
              <DialogDescription>
                {selectedLog?.caller} • {selectedLog?.time}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 bg-secondary/30 rounded-lg">
              <pre className="text-sm text-foreground whitespace-pre-wrap font-mono">
                {selectedLog?.transcript}
              </pre>
            </div>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallLogs;
