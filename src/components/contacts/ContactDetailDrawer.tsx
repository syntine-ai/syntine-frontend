import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ContactInfoCard } from "./ContactInfoCard";
import { ContactTimeline } from "./ContactTimeline";
import { Star, Ban, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

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

interface ContactDetailDrawerProps {
  contact: Contact | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ContactDetailDrawer({ contact, open, onOpenChange }: ContactDetailDrawerProps) {
  const [note, setNote] = useState("");

  const handleSaveNote = () => {
    if (note.trim()) {
      toast.success("Note saved", {
        description: "Your note has been added to this contact.",
      });
      setNote("");
    }
  };

  const handleMarkPriority = () => {
    toast.success("Contact marked as priority", {
      description: `${contact?.name} will be prioritized in campaigns.`,
    });
  };

  const handleExclude = () => {
    toast.success("Contact excluded", {
      description: `${contact?.name} will be excluded from future campaigns.`,
    });
  };

  if (!contact) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Contact Details</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Contact Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <ContactInfoCard
              name={contact.name}
              phone={contact.phone}
              totalCalls={contact.totalCalls}
              firstContacted={contact.firstContacted}
              lastContacted={contact.lastContacted}
            />
          </motion.div>

          {/* Call Timeline */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-foreground mb-4">Call Timeline</h4>
            <ContactTimeline />
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h4 className="text-sm font-semibold text-foreground">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleMarkPriority}>
                <Star className="h-3.5 w-3.5" />
                Mark as Priority
              </Button>
              <Button variant="destructive" size="sm" className="gap-1.5" onClick={handleExclude}>
                <Ban className="h-3.5 w-3.5" />
                Exclude
              </Button>
              <Button variant="secondary" size="sm" className="gap-1.5">
                <Pencil className="h-3.5 w-3.5" />
                Edit Contact
              </Button>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-3"
          >
            <Label className="text-sm font-semibold">Notes</Label>
            <Textarea
              placeholder="Add a note..."
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
