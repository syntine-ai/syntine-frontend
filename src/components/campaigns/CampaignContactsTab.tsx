import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Users, Link as LinkIcon, RefreshCw, Trash2 } from "lucide-react";
import { CampaignWithDetails, useCampaigns } from "@/hooks/useCampaigns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface CampaignContactsTabProps {
  campaignId: string;
  campaign?: CampaignWithDetails;
}

interface ContactList {
  id: string;
  name: string;
  contactCount: number;
}

interface Contact {
  id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  tags: any;
}

export function CampaignContactsTab({ campaignId, campaign }: CampaignContactsTabProps) {
  const { profile } = useAuth();
  const { linkContactList, unlinkContactList, refetch } = useCampaigns();
  const [previewContacts, setPreviewContacts] = useState<Contact[]>([]);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [availableLists, setAvailableLists] = useState<ContactList[]>([]);
  const [isLinking, setIsLinking] = useState(false);

  // Get linked contact lists from campaign
  const linkedLists = campaign?.contactLists || [];

  // Fetch preview contacts from linked lists
  useEffect(() => {
    const fetchPreviewContacts = async () => {
      if (linkedLists.length === 0) {
        setPreviewContacts([]);
        return;
      }

      setLoadingPreview(true);
      try {
        const listIds = linkedLists.map((l) => l.id);

        // Get contact IDs from list members
        const { data: memberData } = await supabase
          .from("contact_list_members")
          .select("contact_id")
          .in("contact_list_id", listIds)
          .limit(10);

        if (memberData && memberData.length > 0) {
          const contactIds = memberData.map((m) => m.contact_id);

          // Fetch contact details
          const { data: contacts } = await supabase
            .from("contacts")
            .select("id, first_name, last_name, phone, tags")
            .in("id", contactIds);

          setPreviewContacts(contacts || []);
        } else {
          setPreviewContacts([]);
        }
      } catch (err) {
        console.error("Error fetching preview contacts:", err);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreviewContacts();
  }, [linkedLists]);

  // Fetch available contact lists when modal opens
  useEffect(() => {
    const fetchAvailableLists = async () => {
      if (!isLinkModalOpen || !profile?.organization_id) return;

      try {
        const { data: lists } = await supabase
          .from("contact_lists")
          .select("id, name")
          .eq("organization_id", profile.organization_id)
          .is("deleted_at", null);

        if (lists) {
          // Get member counts
          const { data: members } = await supabase
            .from("contact_list_members")
            .select("contact_list_id");

          const counts: Record<string, number> = {};
          members?.forEach((m) => {
            counts[m.contact_list_id] = (counts[m.contact_list_id] || 0) + 1;
          });

          // Filter out already linked lists
          const linkedIds = new Set(linkedLists.map((l) => l.id));
          const available = lists
            .filter((l) => !linkedIds.has(l.id))
            .map((l) => ({
              id: l.id,
              name: l.name,
              contactCount: counts[l.id] || 0,
            }));

          setAvailableLists(available);
        }
      } catch (err) {
        console.error("Error fetching available lists:", err);
      }
    };

    fetchAvailableLists();
  }, [isLinkModalOpen, profile?.organization_id, linkedLists]);

  const handleLinkList = async (listId: string) => {
    setIsLinking(true);
    await linkContactList(campaignId, listId);
    setIsLinking(false);
    setIsLinkModalOpen(false);
  };

  const handleUnlinkList = async (listId: string) => {
    await unlinkContactList(campaignId, listId);
  };

  const getContactName = (contact: Contact) => {
    const name = [contact.first_name, contact.last_name].filter(Boolean).join(" ");
    return name || "Unknown";
  };

  const getContactTag = (contact: Contact) => {
    if (Array.isArray(contact.tags) && contact.tags.length > 0) {
      return contact.tags[0];
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Contact Lists */}
      <Card className="border-border/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Linked Contact Lists</CardTitle>
              <CardDescription>Contact lists attached to this campaign</CardDescription>
            </div>
            <Button variant="outline" onClick={() => setIsLinkModalOpen(true)}>
              <LinkIcon className="h-4 w-4 mr-2" />
              Attach Contact List
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {linkedLists.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contact lists attached</p>
          ) : (
            <div className="space-y-3">
              {linkedLists.map((list, index) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 border border-border/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{list.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {list.contactCount.toLocaleString()} contacts
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-success/15 text-success">
                      Synced
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleUnlinkList(list.id)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contact Preview */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Contact Preview</CardTitle>
          <CardDescription>Sample contacts from linked lists</CardDescription>
        </CardHeader>
        <CardContent>
          {loadingPreview ? (
            <p className="text-muted-foreground text-center py-8">Loading contacts...</p>
          ) : previewContacts.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No contacts to preview</p>
          ) : (
            <div className="rounded-lg border border-border/50 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/50 hover:bg-transparent">
                    <TableHead className="text-muted-foreground font-medium">Name</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Phone</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Tag</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewContacts.map((contact, index) => (
                    <motion.tr
                      key={contact.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.03 }}
                      className="border-border/50"
                    >
                      <TableCell className="font-medium text-foreground">
                        {getContactName(contact)}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{contact.phone}</TableCell>
                      <TableCell>
                        {getContactTag(contact) && (
                          <Badge variant="outline" className="text-xs">
                            {getContactTag(contact)}
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link Contact List Modal */}
      <Dialog open={isLinkModalOpen} onOpenChange={setIsLinkModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attach Contact List</DialogTitle>
            <DialogDescription>
              Select a contact list to attach to this campaign
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 mt-4">
            {availableLists.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">
                No available contact lists to attach
              </p>
            ) : (
              availableLists.map((list) => (
                <motion.button
                  key={list.id}
                  whileHover={{ scale: 1.01 }}
                  onClick={() => handleLinkList(list.id)}
                  disabled={isLinking}
                  className={cn(
                    "w-full flex items-center justify-between p-4 rounded-lg border border-border/50",
                    "hover:bg-muted/30 transition-colors text-left",
                    isLinking && "opacity-50 cursor-not-allowed"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{list.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {list.contactCount.toLocaleString()} contacts
                      </p>
                    </div>
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
