import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, UserCheck, ThumbsUp, PhoneOff } from "lucide-react";
import { PageContainer, pageItemVariants } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { ContactsFiltersBar } from "@/components/contacts/ContactsFiltersBar";
import { ContactsTable, Contact } from "@/components/contacts/ContactsTable";
import { ContactDetailDrawerNew } from "@/components/contacts/ContactDetailDrawerNew";
import { AddEditContactModal } from "@/components/contacts/AddEditContactModal";
import { CreateContactListModal } from "@/components/contacts/CreateContactListModal";
import { ContactListSelectorBar } from "@/components/contacts/ContactListSelectorBar";
import { ImportContactsModal } from "@/components/contacts/ImportContactsModal";
import { Button } from "@/components/ui/button";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { useContacts, type ContactWithStats } from "@/hooks/useContacts";
import { formatDistanceToNow } from "date-fns";

// Transform database contact to UI contact format
function transformContact(contact: ContactWithStats, listName: string): Contact {
  const stats = contact.callStats;
  
  // Determine sentiment from call history
  let sentiment: "positive" | "neutral" | "negative" | "not_analyzed" = "not_analyzed";
  if (stats && stats.total_calls > 0) {
    // Approximate sentiment based on answer rate
    const answerRate = stats.answered_calls / stats.total_calls;
    if (answerRate >= 0.7) sentiment = "positive";
    else if (answerRate >= 0.4) sentiment = "neutral";
    else sentiment = "negative";
  }

  // Determine outcome from last call
  let outcome: "answered" | "no_answer" | "busy" | "failed" | "not_called" = "not_called";
  if (stats?.last_outcome) {
    const lastOutcome = stats.last_outcome as string;
    if (lastOutcome === "voicemail") {
      outcome = "no_answer";
    } else if (["answered", "no_answer", "busy", "failed"].includes(lastOutcome)) {
      outcome = lastOutcome as typeof outcome;
    }
  }

  return {
    id: contact.id as unknown as number, // We'll handle this type properly
    name: `${contact.first_name || ""} ${contact.last_name || ""}`.trim() || "Unknown",
    phone: contact.phone,
    contactList: listName,
    lastCampaign: null, // Would need to join with campaigns table
    lastCallDate: stats?.last_call_at 
      ? formatDistanceToNow(new Date(stats.last_call_at), { addSuffix: true })
      : null,
    sentiment,
    outcome,
    status: contact.status || "active",
    doNotCall: contact.do_not_call || false,
    callCount: stats?.total_calls || 0,
  };
}

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [selectedDbContact, setSelectedDbContact] = useState<ContactWithStats | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedList, setSelectedList] = useState("all");

  const { 
    contacts, 
    contactLists, 
    isLoading, 
    totalCount,
    createContact,
    updateContact,
    markDoNotCall,
    createContactList,
    importContacts,
  } = useContacts(selectedList);

  // Build list name lookup
  const listNameMap: Record<string, string> = {};
  contactLists.forEach((list) => {
    listNameMap[list.id] = list.name;
  });

  // Transform contacts to UI format
  const uiContacts = contacts.map((c) => {
    const listIds = c.contactLists || [];
    const listName = listIds.length > 0 ? listNameMap[listIds[0]] || "Unknown" : "No List";
    return { ...transformContact(c, listName), dbId: c.id };
  });

  // Compute stats
  const activeThisMonth = contacts.filter((c) => 
    c.callStats?.last_call_at && 
    new Date(c.callStats.last_call_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const positiveCount = contacts.filter((c) => {
    if (!c.callStats || c.callStats.total_calls === 0) return false;
    const answerRate = c.callStats.answered_calls / c.callStats.total_calls;
    return answerRate >= 0.7;
  }).length;

  const dncCount = contacts.filter((c) => c.do_not_call).length;

  const positivePercent = totalCount > 0 ? Math.round((positiveCount / totalCount) * 100) : 0;

  const handleContactClick = (contact: Contact) => {
    const dbContact = contacts.find((c) => c.id === (contact as any).dbId);
    setSelectedContact(contact);
    setSelectedDbContact(dbContact || null);
    setIsDrawerOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    const dbContact = contacts.find((c) => c.id === (contact as any).dbId);
    setSelectedContact(contact);
    setSelectedDbContact(dbContact || null);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setSelectedDbContact(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  const handleMarkDNC = async (contact: Contact) => {
    const dbId = (contact as any).dbId;
    if (dbId) {
      await markDoNotCall(dbId, !contact.doNotCall);
    }
  };

  const handleSaveContact = async (data: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string;
    tags?: string;
    contactListId?: string;
    doNotCall?: boolean;
  }) => {
    if (isEditMode && selectedDbContact) {
      await updateContact(selectedDbContact.id, {
        first_name: data.firstName,
        last_name: data.lastName,
        phone: data.phone,
        email: data.email || null,
        do_not_call: data.doNotCall || false,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : [],
      });
    } else {
      await createContact({
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        email: data.email,
        tags: data.tags ? data.tags.split(",").map((t) => t.trim()) : undefined,
        doNotCall: data.doNotCall,
        contactListId: data.contactListId,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleCreateList = async (name: string, description?: string) => {
    await createContactList(name, description);
    setIsCreateListModalOpen(false);
  };

  const handleImportContacts = async (
    parsedContacts: Array<{ firstName: string; lastName: string; phone: string; email?: string }>,
    listId: string
  ) => {
    await importContacts(parsedContacts, listId);
    setIsImportModalOpen(false);
  };

  return (
    <PageContainer
        title="Contacts"
        subtitle="Manage people your AI agents call"
        actions={
          <Button onClick={handleAddContact} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
        }
      >
        {/* Stats Row */}
        <motion.div variants={pageItemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Contacts"
            value={totalCount.toLocaleString()}
            icon={Users}
            iconColor="primary"
          />
          <StatCard
            title="Active This Month"
            value={activeThisMonth.toLocaleString()}
            icon={UserCheck}
            iconColor="success"
          />
          <StatCard
            title="High Positive Sentiment"
            value={`${positivePercent}%`}
            icon={ThumbsUp}
            iconColor="success"
          />
          <StatCard
            title="Do Not Call"
            value={dncCount.toLocaleString()}
            icon={PhoneOff}
            iconColor="destructive"
          />
        </motion.div>

        {/* Contact List Selector Bar */}
        <motion.div variants={pageItemVariants}>
          <ContactListSelectorBar
            selectedList={selectedList}
            onListChange={setSelectedList}
            onImportClick={() => setIsImportModalOpen(true)}
            onCreateListClick={() => setIsCreateListModalOpen(true)}
            contactLists={contactLists}
            totalCount={totalCount}
          />
        </motion.div>

        {/* Filters */}
        <motion.div variants={pageItemVariants} className="mb-6">
          <ContactsFiltersBar
            onSearchChange={() => {}}
            onListChange={() => {}}
            onCampaignChange={() => {}}
            onSentimentChange={() => {}}
            onOutcomeChange={() => {}}
            onCallStateChange={() => {}}
          />
        </motion.div>

        {/* Contacts Table */}
        <motion.div variants={pageItemVariants}>
          {isLoading ? (
            <SkeletonTable rows={8} columns={10} />
          ) : uiContacts.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No contacts found"
              description="Add contacts manually or import them from a file."
              actionLabel="Add Contact"
              onAction={handleAddContact}
            />
          ) : (
            <ContactsTable
              contacts={uiContacts}
              onContactClick={handleContactClick}
              onEdit={handleEditContact}
              onAssignToList={() => {}}
              onMarkDNC={handleMarkDNC}
            />
          )}
        </motion.div>

        {/* Contact Detail Drawer */}
        <ContactDetailDrawerNew
          contact={selectedContact && selectedDbContact ? {
            ...selectedContact,
            email: selectedDbContact.email || undefined,
            tags: Array.isArray(selectedDbContact.tags) ? selectedDbContact.tags as string[] : [],
          } : null}
          open={isDrawerOpen}
          onOpenChange={setIsDrawerOpen}
          onEdit={() => {
            setIsDrawerOpen(false);
            if (selectedContact) handleEditContact(selectedContact);
          }}
        />

        {/* Add/Edit Contact Modal */}
        <AddEditContactModal
          open={isAddModalOpen}
          onOpenChange={setIsAddModalOpen}
          mode={isEditMode ? "edit" : "add"}
          contact={
            isEditMode && selectedDbContact
              ? {
                  id: selectedDbContact.id as unknown as number,
                  firstName: selectedDbContact.first_name || "",
                  lastName: selectedDbContact.last_name || "",
                  phone: selectedDbContact.phone,
                  email: selectedDbContact.email || "",
                  doNotCall: selectedDbContact.do_not_call || false,
                  tags: Array.isArray(selectedDbContact.tags) 
                    ? (selectedDbContact.tags as string[]).join(", ") 
                    : "",
                }
              : undefined
          }
          contactLists={contactLists}
          onSubmit={handleSaveContact}
        />

        {/* Create Contact List Modal */}
        <CreateContactListModal
          open={isCreateListModalOpen}
          onOpenChange={setIsCreateListModalOpen}
          onSubmit={handleCreateList}
        />

        {/* Import Contacts Modal */}
        <ImportContactsModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
          contactLists={contactLists}
          onImport={handleImportContacts}
        />
      </PageContainer>
  );
}
