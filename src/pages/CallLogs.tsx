import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Search, FileText, ArrowLeft, Download, PhoneOff, User, Bot, PhoneIncoming, PhoneOutgoing, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCallLogs } from "@/hooks/useCallLogs";
import { useCampaigns } from "@/hooks/useCampaigns";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CallOutcome = Database["public"]["Enums"]["call_outcome"];
type CallSentiment = Database["public"]["Enums"]["call_sentiment"];
type CallTranscript = Database["public"]["Tables"]["call_transcripts"]["Row"];

const outcomeConfig: Record<CallOutcome, { label: string; className: string }> = {
  answered: { label: "Answered", className: "bg-success/15 text-success" },
  no_answer: { label: "No Answer", className: "bg-muted text-muted-foreground" },
  busy: { label: "Busy", className: "bg-warning/15 text-warning" },
  failed: { label: "Failed", className: "bg-destructive/15 text-destructive" },
  voicemail: { label: "Voicemail", className: "bg-muted text-muted-foreground" },
};

const sentimentConfig: Record<CallSentiment, { label: string; className: string }> = {
  positive: { label: "Positive", className: "bg-success/15 text-success" },
  neutral: { label: "Neutral", className: "bg-warning/15 text-warning" },
  negative: { label: "Negative", className: "bg-destructive/15 text-destructive" },
};

const CallLogs = () => {
  const navigate = useNavigate();
  const { calls, isLoading, fetchTranscript } = useCallLogs();
  const { campaigns } = useCampaigns();
  
  const [search, setSearch] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);
  const [transcripts, setTranscripts] = useState<CallTranscript[]>([]);
  const [loadingTranscript, setLoadingTranscript] = useState(false);

  // Get unique campaigns for filter
  const campaignOptions = useMemo(() => {
    const uniqueCampaigns = new Map<string, string>();
    calls.forEach((call) => {
      if (call.campaign_id && call.campaign_name) {
        uniqueCampaigns.set(call.campaign_id, call.campaign_name);
      }
    });
    return Array.from(uniqueCampaigns.entries()).map(([id, name]) => ({ id, name }));
  }, [calls]);

  const filteredLogs = useMemo(() => {
    return calls.filter((call) => {
      if (search) {
        const searchLower = search.toLowerCase();
        const matchesFromNumber = call.from_number?.toLowerCase().includes(searchLower);
        const matchesToNumber = call.to_number?.toLowerCase().includes(searchLower);
        const matchesContact = call.contact_name?.toLowerCase().includes(searchLower);
        const matchesId = call.id.toLowerCase().includes(searchLower);
        if (!matchesFromNumber && !matchesToNumber && !matchesContact && !matchesId) return false;
      }
      if (sentimentFilter !== "all" && call.sentiment !== sentimentFilter) return false;
      if (outcomeFilter !== "all" && call.outcome !== outcomeFilter) return false;
      if (campaignFilter !== "all" && call.campaign_id !== campaignFilter) return false;
      return true;
    });
  }, [calls, search, sentimentFilter, outcomeFilter, campaignFilter]);

  const clearFilters = () => {
    setSearch("");
    setSentimentFilter("all");
    setOutcomeFilter("all");
    setCampaignFilter("all");
  };

  const hasActiveFilters = search || sentimentFilter !== "all" || outcomeFilter !== "all" || campaignFilter !== "all";

  const handleViewTranscript = async (callId: string) => {
    setSelectedCallId(callId);
    setLoadingTranscript(true);
    const data = await fetchTranscript(callId);
    setTranscripts(data);
    setLoadingTranscript(false);
  };

  const selectedCall = calls.find((c) => c.id === selectedCallId);

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "-";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: string | null) => {
    if (!date) return "-";
    return format(new Date(date), "MMM d, h:mm a");
  };

  const handleExport = () => {
    const csvContent = [
      ["Time", "Type", "From", "To", "Contact", "Campaign", "Agent", "Duration", "Outcome", "Sentiment"].join(","),
      ...filteredLogs.map((call) =>
        [
          call.created_at,
          call.call_type,
          call.from_number,
          call.to_number,
          call.contact_name,
          call.campaign_name,
          call.agent_name,
          call.duration_seconds,
          call.outcome,
          call.sentiment,
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
  };

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
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by phone or contact..."
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
                <SelectItem value="voicemail">Voicemail</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                {campaignOptions.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
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
            <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Time</TableHead>
                    <TableHead className="text-muted-foreground font-medium">From → To</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Contact</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Campaign</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Agent</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Duration</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Outcome</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Sentiment</TableHead>
                    <TableHead className="text-muted-foreground font-medium w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((call, index) => (
                    <motion.tr
                      key={call.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      className="border-border/50 hover:bg-muted/30 cursor-pointer"
                      onClick={() => navigate(`/app/calls/${call.id}`)}
                    >
                      <TableCell className="text-muted-foreground">
                        {formatTime(call.created_at)}
                      </TableCell>
                      <TableCell className="font-mono text-sm text-foreground">
                        <span>{call.from_number || "—"}</span>
                        <span className="mx-1 text-muted-foreground/50">→</span>
                        <span>{call.to_number || "—"}</span>
                      </TableCell>
                      <TableCell className="text-foreground">
                        {call.contact_name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.campaign_name || "-"}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {call.agent_name || "-"}
                      </TableCell>
                      <TableCell className="text-foreground">
                        {formatDuration(call.duration_seconds)}
                      </TableCell>
                      <TableCell>
                        {call.outcome ? (
                          <Badge variant="secondary" className={outcomeConfig[call.outcome].className}>
                            {outcomeConfig[call.outcome].label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {call.sentiment ? (
                          <Badge variant="secondary" className={sentimentConfig[call.sentiment].className}>
                            {sentimentConfig[call.sentiment].label}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewTranscript(call.id);
                          }}
                        >
                          <FileText className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </motion.div>

        {/* Transcript Dialog */}
        <Dialog open={!!selectedCallId} onOpenChange={() => setSelectedCallId(null)}>
          <DialogContent className="max-w-2xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle>Call Transcript</DialogTitle>
              <DialogDescription>
                {selectedCall?.from_number || selectedCall?.to_number} • {selectedCall?.created_at && formatTime(selectedCall.created_at)}
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[400px] mt-4">
              {loadingTranscript ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
              ) : transcripts.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No transcript available for this call
                </p>
              ) : (
                <div className="space-y-4 pr-4">
                  {transcripts.map((entry) => (
                    <div
                      key={entry.id}
                      className={cn(
                        "flex gap-3 p-3 rounded-lg",
                        entry.speaker === "agent"
                          ? "bg-primary/5 ml-4"
                          : entry.speaker === "caller"
                          ? "bg-secondary/50 mr-4"
                          : "bg-muted/30 text-center italic"
                      )}
                    >
                      {entry.speaker !== "system" && (
                        <div
                          className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                            entry.speaker === "agent" ? "bg-primary/20" : "bg-secondary"
                          )}
                        >
                          {entry.speaker === "agent" ? (
                            <Bot className="h-4 w-4 text-primary" />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        {entry.speaker !== "system" && (
                          <p className="text-xs font-medium text-muted-foreground mb-1 capitalize">
                            {entry.speaker}
                          </p>
                        )}
                        <p className="text-sm text-foreground">{entry.content}</p>
                        {entry.timestamp && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(entry.timestamp), "h:mm:ss a")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallLogs;
