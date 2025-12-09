import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CallOutcomePill } from "./CallOutcomePill";
import { CallEventTimeline } from "./CallEventTimeline";
import { TranscriptViewer } from "./TranscriptViewer";
import { SentimentBadge } from "@/components/contacts/SentimentBadge";
import { Phone, User, Megaphone, Bot } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

interface CallDetailDrawerProps {
  call: CallLog | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CallDetailDrawer({ call, open, onOpenChange }: CallDetailDrawerProps) {
  const [note, setNote] = useState("");

  const handleSaveNote = () => {
    if (note.trim()) {
      toast.success("Note saved", {
        description: "Your analyst note has been added to this call.",
      });
      setNote("");
    }
  };

  if (!call) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[480px] sm:max-w-[480px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Call Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Caller Information */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-foreground">Caller Information</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Name</p>
                  <p className="text-sm font-medium text-foreground">{call.caller}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Phone</p>
                  <p className="text-sm font-medium text-foreground">{call.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <Megaphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Campaign</p>
                  <p className="text-sm font-medium text-foreground">{call.campaign}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
                <Bot className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Agent</p>
                  <p className="text-sm font-medium text-foreground">{call.agent}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Outcome & Sentiment */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-foreground">Outcome & Sentiment</h4>
            <div className="flex items-center gap-3">
              <CallOutcomePill outcome={call.outcome} />
              <SentimentBadge sentiment={call.sentiment} />
              <span className="text-sm text-muted-foreground">Duration: {call.duration}</span>
            </div>
          </motion.div>

          {/* Call Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-foreground">Call Timeline</h4>
            <CallEventTimeline />
          </motion.div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-foreground">Transcript</h4>
            <TranscriptViewer />
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold">Analyst Notes</Label>
            <Textarea
              placeholder="Add analyst notes here..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[100px]"
            />
            <Button size="sm" onClick={handleSaveNote} disabled={!note.trim()}>
              Save Note
            </Button>
          </motion.div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
