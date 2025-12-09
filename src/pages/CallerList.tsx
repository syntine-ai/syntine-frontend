import { useState } from "react";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, ArrowLeft, Download, User } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface Caller {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  lastContacted: string;
  totalCalls: number;
  lastSentiment: "positive" | "neutral" | "negative" | null;
}

const mockCallers: Caller[] = [
  { id: "1", name: "John Smith", phone: "+1 555-0123", tags: ["VIP", "Renewal"], lastContacted: "Today", totalCalls: 5, lastSentiment: "positive" },
  { id: "2", name: "Sarah Johnson", phone: "+1 555-0456", tags: ["Lead"], lastContacted: "Yesterday", totalCalls: 3, lastSentiment: "neutral" },
  { id: "3", name: "Mike Brown", phone: "+1 555-0789", tags: ["VIP"], lastContacted: "2 days ago", totalCalls: 8, lastSentiment: "positive" },
  { id: "4", name: "Emily Davis", phone: "+1 555-0321", tags: ["Churned"], lastContacted: "1 week ago", totalCalls: 2, lastSentiment: "negative" },
  { id: "5", name: "Chris Wilson", phone: "+1 555-0654", tags: ["New", "Lead"], lastContacted: "3 days ago", totalCalls: 1, lastSentiment: null },
  { id: "6", name: "Lisa Anderson", phone: "+1 555-0987", tags: ["Renewal"], lastContacted: "Today", totalCalls: 4, lastSentiment: "positive" },
  { id: "7", name: "David Lee", phone: "+1 555-0147", tags: ["VIP", "Enterprise"], lastContacted: "Yesterday", totalCalls: 12, lastSentiment: "neutral" },
  { id: "8", name: "Amy Chen", phone: "+1 555-0258", tags: ["Lead"], lastContacted: "4 days ago", totalCalls: 2, lastSentiment: "positive" },
  { id: "9", name: "Tom Harris", phone: "+1 555-0369", tags: ["Churned"], lastContacted: "2 weeks ago", totalCalls: 6, lastSentiment: "negative" },
  { id: "10", name: "Rachel Green", phone: "+1 555-0741", tags: ["New"], lastContacted: "Today", totalCalls: 1, lastSentiment: "neutral" },
];

const sentimentConfig = {
  positive: { label: "Positive", className: "bg-success/15 text-success" },
  neutral: { label: "Neutral", className: "bg-warning/15 text-warning" },
  negative: { label: "Negative", className: "bg-destructive/15 text-destructive" },
};

const tagColors: Record<string, string> = {
  VIP: "bg-primary/15 text-primary border-primary/30",
  Lead: "bg-success/15 text-success border-success/30",
  New: "bg-info/15 text-info border-info/30",
  Renewal: "bg-warning/15 text-warning border-warning/30",
  Churned: "bg-destructive/15 text-destructive border-destructive/30",
  Enterprise: "bg-primary/15 text-primary border-primary/30",
};

const CallerList = () => {
  const [search, setSearch] = useState("");

  const filteredCallers = mockCallers.filter((caller) => {
    if (search && !caller.name.toLowerCase().includes(search.toLowerCase()) && !caller.phone.includes(search)) {
      return false;
    }
    return true;
  });

  return (
    <OrgAppShell>
      <PageContainer
        title="Caller List"
        subtitle="All contacts and their call history"
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

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone number..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Table */}
          <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Tags</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Last Contacted</TableHead>
                  <TableHead className="text-muted-foreground font-medium text-right">Total Calls</TableHead>
                  <TableHead className="text-muted-foreground font-medium">Last Sentiment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCallers.map((caller, index) => (
                  <motion.tr
                    key={caller.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="border-border/50 hover:bg-muted/30 cursor-pointer"
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium text-foreground">{caller.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{caller.phone}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {caller.tags.map((tag) => (
                          <Badge
                            key={tag}
                            variant="outline"
                            className={cn("text-[10px]", tagColors[tag] || "bg-muted text-muted-foreground")}
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{caller.lastContacted}</TableCell>
                    <TableCell className="text-right font-medium text-foreground">{caller.totalCalls}</TableCell>
                    <TableCell>
                      {caller.lastSentiment ? (
                        <Badge variant="secondary" className={sentimentConfig[caller.lastSentiment].className}>
                          {sentimentConfig[caller.lastSentiment].label}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </motion.tr>
                ))}
              </TableBody>
            </Table>
          </div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallerList;
