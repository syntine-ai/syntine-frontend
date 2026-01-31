import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Phone, Mail, Tag, Pencil, PhoneCall } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { useContacts } from "@/hooks/useContacts";

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
    dbId?: string;
  } | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: () => void;
}

interface CallHistoryItem {
  id: string;
  date: string;
  campaign: string;
  duration: string;
  sentiment: SentimentType;
  outcome: OutcomeType;
}

interface ContactList {
  id: string;
  name: string;
  count: number;
}

interface AvailableList {
  id: string;
  name: string;
}

export function ContactDetailDrawerNew({
  contact,
  open,
  onOpenChange,
  onEdit,
}: ContactDetailDrawerProps) {
  const { contactLists: allLists, assignToList, removeFromList } = useContacts();
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);
  const [doNotCall, setDoNotCall] = useState(contact?.doNotCall || false);
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([]);
  const [contactLists, setContactLists] = useState<ContactList[]>([]);
  const [availableLists, setAvailableLists] = useState<AvailableList[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedListToAssign, setSelectedListToAssign] = useState("");

  // Fetch call history and set up lists
  useEffect(() => {
    const fetchContactData = async () => {
      if (!contact?.dbId || !open) return;

      setIsLoading(true);
      try {
        // Fetch call history from actual calls table
        const { data: calls, error: callsError } = await supabase
          .from("calls")
          .select(`
            id,
            outcome,
            sentiment,
            duration_seconds,
            created_at,
            campaigns:campaign_id(name)
          `)
          .eq("contact_id", contact.dbId)
          .order("created_at", { ascending: false })
          .limit(5);

        if (!callsError && calls) {
          const formattedCalls: CallHistoryItem[] = calls.map((call) => {
            const duration = call.duration_seconds
              ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, "0")}`
              : "0:00";

            return {
              id: call.id,
              date: call.created_at ? format(new Date(call.created_at), "MMM d, yyyy") : "Unknown",
              campaign: (call.campaigns as any)?.name || "Direct Call",
              duration,
              sentiment: (call.sentiment as SentimentType) || "not_analyzed",
              outcome: (call.outcome as OutcomeType) || "not_called",
            };
          });
          setCallHistory(formattedCalls);
        }

        // Use demo contact lists from hook
        const memberLists = allLists.slice(0, 2).map((l) => ({
          id: l.id,
          name: l.name,
          count: l.contactCount,
        }));
        setContactLists(memberLists);

        // Available lists (not already assigned)
        const assignedIds = new Set(memberLists.map((l) => l.id));
        const available = allLists
          .filter((l) => !assignedIds.has(l.id))
          .map((l) => ({ id: l.id, name: l.name }));
        setAvailableLists(available);
      } catch (err) {
        console.error("Error fetching contact data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [contact?.dbId, open, allLists]);

  // Reset state when contact changes
  useEffect(() => {
    if (contact) {
      setDoNotCall(contact.doNotCall || false);
      setSavedNotes([]);
    }
  }, [contact]);

  const handleSaveNote = async () => {
    if (!note.trim() || !contact?.dbId) return;

    setIsSavingNote(true);
    try {
      const newNotes = [...savedNotes, note.trim()];
      setSavedNotes(newNotes);
      setNote("");
      toast.success("Note saved");
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDeleteNote = async (index: number) => {
    if (!contact?.dbId) return;

    try {
      const newNotes = savedNotes.filter((_, i) => i !== index);
      setSavedNotes(newNotes);
      toast.success("Note deleted");
    } catch (err) {
      console.error("Error deleting note:", err);
      toast.error("Failed to delete note");
    }
  };

  const handleDoNotCallToggle = async (checked: boolean) => {
    if (!contact?.dbId) return;

    try {
      setDoNotCall(checked);
      toast.success(checked ? "Marked as Do Not Call" : "Removed Do Not Call flag");
    } catch (err) {
      console.error("Error updating do not call:", err);
      toast.error("Failed to update");
      setDoNotCall(!checked);
    }
  };

  const handleAssignToList = async () => {
    if (!selectedListToAssign || !contact?.dbId) return;

    const success = await assignToList(contact.dbId, selectedListToAssign);
    if (success) {
      const list = availableLists.find((l) => l.id === selectedListToAssign);
      if (list) {
        setContactLists((prev) => [...prev, { id: list.id, name: list.name, count: 1 }]);
        setAvailableLists((prev) => prev.filter((l) => l.id !== selectedListToAssign));
      }
      setIsAssignDialogOpen(false);
      setSelectedListToAssign("");
    }
  };

  const handleRemoveFromList = async (listId: string) => {
    if (!contact?.dbId) return;

    const success = await removeFromList(contact.dbId, listId);
    if (success) {
      const list = contactLists.find((l) => l.id === listId);
      if (list) {
        setAvailableLists((prev) => [...prev, { id: list.id, name: list.name }]);
        setContactLists((prev) => prev.filter((l) => l.id !== listId));
      }
    }
  };

  if (!contact) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="pb-6">
            <div className="flex items-center justify-between">
              <SheetTitle className="text-xl font-semibold">{contact.name}</SheetTitle>
              {onEdit && (
                <Button variant="ghost" size="icon" onClick={onEdit}>
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </div>
          </SheetHeader>

          <div className="space-y-6">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="flex items-center gap-3 text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{contact.phone}</span>
              </div>
              {contact.email && (
                <div className="flex items-center gap-3 text-foreground">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.tags && contact.tags.length > 0 && (
                <div className="flex items-center gap-3">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <div className="flex flex-wrap gap-2">
                    {contact.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            <Separator />

            {/* Status Badges */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="flex flex-wrap gap-3"
            >
              <SentimentBadge sentiment={contact.sentiment} />
              <OutcomePill outcome={contact.outcome} />
              {contact.callCount !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <PhoneCall className="h-3 w-3" />
                  {contact.callCount} calls
                </Badge>
              )}
            </motion.div>

            <Separator />

            {/* Do Not Call Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center justify-between"
            >
              <div>
                <Label className="text-sm font-medium">Do Not Call</Label>
                <p className="text-xs text-muted-foreground">
                  Exclude this contact from all campaigns
                </p>
              </div>
              <Switch
                checked={doNotCall}
                onCheckedChange={handleDoNotCallToggle}
              />
            </motion.div>

            <Separator />

            {/* Contact Lists */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Contact Lists</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAssignDialogOpen(true)}
                  disabled={availableLists.length === 0}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add to List
                </Button>
              </div>
              {contactLists.length === 0 ? (
                <p className="text-sm text-muted-foreground">Not in any lists</p>
              ) : (
                <div className="space-y-2">
                  {contactLists.map((list) => (
                    <div
                      key={list.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <span className="text-sm font-medium">{list.name}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleRemoveFromList(list.id)}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <Separator />

            {/* Call History */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium">Call History</Label>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : callHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground">No call history</p>
              ) : (
                <div className="space-y-2">
                  {callHistory.map((call) => (
                    <div
                      key={call.id}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{call.campaign}</span>
                        <span className="text-xs text-muted-foreground">{call.date}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <OutcomePill outcome={call.outcome} />
                        <SentimentBadge sentiment={call.sentiment} />
                        <span className="text-xs text-muted-foreground ml-auto">
                          {call.duration}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <Separator />

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium">Notes</Label>
              {savedNotes.length > 0 && (
                <div className="space-y-2 mb-3">
                  {savedNotes.map((n, i) => (
                    <div
                      key={i}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50 flex items-start justify-between gap-2"
                    >
                      <p className="text-sm text-foreground">{n}</p>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 shrink-0"
                        onClick={() => handleDeleteNote(i)}
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <Textarea
                placeholder="Add a note..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px]"
              />
              <Button
                onClick={handleSaveNote}
                disabled={!note.trim() || isSavingNote}
                className="w-full"
              >
                {isSavingNote ? "Saving..." : "Save Note"}
              </Button>
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign to List Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add to Contact List</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Select value={selectedListToAssign} onValueChange={setSelectedListToAssign}>
              <SelectTrigger>
                <SelectValue placeholder="Select a list" />
              </SelectTrigger>
              <SelectContent>
                {availableLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignToList} disabled={!selectedListToAssign}>
              Add to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
