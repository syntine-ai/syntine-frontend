import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SentimentBadge } from "@/components/contacts/SentimentBadge";
import { OutcomePill } from "@/components/contacts/OutcomePill";
import { ContactDetailDrawer } from "@/components/contacts/ContactDetailDrawer";
import { Plus, Search, Upload, Phone } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface Contact {
  id: number;
  name: string;
  phone: string;
  totalCalls: number;
  lastCampaign: string;
  lastOutcome: "answered" | "no_answer" | "busy" | "failed";
  sentiment: "positive" | "neutral" | "negative";
  lastContacted: string;
  firstContacted: string;
}

const contacts: Contact[] = [
  { id: 1, name: "Sarah Johnson", phone: "+1 555-0123", totalCalls: 8, lastCampaign: "Renewal Follow-up", lastOutcome: "answered", sentiment: "positive", lastContacted: "Today", firstContacted: "Nov 15" },
  { id: 2, name: "Michael Chen", phone: "+1 555-0124", totalCalls: 5, lastCampaign: "Customer Feedback", lastOutcome: "answered", sentiment: "neutral", lastContacted: "Today", firstContacted: "Nov 20" },
  { id: 3, name: "Emily Davis", phone: "+1 555-0125", totalCalls: 3, lastCampaign: "Lead Qualification", lastOutcome: "no_answer", sentiment: "neutral", lastContacted: "Yesterday", firstContacted: "Dec 1" },
  { id: 4, name: "James Wilson", phone: "+1 555-0126", totalCalls: 12, lastCampaign: "Renewal Follow-up", lastOutcome: "answered", sentiment: "positive", lastContacted: "Yesterday", firstContacted: "Oct 5" },
  { id: 5, name: "Lisa Anderson", phone: "+1 555-0127", totalCalls: 6, lastCampaign: "Customer Feedback", lastOutcome: "busy", sentiment: "neutral", lastContacted: "Dec 5", firstContacted: "Nov 10" },
  { id: 6, name: "David Brown", phone: "+1 555-0128", totalCalls: 4, lastCampaign: "Lead Qualification", lastOutcome: "answered", sentiment: "negative", lastContacted: "Dec 5", firstContacted: "Nov 25" },
  { id: 7, name: "Jennifer Taylor", phone: "+1 555-0129", totalCalls: 9, lastCampaign: "Renewal Follow-up", lastOutcome: "answered", sentiment: "positive", lastContacted: "Dec 4", firstContacted: "Sep 15" },
  { id: 8, name: "Robert Martinez", phone: "+1 555-0130", totalCalls: 2, lastCampaign: "Customer Feedback", lastOutcome: "failed", sentiment: "neutral", lastContacted: "Dec 4", firstContacted: "Dec 1" },
  { id: 9, name: "Amanda White", phone: "+1 555-0131", totalCalls: 7, lastCampaign: "Lead Qualification", lastOutcome: "answered", sentiment: "positive", lastContacted: "Dec 3", firstContacted: "Oct 20" },
  { id: 10, name: "Christopher Lee", phone: "+1 555-0132", totalCalls: 11, lastCampaign: "Renewal Follow-up", lastOutcome: "no_answer", sentiment: "neutral", lastContacted: "Dec 3", firstContacted: "Aug 10" },
  { id: 11, name: "Michelle Garcia", phone: "+1 555-0133", totalCalls: 5, lastCampaign: "Customer Feedback", lastOutcome: "answered", sentiment: "positive", lastContacted: "Dec 2", firstContacted: "Nov 5" },
  { id: 12, name: "Kevin Thompson", phone: "+1 555-0134", totalCalls: 3, lastCampaign: "Lead Qualification", lastOutcome: "answered", sentiment: "negative", lastContacted: "Dec 2", firstContacted: "Nov 28" },
];

const Contacts = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.phone.includes(searchQuery);
    const matchesCampaign = campaignFilter === "all" || contact.lastCampaign === campaignFilter;
    const matchesSentiment = sentimentFilter === "all" || contact.sentiment === sentimentFilter;
    const matchesOutcome = outcomeFilter === "all" || contact.lastOutcome === outcomeFilter;
    return matchesSearch && matchesCampaign && matchesSentiment && matchesOutcome;
  });

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setDrawerOpen(true);
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Contacts"
        subtitle="All customer contacts aggregated across your campaigns."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2">
              <Upload className="h-4 w-4" />
              Import
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      >
        {/* Filters */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-4 mb-6"
        >
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Campaign" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Campaigns</SelectItem>
              <SelectItem value="Renewal Follow-up">Renewal Follow-up</SelectItem>
              <SelectItem value="Customer Feedback">Customer Feedback</SelectItem>
              <SelectItem value="Lead Qualification">Lead Qualification</SelectItem>
            </SelectContent>
          </Select>
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
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Last Outcome" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Outcomes</SelectItem>
              <SelectItem value="answered">Answered</SelectItem>
              <SelectItem value="no_answer">No Answer</SelectItem>
              <SelectItem value="busy">Busy</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </motion.div>

        {/* Contacts Table */}
        <div className="bg-card rounded-lg shadow-card border border-border/50 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-secondary/30">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Phone</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Total Calls</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Campaign</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Outcome</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Sentiment</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Last Contacted</th>
                </tr>
              </thead>
              <tbody>
                {filteredContacts.map((contact, i) => (
                  <motion.tr
                    key={contact.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => handleContactClick(contact)}
                    className="border-b border-border/50 last:border-0 hover:bg-secondary/20 transition-colors cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {contact.name.split(" ").map((n) => n[0]).join("")}
                          </span>
                        </div>
                        <span className="font-medium text-foreground">{contact.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-foreground">
                        <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                        {contact.phone}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-foreground font-medium">{contact.totalCalls}</span>
                    </td>
                    <td className="p-4 text-foreground">{contact.lastCampaign}</td>
                    <td className="p-4">
                      <OutcomePill outcome={contact.lastOutcome} />
                    </td>
                    <td className="p-4">
                      <SentimentBadge sentiment={contact.sentiment} />
                    </td>
                    <td className="p-4 text-muted-foreground text-sm">{contact.lastContacted}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Contact Detail Drawer */}
        <ContactDetailDrawer
          contact={selectedContact}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Contacts;
