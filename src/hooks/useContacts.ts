import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock types since contacts tables don't exist yet
export interface ContactWithStats {
  id: string;
  organization_id: string;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  email: string | null;
  status: "active" | "inactive";
  do_not_call: boolean;
  tags: string[];
  metadata: Record<string, any> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  callStats?: {
    total_calls: number;
    answered_calls: number;
    missed_calls: number;
    failed_calls: number;
    total_duration_seconds: number;
    last_call_at: string | null;
    last_outcome: string | null;
  } | null;
  contactLists?: string[];
}

export interface ContactListWithCount {
  id: string;
  organization_id: string;
  name: string;
  description: string | null;
  list_type: "static" | "dynamic";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  contactCount: number;
}

// Demo data
const demoContactLists: ContactListWithCount[] = [
  {
    id: "list-1",
    organization_id: "demo-org",
    name: "VIP Customers",
    description: "High-value repeat customers",
    list_type: "static",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-01-28T14:30:00Z",
    deleted_at: null,
    contactCount: 156,
  },
  {
    id: "list-2",
    organization_id: "demo-org",
    name: "Recent Orders",
    description: "Customers with orders in the last 30 days",
    list_type: "dynamic",
    created_at: "2026-01-10T08:00:00Z",
    updated_at: "2026-01-28T12:00:00Z",
    deleted_at: null,
    contactCount: 423,
  },
  {
    id: "list-3",
    organization_id: "demo-org",
    name: "Cart Abandoners",
    description: "Customers who abandoned their carts",
    list_type: "dynamic",
    created_at: "2026-01-05T15:00:00Z",
    updated_at: "2026-01-28T10:00:00Z",
    deleted_at: null,
    contactCount: 89,
  },
];

const demoContacts: ContactWithStats[] = [
  {
    id: "contact-1",
    organization_id: "demo-org",
    first_name: "Rahul",
    last_name: "Sharma",
    phone: "+919876543210",
    email: "rahul.sharma@email.com",
    status: "active",
    do_not_call: false,
    tags: ["vip", "repeat-customer"],
    metadata: null,
    created_at: "2026-01-10T10:00:00Z",
    updated_at: "2026-01-28T14:30:00Z",
    deleted_at: null,
    callStats: {
      total_calls: 5,
      answered_calls: 4,
      missed_calls: 1,
      failed_calls: 0,
      total_duration_seconds: 450,
      last_call_at: "2026-01-28T10:30:00Z",
      last_outcome: "answered",
    },
    contactLists: ["list-1", "list-2"],
  },
  {
    id: "contact-2",
    organization_id: "demo-org",
    first_name: "Priya",
    last_name: "Patel",
    phone: "+919876543211",
    email: "priya.patel@email.com",
    status: "active",
    do_not_call: false,
    tags: ["new-customer"],
    metadata: null,
    created_at: "2026-01-20T08:00:00Z",
    updated_at: "2026-01-27T16:00:00Z",
    deleted_at: null,
    callStats: {
      total_calls: 2,
      answered_calls: 1,
      missed_calls: 1,
      failed_calls: 0,
      total_duration_seconds: 120,
      last_call_at: "2026-01-27T14:00:00Z",
      last_outcome: "no_answer",
    },
    contactLists: ["list-2"],
  },
  {
    id: "contact-3",
    organization_id: "demo-org",
    first_name: "Amit",
    last_name: "Kumar",
    phone: "+919876543212",
    email: "amit.kumar@email.com",
    status: "active",
    do_not_call: true,
    tags: ["do-not-call"],
    metadata: null,
    created_at: "2026-01-05T12:00:00Z",
    updated_at: "2026-01-25T10:00:00Z",
    deleted_at: null,
    callStats: null,
    contactLists: ["list-3"],
  },
  {
    id: "contact-4",
    organization_id: "demo-org",
    first_name: "Sneha",
    last_name: "Reddy",
    phone: "+919876543213",
    email: "sneha.reddy@email.com",
    status: "active",
    do_not_call: false,
    tags: ["vip"],
    metadata: null,
    created_at: "2026-01-12T14:00:00Z",
    updated_at: "2026-01-28T09:00:00Z",
    deleted_at: null,
    callStats: {
      total_calls: 8,
      answered_calls: 7,
      missed_calls: 0,
      failed_calls: 1,
      total_duration_seconds: 890,
      last_call_at: "2026-01-28T09:00:00Z",
      last_outcome: "answered",
    },
    contactLists: ["list-1"],
  },
];

export function useContacts(selectedListId?: string) {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [contacts, setContacts] = useState<ContactWithStats[]>([]);
  const [contactLists, setContactLists] = useState<ContactListWithCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  const fetchContactLists = useCallback(async () => {
    // Using demo data until contacts tables are created
    setContactLists(demoContactLists);
  }, []);

  const fetchContacts = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Filter by list if specified
      let filteredContacts = [...demoContacts];
      
      if (selectedListId && selectedListId !== "all") {
        filteredContacts = demoContacts.filter((c) =>
          c.contactLists?.includes(selectedListId)
        );
      }

      setContacts(filteredContacts);
      setTotalCount(filteredContacts.length);
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
  }, [selectedListId, toast]);

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
    // Demo implementation - just show success toast
    toast({
      title: "Contact Created",
      description: `${data.firstName} ${data.lastName} has been added.`,
    });

    return {
      id: `contact-${Date.now()}`,
      organization_id: profile?.organization_id || "demo-org",
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      email: data.email || null,
      status: "active" as const,
      do_not_call: data.doNotCall || false,
      tags: data.tags || [],
      metadata: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
    };
  };

  const updateContact = async (id: string, data: Partial<ContactWithStats>) => {
    setContacts((prev) =>
      prev.map((contact) =>
        contact.id === id ? { ...contact, ...data } : contact
      )
    );

    toast({
      title: "Contact Updated",
      description: "Contact has been updated successfully.",
    });

    return { id, ...data };
  };

  const deleteContact = async (id: string) => {
    setContacts((prev) => prev.filter((c) => c.id !== id));

    toast({
      title: "Contact Deleted",
      description: "The contact has been removed.",
      variant: "destructive",
    });

    return true;
  };

  const markDoNotCall = async (id: string, doNotCall: boolean) => {
    return updateContact(id, { do_not_call: doNotCall });
  };

  const assignToList = async (contactId: string, listId: string) => {
    toast({
      title: "Added to List",
      description: "Contact has been added to the list.",
    });

    return true;
  };

  const removeFromList = async (contactId: string, listId: string) => {
    toast({
      title: "Removed from List",
      description: "Contact has been removed from the list.",
    });

    return true;
  };

  const createContactList = async (name: string, description?: string) => {
    const newList: ContactListWithCount = {
      id: `list-${Date.now()}`,
      organization_id: profile?.organization_id || "demo-org",
      name,
      description: description || null,
      list_type: "static",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      deleted_at: null,
      contactCount: 0,
    };

    setContactLists((prev) => [...prev, newList]);

    toast({
      title: "List Created",
      description: `"${name}" has been created.`,
    });

    return newList;
  };

  const importContacts = async (
    contacts: Array<{ firstName: string; lastName: string; phone: string; email?: string }>,
    listId: string
  ) => {
    toast({
      title: "Import Complete",
      description: `${contacts.length} contacts imported.`,
    });

    return { success: contacts.length, failed: 0 };
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
