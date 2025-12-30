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
import { useAuth } from "@/contexts/AuthContext";

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
  const { profile } = useAuth();
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

  // Fetch call history, list membership, notes, and available lists
  useEffect(() => {
    const fetchContactData = async () => {
      if (!contact?.dbId || !open) return;

      setIsLoading(true);
      try {
        // Fetch contact metadata for notes
        const { data: contactData, error: contactError } = await supabase
          .from("contacts")
          .select("metadata")
          .eq("id", contact.dbId)
          .single();

        if (!contactError && contactData) {
          const metadata = contactData.metadata as Record<string, any> || {};
          setSavedNotes(Array.isArray(metadata.notes) ? metadata.notes : []);
        }

        // Fetch call history
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

        // Fetch list membership
        const { data: listMembers, error: listError } = await supabase
          .from("contact_list_members")
          .select(`
            contact_list_id,
            contact_lists:contact_list_id(id, name)
          `)
          .eq("contact_id", contact.dbId);

        if (!listError && listMembers) {
          const listsWithCounts: ContactList[] = await Promise.all(
            listMembers
              .filter(m => (m.contact_lists as any)?.id)
              .map(async (m) => {
                const list = m.contact_lists as any;
                const { count } = await supabase
                  .from("contact_list_members")
                  .select("*", { count: "exact", head: true })
                  .eq("contact_list_id", list.id);

                return {
                  id: list.id,
                  name: list.name,
                  count: count || 0,
                };
              })
          );

          const uniqueLists = listsWithCounts.filter((list, index, self) =>
            index === self.findIndex(l => l.id === list.id)
          );

          setContactLists(uniqueLists);
        }

        // Fetch all available lists
        if (profile?.organization_id) {
          const { data: allLists, error: allListsError } = await supabase
            .from("contact_lists")
            .select("id, name")
            .eq("organization_id", profile.organization_id)
            .order("name");

          if (!allListsError && allLists) {
            setAvailableLists(allLists);
          }
        }

      } catch (err) {
        console.error("Error fetching contact data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContactData();
  }, [contact?.dbId, open, profile?.organization_id]);

  // Reset state when contact changes
  useEffect(() => {
    setDoNotCall(contact?.doNotCall || false);
    setNote("");
  }, [contact?.doNotCall, contact?.dbId]);

  const hasCallHistory = callHistory.length > 0;

  const handleSaveNote = async () => {
    if (!note.trim() || !contact?.dbId) return;

    setIsSavingNote(true);
    try {
      // Get current metadata
      const { data: contactData, error: fetchError } = await supabase
        .from("contacts")
        .select("metadata")
        .eq("id", contact.dbId)
        .single();

      if (fetchError) throw fetchError;

      const metadata = (contactData?.metadata as Record<string, any>) || {};
      const existingNotes = Array.isArray(metadata.notes) ? metadata.notes : [];

      // Add new note with timestamp
      const newNote = {
        text: note.trim(),
        timestamp: new Date().toISOString(),
      };
      const updatedNotes = [newNote, ...existingNotes];

      // Update contact
      const { error: updateError } = await supabase
        .from("contacts")
        .update({
          metadata: { ...metadata, notes: updatedNotes } as any,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contact.dbId);

      if (updateError) throw updateError;

      setSavedNotes(updatedNotes);
      setNote("");
      toast.success("Note saved", {
        description: "Your note has been added to this contact.",
      });
    } catch (err) {
      console.error("Error saving note:", err);
      toast.error("Failed to save note");
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleDNCToggle = async (checked: boolean) => {
    setDoNotCall(checked);

    if (contact?.dbId) {
      const { error } = await supabase
        .from("contacts")
        .update({ do_not_call: checked, updated_at: new Date().toISOString() })
        .eq("id", contact.dbId);

      if (error) {
        console.error("Error updating DNC status:", error);
        toast.error("Failed to update Do Not Call status");
        setDoNotCall(!checked);
        return;
      }
    }

    toast.success(
      checked ? "Contact marked as Do Not Call" : "Do Not Call removed",
      {
        description: checked
          ? `${contact?.name} will be excluded from campaigns.`
          : `${contact?.name} can now receive calls.`,
      }
    );
  };

  const handleRemoveFromList = async (listId: string) => {
    if (!contact?.dbId) return;

    const { error } = await supabase
      .from("contact_list_members")
      .delete()
      .eq("contact_id", contact.dbId)
      .eq("contact_list_id", listId);

    if (error) {
      console.error("Error removing from list:", error);
      toast.error("Failed to remove from list");
      return;
    }

    setContactLists(prev => prev.filter(l => l.id !== listId));
    toast.success("Removed from list");
  };

  const handleAssignToList = async () => {
    if (!contact?.dbId || !selectedListToAssign) return;

    // Check if already in list
    if (contactLists.some(l => l.id === selectedListToAssign)) {
      toast.error("Contact is already in this list");
      setIsAssignDialogOpen(false);
      return;
    }

    const { error } = await supabase
      .from("contact_list_members")
      .insert({
        contact_id: contact.dbId,
        contact_list_id: selectedListToAssign,
      });

    if (error) {
      console.error("Error assigning to list:", error);
      toast.error("Failed to assign to list");
      return;
    }

    // Add to local state
    const listInfo = availableLists.find(l => l.id === selectedListToAssign);
    if (listInfo) {
      setContactLists(prev => [...prev, { ...listInfo, count: 0 }]);
    }

    setIsAssignDialogOpen(false);
    setSelectedListToAssign("");
    toast.success("Added to list", {
      description: `${contact.name} has been added to the list.`,
    });
  };

  const handleAssignToCampaign = () => {
    toast.info("Assign to Campaign", {
      description: "Campaign assignment would open here.",
    });
  };

  if (!contact) return null;

  // Filter out lists already assigned
  const unassignedLists = availableLists.filter(
    l => !contactLists.some(cl => cl.id === l.id)
  );

  return (
    <>
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
                    {contactLists.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1.5 h-7 text-xs"
                  onClick={() => setIsAssignDialogOpen(true)}
                  disabled={unassignedLists.length === 0}
                >
                  <Plus className="h-3 w-3" />
                  Add to List
                </Button>
              </div>
              {contactLists.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-4">
                  Not a member of any lists
                </div>
              ) : (
                <div className="space-y-2">
                  {contactLists.map((list) => (
                    <div
                      key={list.id}
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
                        onClick={() => handleRemoveFromList(list.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>

            <Separator className="bg-border" />

            {/* Call History Timeline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-foreground mb-4">Call History</h4>

              {isLoading ? (
                <div className="text-center py-4 text-muted-foreground text-sm">
                  Loading call history...
                </div>
              ) : hasCallHistory ? (
                <div className="space-y-3">
                  {callHistory.map((call, index) => (
                    <div
                      key={call.id}
                      className="relative pl-6 pb-4 last:pb-0"
                    >
                      {index < callHistory.length - 1 && (
                        <div className="absolute left-[7px] top-3 bottom-0 w-px bg-border" />
                      )}
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

              {/* Display saved notes */}
              {savedNotes.length > 0 && (
                <div className="space-y-2 mb-3 max-h-[150px] overflow-y-auto">
                  {savedNotes.map((savedNote: any, index) => (
                    <div key={index} className="bg-background rounded-lg p-3 border border-border text-sm">
                      <p className="text-foreground">{typeof savedNote === 'string' ? savedNote : savedNote.text}</p>
                      {savedNote.timestamp && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(savedNote.timestamp), "MMM d, yyyy h:mm a")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <Textarea
                placeholder="Add internal notes for this contact..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="min-h-[80px] bg-background"
              />
              <Button size="sm" onClick={handleSaveNote} disabled={!note.trim() || isSavingNote}>
                {isSavingNote ? "Saving..." : "Save Note"}
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
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => setIsAssignDialogOpen(true)}
                disabled={unassignedLists.length === 0}
              >
                <Plus className="h-4 w-4" />
                Assign to List
              </Button>
            </motion.div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Assign to List Dialog */}
      <Dialog open={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to List</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="list-select">Select a contact list</Label>
            <Select value={selectedListToAssign} onValueChange={setSelectedListToAssign}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Choose a list..." />
              </SelectTrigger>
              <SelectContent>
                {unassignedLists.map((list) => (
                  <SelectItem key={list.id} value={list.id}>
                    {list.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {unassignedLists.length === 0 && (
              <p className="text-sm text-muted-foreground mt-2">
                This contact is already in all available lists.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAssignToList} disabled={!selectedListToAssign}>
              Assign
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
