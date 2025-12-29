import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Phone, Mail, Tag, Pencil, PhoneCall } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { SentimentBadge } from "./SentimentBadge";
import { OutcomePill } from "./OutcomePill";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type SentimentType = "positive" | "neutral" | "negative" | "not_analyzed";
type OutcomeType = "answered" | "no_answer" | "busy" | "failed" | "not_called";

interface ContactDetailDrawerProps {
  contact: {
    id: number;
    name: string;
    phone: string;
    email?: string;
    contactList: string;
    lastCampaign: string | null;
    lastCallDate: string | null;
    sentiment: SentimentType;
    outcome: OutcomeType;
    doNotCall?: boolean;
    tags?: string[];
    callCount?: number;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

interface CallHistoryItem {
  id: number;
  date: string;
  campaign: string;
  duration: string;
  sentiment: SentimentType;
  outcome: OutcomeType;
}

// Mock call history - empty for new contacts
const getMockCallHistory = (callCount: number = 3): CallHistoryItem[] => {
  if (callCount === 0) return [];
  const history: CallHistoryItem[] = [
    {
      id: 1,
      date: "Dec 28, 2024",
      campaign: "Sales Follow-up",
      duration: "2:34",
      sentiment: "positive" as SentimentType,
      outcome: "answered" as OutcomeType,
    },
    {
      id: 2,
      date: "Dec 20, 2024",
      campaign: "Loan Outreach",
      duration: "1:12",
      sentiment: "neutral" as SentimentType,
      outcome: "answered" as OutcomeType,
    },
    {
      id: 3,
      date: "Dec 15, 2024",
      campaign: "Product Demo",
      duration: "0:00",
      sentiment: "negative" as SentimentType,
      outcome: "no_answer" as OutcomeType,
    },
  ];
  return history.slice(0, callCount);
};

const mockLists = [
  { name: "Leads - Jan", count: 2340 },
  { name: "Hot Prospects", count: 856 },
  { name: "VIP Customers", count: 432 },
];

export function ContactDetailDrawerNew({
  contact,
  open,
  onOpenChange,
  onEdit,
}: ContactDetailDrawerProps) {
  const [note, setNote] = useState("");
  const [doNotCall, setDoNotCall] = useState(contact?.doNotCall || false);

  const callHistory = getMockCallHistory(contact?.callCount ?? 3);
  const hasCallHistory = callHistory.length > 0;

  const handleSaveNote = () => {
    if (note.trim()) {
      toast.success("Note saved", {
        description: "Your note has been added to this contact.",
      });
      setNote("");
    }
  };

  const handleDNCToggle = (checked: boolean) => {
    setDoNotCall(checked);
    toast.success(
      checked ? "Contact marked as Do Not Call" : "Do Not Call removed",
      {
        description: checked
          ? `${contact?.name} will be excluded from campaigns.`
          : `${contact?.name} can now receive calls.`,
      }
    );
  };

  const handleAssignToCampaign = () => {
    toast.info("Assign to Campaign", {
      description: "Campaign assignment would open here.",
    });
  };

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[520px] sm:max-w-[520px] overflow-y-auto bg-card border-l border-border p-0">
        <SheetHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <SheetTitle className="text-xl font-semibold text-foreground">
              Contact Details
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="p-6 space-y-6">
          {/* Contact Profile */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-background rounded-lg p-5 border border-border"
          >
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-full bg-primary/15 flex items-center justify-center shrink-0">
                <span className="text-lg font-semibold text-primary">
                  {contact.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  {contact.name}
                  {doNotCall && (
                    <span className="text-xs px-2 py-0.5 bg-destructive/15 text-destructive rounded-full">
                      DNC
                    </span>
                  )}
                </h3>
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    {contact.phone}
                  </div>
                  {contact.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {contact.email}
                    </div>
                  )}
                </div>
                {contact.tags && contact.tags.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                    <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                    {contact.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-xs px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between mt-5 pt-4 border-t border-border">
              <div className="flex items-center gap-2">
                <Switch
                  id="dnc-toggle"
                  checked={doNotCall}
                  onCheckedChange={handleDNCToggle}
                />
                <Label htmlFor="dnc-toggle" className="text-sm text-muted-foreground cursor-pointer">
                  Do Not Call
                </Label>
              </div>
            </div>
          </motion.div>

          {/* List Membership */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">List Membership</h4>
                <Badge variant="secondary" className="text-xs">
                  {mockLists.length}
                </Badge>
              </div>
              <Button variant="ghost" size="sm" className="gap-1.5 h-7 text-xs">
                <Plus className="h-3 w-3" />
                Add to List
              </Button>
            </div>
            <div className="space-y-2">
              {mockLists.map((list) => (
                <div
                  key={list.name}
                  className="flex items-center justify-between px-3 py-2.5 bg-background rounded-lg border border-border group"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground">{list.name}</span>
                    <span className="text-xs text-muted-foreground">
                      ({list.count.toLocaleString()})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </motion.div>

          <Separator className="bg-border" />

          {/* Call History Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="text-sm font-semibold text-foreground mb-4">Call History</h4>
            
            {hasCallHistory ? (
              <div className="space-y-3">
                {callHistory.map((call, index) => (
                  <div
                    key={call.id}
                    className="relative pl-6 pb-4 last:pb-0"
                  >
                    {/* Timeline line */}
                    {index < callHistory.length - 1 && (
                      <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                    )}
                    {/* Timeline dot */}
                    <div
                      className={cn(
                        "absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-card",
                        call.sentiment === "positive" ? "bg-success" : 
                        call.sentiment === "negative" ? "bg-destructive" : 
                        "bg-muted-foreground"
                      )}
                    />
                    <div className="bg-background rounded-lg p-3 border border-border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-foreground">
                          {call.campaign}
                        </span>
                        <span className="text-xs text-muted-foreground">{call.date}</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">
                          Duration: {call.duration}
                        </span>
                        <SentimentBadge sentiment={call.sentiment} />
                        <OutcomePill outcome={call.outcome} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Empty State for Call History */
              <div className="bg-background rounded-lg border border-border p-6 text-center">
                <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                  <PhoneCall className="h-6 w-6 text-muted-foreground" />
                </div>
                <h5 className="text-sm font-medium text-foreground mb-1">No Calls Yet</h5>
                <p className="text-xs text-muted-foreground mb-4">
                  This contact has not been contacted by any AI agent.
                </p>
                <Button size="sm" onClick={handleAssignToCampaign}>
                  Assign to Campaign
                </Button>
              </div>
            )}
          </motion.div>

          <Separator className="bg-border" />

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold">Notes</Label>
            <Textarea
              placeholder="Add internal notes for this contact..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px] bg-background"
            />
            <Button size="sm" onClick={handleSaveNote} disabled={!note.trim()}>
              Save Note
            </Button>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex gap-3 pt-4 border-t border-border"
          >
            <Button variant="outline" onClick={onEdit} className="flex-1 gap-2">
              <Pencil className="h-4 w-4" />
              Edit Contact
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              Assign to List
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
