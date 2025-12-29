import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus, Users, UserCheck, ThumbsUp, PhoneOff } from "lucide-react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
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

// Mock data with new states
const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Sarah Chen",
    phone: "+1 (555) 234-5678",
    contactList: "Leads - Jan",
    lastCampaign: "Sales Follow-up",
    lastCallDate: "Dec 28, 2024",
    sentiment: "positive",
    outcome: "answered",
    status: "active",
    callCount: 3,
  },
  {
    id: 2,
    name: "Marcus Johnson",
    phone: "+1 (555) 345-6789",
    contactList: "Hot Prospects",
    lastCampaign: "Loan Outreach",
    lastCallDate: "Dec 27, 2024",
    sentiment: "neutral",
    outcome: "no_answer",
    status: "active",
    callCount: 2,
  },
  {
    id: 3,
    name: "Emily Rodriguez",
    phone: "+1 (555) 456-7890",
    contactList: "Re-engagement",
    lastCampaign: "Product Demo",
    lastCallDate: "Dec 26, 2024",
    sentiment: "negative",
    outcome: "busy",
    status: "active",
    doNotCall: true,
    callCount: 1,
  },
  {
    id: 4,
    name: "David Kim",
    phone: "+1 (555) 567-8901",
    contactList: "Leads - Jan",
    lastCampaign: null,
    lastCallDate: null,
    sentiment: "not_analyzed",
    outcome: "not_called",
    status: "active",
    callCount: 0,
  },
  {
    id: 5,
    name: "Jessica Lee",
    phone: "+1 (555) 678-9012",
    contactList: "Hot Prospects",
    lastCampaign: null,
    lastCallDate: null,
    sentiment: "not_analyzed",
    outcome: "not_called",
    status: "active",
    callCount: 0,
  },
  {
    id: 6,
    name: "Michael Brown",
    phone: "+1 (555) 789-0123",
    contactList: "Re-engagement",
    lastCampaign: "Product Demo",
    lastCallDate: "Dec 23, 2024",
    sentiment: "neutral",
    outcome: "failed",
    status: "inactive",
    callCount: 1,
  },
  {
    id: 7,
    name: "Amanda Wilson",
    phone: "+1 (555) 890-1234",
    contactList: "Leads - Jan",
    lastCampaign: null,
    lastCallDate: null,
    sentiment: "not_analyzed",
    outcome: "not_called",
    status: "active",
    callCount: 0,
  },
  {
    id: 8,
    name: "Robert Taylor",
    phone: "+1 (555) 901-2345",
    contactList: "Hot Prospects",
    lastCampaign: "Sales Follow-up",
    lastCallDate: "Dec 21, 2024",
    sentiment: "negative",
    outcome: "busy",
    status: "active",
    doNotCall: true,
    callCount: 2,
  },
];

export default function Contacts() {
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedList, setSelectedList] = useState("all");
  const [contacts] = useState<Contact[]>(mockContacts);

  const handleContactClick = (contact: Contact) => {
    setSelectedContact(contact);
    setIsDrawerOpen(true);
  };

  const handleEditContact = (contact: Contact) => {
    setSelectedContact(contact);
    setIsEditMode(true);
    setIsAddModalOpen(true);
  };

  const handleAddContact = () => {
    setSelectedContact(null);
    setIsEditMode(false);
    setIsAddModalOpen(true);
  };

  return (
    <OrgAppShell>
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
            value="12,480"
            trend={{ value: 8.2, isPositive: true }}
            icon={Users}
            iconColor="primary"
          />
          <StatCard
            title="Active This Month"
            value="3,214"
            trend={{ value: 12.5, isPositive: true }}
            icon={UserCheck}
            iconColor="success"
          />
          <StatCard
            title="High Positive Sentiment"
            value="41%"
            trend={{ value: 3.8, isPositive: true }}
            icon={ThumbsUp}
            iconColor="success"
          />
          <StatCard
            title="Do Not Call"
            value="386"
            trend={{ value: 2.1, isPositive: false }}
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
          <ContactsTable
            contacts={contacts}
            onContactClick={handleContactClick}
            onEdit={handleEditContact}
            onAssignToList={() => {}}
            onMarkDNC={() => {}}
          />
        </motion.div>

        {/* Contact Detail Drawer */}
        <ContactDetailDrawerNew
          contact={selectedContact ? {
            ...selectedContact,
            email: "example@email.com",
            tags: ["lead", "priority"],
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
            isEditMode && selectedContact
              ? {
                  id: selectedContact.id,
                  firstName: selectedContact.name.split(" ")[0],
                  lastName: selectedContact.name.split(" ").slice(1).join(" "),
                  phone: selectedContact.phone,
                  doNotCall: selectedContact.doNotCall,
                }
              : undefined
          }
        />

        {/* Create Contact List Modal */}
        <CreateContactListModal
          open={isCreateListModalOpen}
          onOpenChange={setIsCreateListModalOpen}
        />

        {/* Import Contacts Modal */}
        <ImportContactsModal
          open={isImportModalOpen}
          onOpenChange={setIsImportModalOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
}
