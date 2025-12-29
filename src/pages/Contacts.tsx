import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { UserPlus, ListPlus, Users, UserCheck, ThumbsUp, PhoneOff } from "lucide-react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer, pageItemVariants } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { ContactsFiltersBar } from "@/components/contacts/ContactsFiltersBar";
import { ContactsTable, Contact } from "@/components/contacts/ContactsTable";
import { ContactDetailDrawerNew } from "@/components/contacts/ContactDetailDrawerNew";
import { AddEditContactModal } from "@/components/contacts/AddEditContactModal";
import { CreateContactListModal } from "@/components/contacts/CreateContactListModal";
import { Button } from "@/components/ui/button";

// Mock data
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
  },
  {
    id: 4,
    name: "David Kim",
    phone: "+1 (555) 567-8901",
    contactList: "Leads - Jan",
    lastCampaign: "Sales Follow-up",
    lastCallDate: "Dec 25, 2024",
    sentiment: "positive",
    outcome: "answered",
    status: "active",
  },
  {
    id: 5,
    name: "Jessica Lee",
    phone: "+1 (555) 678-9012",
    contactList: "Hot Prospects",
    lastCampaign: "Renewal Campaign",
    lastCallDate: "Dec 24, 2024",
    sentiment: "positive",
    outcome: "answered",
    status: "active",
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
  },
  {
    id: 7,
    name: "Amanda Wilson",
    phone: "+1 (555) 890-1234",
    contactList: "Leads - Jan",
    lastCampaign: "Loan Outreach",
    lastCallDate: "Dec 22, 2024",
    sentiment: "positive",
    outcome: "answered",
    status: "active",
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
  },
];

export default function Contacts() {
  const navigate = useNavigate();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateListModalOpen, setIsCreateListModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
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
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => setIsCreateListModalOpen(true)} className="gap-2">
              <ListPlus className="h-4 w-4" />
              Create Contact List
            </Button>
            <Button onClick={handleAddContact} className="gap-2">
              <UserPlus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
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

        {/* Filters */}
        <motion.div variants={pageItemVariants} className="mb-6">
          <ContactsFiltersBar
            onSearchChange={() => {}}
            onListChange={() => {}}
            onCampaignChange={() => {}}
            onSentimentChange={() => {}}
            onOutcomeChange={() => {}}
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
      </PageContainer>
    </OrgAppShell>
  );
}
