import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { MultiSelectChip } from "@/components/analytics/MultiSelectChip";
import { CallOutcomePill } from "@/components/analytics/CallOutcomePill";
import { CallDetailDrawer } from "@/components/analytics/CallDetailDrawer";
import { SentimentBadge } from "@/components/contacts/SentimentBadge";
import { Phone, CheckCircle, XCircle, Clock, Smile, CalendarIcon, ChevronLeft, ChevronRight, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

interface CallLog {
  id: number;
  time: string;
  caller: string;
  phone: string;
  campaign: string;
  agent: string;
  outcome: "answered" | "no_answer" | "busy" | "failed";
  duration: string;
  sentiment: "positive" | "neutral" | "negative";
}

const callLogs: CallLog[] = [
  { id: 1, time: "2:34 PM", caller: "John Doe", phone: "+91 90827 49283", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "answered", duration: "2:58", sentiment: "positive" },
  { id: 2, time: "2:28 PM", caller: "Sarah Smith", phone: "+91 98765 43210", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "4:12", sentiment: "neutral" },
  { id: 3, time: "2:15 PM", caller: "Mike Johnson", phone: "+91 87654 32109", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "no_answer", duration: "-", sentiment: "neutral" },
  { id: 4, time: "2:10 PM", caller: "Emily Brown", phone: "+91 76543 21098", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "answered", duration: "3:45", sentiment: "positive" },
  { id: 5, time: "2:02 PM", caller: "David Wilson", phone: "+91 65432 10987", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "busy", duration: "-", sentiment: "neutral" },
  { id: 6, time: "1:55 PM", caller: "Lisa Davis", phone: "+91 54321 09876", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "answered", duration: "5:23", sentiment: "negative" },
  { id: 7, time: "1:48 PM", caller: "James Taylor", phone: "+91 43210 98765", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "failed", duration: "-", sentiment: "neutral" },
  { id: 8, time: "1:40 PM", caller: "Amanda White", phone: "+91 32109 87654", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "2:15", sentiment: "positive" },
  { id: 9, time: "1:32 PM", caller: "Robert Lee", phone: "+91 21098 76543", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "answered", duration: "4:58", sentiment: "neutral" },
  { id: 10, time: "1:25 PM", caller: "Jennifer Clark", phone: "+91 10987 65432", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "no_answer", duration: "-", sentiment: "neutral" },
  { id: 11, time: "1:18 PM", caller: "Michael Green", phone: "+91 09876 54321", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "3:30", sentiment: "positive" },
  { id: 12, time: "1:10 PM", caller: "Susan Hall", phone: "+91 98765 12340", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "answered", duration: "6:12", sentiment: "positive" },
  { id: 13, time: "1:02 PM", caller: "Chris Martin", phone: "+91 87654 01239", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "busy", duration: "-", sentiment: "neutral" },
  { id: 14, time: "12:55 PM", caller: "Nancy Adams", phone: "+91 76543 90128", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "2:45", sentiment: "neutral" },
  { id: 15, time: "12:48 PM", caller: "Kevin Wright", phone: "+91 65432 89017", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "failed", duration: "-", sentiment: "neutral" },
  { id: 16, time: "12:40 PM", caller: "Patricia King", phone: "+91 54321 78906", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "answered", duration: "4:08", sentiment: "positive" },
  { id: 17, time: "12:32 PM", caller: "Daniel Scott", phone: "+91 43210 67895", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "3:22", sentiment: "negative" },
  { id: 18, time: "12:25 PM", caller: "Barbara Hill", phone: "+91 32109 56784", campaign: "Lead Qualification", agent: "Lead Qualifier", outcome: "no_answer", duration: "-", sentiment: "neutral" },
  { id: 19, time: "12:18 PM", caller: "Thomas Baker", phone: "+91 21098 45673", campaign: "Renewal Follow-up", agent: "Sales Assistant", outcome: "answered", duration: "5:15", sentiment: "positive" },
  { id: 20, time: "12:10 PM", caller: "Sandra Young", phone: "+91 10987 34562", campaign: "Customer Feedback", agent: "Feedback Bot", outcome: "answered", duration: "2:58", sentiment: "neutral" },
];

const Analytics = () => {
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [agentFilter, setAgentFilter] = useState("all");
  const [dateRange, setDateRange] = useState<Date | undefined>(new Date());
  const [statusFilters, setStatusFilters] = useState<string[]>([]);
  const [sentimentFilters, setSentimentFilters] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCall, setSelectedCall] = useState<CallLog | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(callLogs.length / itemsPerPage);
  const paginatedLogs = callLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleViewDetails = (call: CallLog) => {
    setSelectedCall(call);
    setDrawerOpen(true);
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Analytics & Call Logs"
        subtitle="Search, filter, and analyze every interaction made by your AI calling system."
      >
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4 mb-6"
        >
          <div className="flex flex-wrap gap-4">
            <Select value={campaignFilter} onValueChange={setCampaignFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Campaigns</SelectItem>
                <SelectItem value="renewal">Renewal Follow-up</SelectItem>
                <SelectItem value="feedback">Customer Feedback</SelectItem>
                <SelectItem value="lead">Lead Qualification</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                <SelectItem value="sales">Sales Assistant</SelectItem>
                <SelectItem value="feedback">Feedback Bot</SelectItem>
                <SelectItem value="lead">Lead Qualifier</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2 min-w-[180px] justify-start">
                  <CalendarIcon className="h-4 w-4" />
                  {dateRange ? format(dateRange, "MMM d, yyyy") : "Pick a date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dateRange}
                  onSelect={setDateRange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-wrap gap-6">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Call Status</p>
              <MultiSelectChip
                options={["Answered", "No Answer", "Busy", "Failed"]}
                selected={statusFilters}
                onChange={setStatusFilters}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Sentiment</p>
              <MultiSelectChip
                options={["Positive", "Neutral", "Negative"]}
                selected={sentimentFilters}
                onChange={setSentimentFilters}
              />
            </div>
          </div>
        </motion.div>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6"
        >
          <AnalyticsSummaryCard
            title="Total Calls"
            value="1,284"
            trend={{ value: "+12.4%", isPositive: true }}
            icon={Phone}
          />
          <AnalyticsSummaryCard
            title="Answered"
            value="864"
            trend={{ value: "+9.1%", isPositive: true }}
            icon={CheckCircle}
          />
          <AnalyticsSummaryCard
            title="Failed"
            value="112"
            trend={{ value: "-2.8%", isPositive: true }}
            icon={XCircle}
          />
          <AnalyticsSummaryCard
            title="Avg Duration"
            value="2m 58s"
            trend={{ value: "-1.4%", isPositive: false }}
            icon={Clock}
          />
          <AnalyticsSummaryCard
            title="Positive Sentiment"
            value="68%"
            trend={{ value: "+5.3%", isPositive: true }}
            icon={Smile}
          />
        </motion.div>

        {/* Call Logs Table */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden"
        >
          <div className="p-4 border-b border-border">
            <h3 className="text-lg font-semibold text-foreground">Call Logs</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Time</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Caller</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Campaign</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Agent</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Outcome</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sentiment</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.map((log, i) => (
                  <motion.tr
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors"
                  >
                    <td className="p-4 text-sm text-muted-foreground">{log.time}</td>
                    <td className="p-4">
                      <div>
                        <p className="font-medium text-foreground">{log.caller}</p>
                        <p className="text-xs text-muted-foreground">{log.phone}</p>
                      </div>
                    </td>
                    <td className="p-4 text-foreground text-sm">{log.campaign}</td>
                    <td className="p-4 text-foreground text-sm">{log.agent}</td>
                    <td className="p-4">
                      <CallOutcomePill outcome={log.outcome} />
                    </td>
                    <td className="p-4 text-foreground text-sm">{log.duration}</td>
                    <td className="p-4">
                      <SentimentBadge sentiment={log.sentiment} />
                    </td>
                    <td className="p-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => handleViewDetails(log)}
                      >
                        <Eye className="h-4 w-4" />
                        Details
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 border-t border-border flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, callLogs.length)} of {callLogs.length} calls
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Call Detail Drawer */}
        <CallDetailDrawer
          call={selectedCall}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Analytics;
