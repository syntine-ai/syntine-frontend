import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type Contact = Database["public"]["Tables"]["contacts"]["Row"];
type ContactInsert = Database["public"]["Tables"]["contacts"]["Insert"];
type ContactUpdate = Database["public"]["Tables"]["contacts"]["Update"];
type ContactCallStats = Database["public"]["Tables"]["contact_call_stats"]["Row"];
type ContactList = Database["public"]["Tables"]["contact_lists"]["Row"];

export interface ContactWithStats extends Contact {
  callStats?: ContactCallStats | null;
  contactLists?: string[];
}

export interface ContactListWithCount extends ContactList {
  contactCount: number;
}

export function useContacts(selectedListId?: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactWithStats[]>([]);
  const [contactLists, setContactLists] = useState<ContactListWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchContactLists = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      const { data: lists, error: listsError } = await supabase
        .from("contact_lists")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("name");

      if (listsError) throw listsError;

      // Get member counts
      const { data: memberCounts, error: countError } = await supabase
        .from("contact_list_members")
        .select("contact_list_id");

      if (countError) throw countError;

      const counts: Record<string, number> = {};
      memberCounts?.forEach((m) => {
        counts[m.contact_list_id] = (counts[m.contact_list_id] || 0) + 1;
      });

      const listsWithCounts: ContactListWithCount[] = (lists || []).map((list) => ({
        ...list,
        contactCount: counts[list.id] || 0,
      }));

      setContactLists(listsWithCounts);
    } catch (err) {
      console.error("Error fetching contact lists:", err);
    }
  }, [profile?.organization_id]);

  const fetchContacts = useCallback(async () => {
    if (!profile?.organization_id) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabase
        .from("contacts")
        .select("*")
        .eq("organization_id", profile.organization_id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false });

      // If a specific list is selected, filter by list membership
      if (selectedListId && selectedListId !== "all") {
        const { data: memberIds, error: memberError } = await supabase
          .from("contact_list_members")
          .select("contact_id")
          .eq("contact_list_id", selectedListId);

        if (memberError) throw memberError;

        const contactIds = memberIds?.map((m) => m.contact_id) || [];
        if (contactIds.length === 0) {
          setContacts([]);
          setTotalCount(0);
          setIsLoading(false);
          return;
        }
        query = query.in("id", contactIds);
      }

      const { data: contactsData, error: contactsError, count } = await query;

      if (contactsError) throw contactsError;

      // Fetch call stats for contacts
      const contactIds = contactsData?.map((c) => c.id) || [];
      let statsMap: Record<string, ContactCallStats> = {};

      if (contactIds.length > 0) {
        const { data: stats, error: statsError } = await supabase
          .from("contact_call_stats")
          .select("*")
          .in("contact_id", contactIds);

        if (!statsError && stats) {
          stats.forEach((s) => {
            statsMap[s.contact_id] = s;
          });
        }
      }

      // Fetch list memberships
      const { data: memberships, error: membershipError } = await supabase
        .from("contact_list_members")
        .select("contact_id, contact_list_id");

      const listMemberships: Record<string, string[]> = {};
      if (!membershipError && memberships) {
        memberships.forEach((m) => {
          if (!listMemberships[m.contact_id]) {
            listMemberships[m.contact_id] = [];
          }
          listMemberships[m.contact_id].push(m.contact_list_id);
        });
      }

      const contactsWithStats: ContactWithStats[] = (contactsData || []).map((contact) => ({
        ...contact,
        callStats: statsMap[contact.id] || null,
        contactLists: listMemberships[contact.id] || [],
      }));

      setContacts(contactsWithStats);
      setTotalCount(count || contactsWithStats.length);
    } catch (err) {
      console.error("Error fetching contacts:", err);
      setError("Failed to fetch contacts");
      toast({
        title: "Error",
        description: "Failed to fetch contacts",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id, selectedListId, toast]);

  useEffect(() => {
    fetchContacts();
    fetchContactLists();
  }, [fetchContacts, fetchContactLists]);

  const createContact = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    tags?: string[];
    doNotCall?: boolean;
    contactListId?: string;
  }) => {
    if (!profile?.organization_id) {
      toast({
        title: "Error",
        description: "You must be logged in to create a contact",
        variant: "destructive",
      });
      return null;
    }

    try {
      const contactData: ContactInsert = {
        organization_id: profile.organization_id,
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email || null,
        tags: data.tags || [],
        do_not_call: data.doNotCall || false,
      };

      const { data: newContact, error } = await supabase
        .from("contacts")
        .insert(contactData)
        .select()
        .single();

      if (error) throw error;

      // Add to contact list if specified
      if (data.contactListId && newContact) {
        await supabase.from("contact_list_members").insert({
          contact_id: newContact.id,
          contact_list_id: data.contactListId,
        });
      }

      await fetchContacts();

      toast({
        title: "Contact Created",
        description: `${data.firstName} ${data.lastName} has been added.`,
      });

      return newContact;
    } catch (err: any) {
      console.error("Error creating contact:", err);
      const message = err?.message?.includes("unique") 
        ? "A contact with this phone number already exists"
        : "Failed to create contact";
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
      return null;
    }
  };

  const updateContact = async (id: string, data: Partial<ContactUpdate>) => {
    try {
      const { data: updatedContact, error } = await supabase
        .from("contacts")
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === id ? { ...contact, ...updatedContact } : contact
        )
      );

      toast({
        title: "Contact Updated",
        description: "Contact has been updated successfully.",
      });

      return updatedContact;
    } catch (err) {
      console.error("Error updating contact:", err);
      toast({
        title: "Error",
        description: "Failed to update contact",
        variant: "destructive",
      });
      return null;
    }
  };

  const deleteContact = async (id: string) => {
    try {
      const { error } = await supabase
        .from("contacts")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;

      setContacts((prev) => prev.filter((c) => c.id !== id));

      toast({
        title: "Contact Deleted",
        description: "The contact has been removed.",
        variant: "destructive",
      });

      return true;
    } catch (err) {
      console.error("Error deleting contact:", err);
      toast({
        title: "Error",
        description: "Failed to delete contact",
        variant: "destructive",
      });
      return false;
    }
  };

  const markDoNotCall = async (id: string, doNotCall: boolean) => {
    return updateContact(id, { do_not_call: doNotCall });
  };

  const assignToList = async (contactId: string, listId: string) => {
    try {
      const { error } = await supabase.from("contact_list_members").insert({
        contact_id: contactId,
        contact_list_id: listId,
      });

      if (error) {
        if (error.message.includes("duplicate")) {
          toast({
            title: "Already in list",
            description: "This contact is already in the selected list.",
          });
          return false;
        }
        throw error;
      }

      await fetchContacts();

      toast({
        title: "Added to List",
        description: "Contact has been added to the list.",
      });

      return true;
    } catch (err) {
      console.error("Error assigning to list:", err);
      toast({
        title: "Error",
        description: "Failed to add contact to list",
        variant: "destructive",
      });
      return false;
    }
  };

  const removeFromList = async (contactId: string, listId: string) => {
    try {
      const { error } = await supabase
        .from("contact_list_members")
        .delete()
        .eq("contact_id", contactId)
        .eq("contact_list_id", listId);

      if (error) throw error;

      await fetchContacts();

      toast({
        title: "Removed from List",
        description: "Contact has been removed from the list.",
      });

      return true;
    } catch (err) {
      console.error("Error removing from list:", err);
      toast({
        title: "Error",
        description: "Failed to remove contact from list",
        variant: "destructive",
      });
      return false;
    }
  };

  const createContactList = async (name: string, description?: string) => {
    if (!profile?.organization_id) return null;

    try {
      const { data: newList, error } = await supabase
        .from("contact_lists")
        .insert({
          organization_id: profile.organization_id,
          name,
          description,
          list_type: "static",
        })
        .select()
        .single();

      if (error) throw error;

      setContactLists((prev) => [...prev, { ...newList, contactCount: 0 }]);

      toast({
        title: "List Created",
        description: `"${name}" has been created.`,
      });

      return newList;
    } catch (err) {
      console.error("Error creating list:", err);
      toast({
        title: "Error",
        description: "Failed to create list",
        variant: "destructive",
      });
      return null;
    }
  };

  const importContacts = async (
    contacts: Array<{ firstName: string; lastName: string; phone: string; email?: string }>,
    listId: string
  ) => {
    if (!profile?.organization_id) return { success: 0, failed: 0 };

    let success = 0;
    let failed = 0;

    for (const contact of contacts) {
      try {
        const { data: newContact, error } = await supabase
          .from("contacts")
          .insert({
            organization_id: profile.organization_id,
            first_name: contact.firstName,
            last_name: contact.lastName,
            phone: contact.phone,
            email: contact.email || null,
          })
          .select()
          .single();

        if (error) {
          failed++;
          continue;
        }

        // Add to list
        await supabase.from("contact_list_members").insert({
          contact_id: newContact.id,
          contact_list_id: listId,
        });

        success++;
      } catch {
        failed++;
      }
    }

    await fetchContacts();
    await fetchContactLists();

    toast({
      title: "Import Complete",
      description: `${success} contacts imported, ${failed} failed.`,
    });

    return { success, failed };
  };

  return {
    contacts,
    contactLists,
    isLoading,
    error,
    totalCount,
    createContact,
    updateContact,
    deleteContact,
    markDoNotCall,
    assignToList,
    removeFromList,
    createContactList,
    importContacts,
    refetch: fetchContacts,
    refetchLists: fetchContactLists,
  };
}
