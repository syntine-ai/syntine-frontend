import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Plus, Users, ListChecks, Megaphone, Clock } from "lucide-react";
import { PageContainer, pageItemVariants } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { ContactListsTable, ContactList } from "@/components/contacts/ContactListsTable";
import { CreateContactListModal } from "@/components/contacts/CreateContactListModal";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// Mock data
const mockLists: ContactList[] = [
  {
    id: 1,
    name: "Leads - January 2025",
    totalContacts: 2840,
    lastUpdated: "Dec 28, 2024",
    linkedCampaigns: 3,
    status: "active",
    type: "static",
  },
  {
    id: 2,
    name: "Hot Prospects",
    totalContacts: 1250,
    lastUpdated: "Dec 27, 2024",
    linkedCampaigns: 2,
    status: "active",
    type: "dynamic",
  },
  {
    id: 3,
    name: "Re-engagement Pool",
    totalContacts: 4820,
    lastUpdated: "Dec 25, 2024",
    linkedCampaigns: 1,
    status: "active",
    type: "static",
  },
  {
    id: 4,
    name: "VIP Customers",
    totalContacts: 342,
    lastUpdated: "Dec 24, 2024",
    linkedCampaigns: 4,
    status: "active",
    type: "dynamic",
  },
  {
    id: 5,
    name: "Product Demo Requests",
    totalContacts: 890,
    lastUpdated: "Dec 22, 2024",
    linkedCampaigns: 1,
    status: "active",
    type: "static",
  },
  {
    id: 6,
    name: "Churned Customers",
    totalContacts: 1560,
    lastUpdated: "Dec 20, 2024",
    linkedCampaigns: 0,
    status: "inactive",
    type: "static",
  },
  {
    id: 7,
    name: "New Signups Q4",
    totalContacts: 2100,
    lastUpdated: "Dec 18, 2024",
    linkedCampaigns: 2,
    status: "active",
    type: "dynamic",
  },
];

export default function ContactLists() {
  const navigate = useNavigate();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [lists] = useState<ContactList[]>(mockLists);

  const handleListClick = (list: ContactList) => {
    toast.info(`Viewing "${list.name}"`, {
      description: `${list.totalContacts.toLocaleString()} contacts in this list.`,
    });
    // In a real app, navigate to list detail: navigate(`/contacts/lists/${list.id}`);
  };

  const handleRenameList = (list: ContactList) => {
    toast.info("Rename list", {
      description: `Renaming "${list.name}"...`,
    });
  };

  const handleDeleteList = (list: ContactList) => {
    toast.error("Delete list", {
      description: `"${list.name}" will be permanently deleted.`,
    });
  };

  const totalContacts = lists.reduce((sum, list) => sum + list.totalContacts, 0);
  const activeLists = lists.filter((l) => l.status === "active").length;
  const totalCampaigns = lists.reduce((sum, list) => sum + list.linkedCampaigns, 0);

  return (
    <PageContainer
        title="Contact Lists"
        subtitle="Segment contacts for campaigns"
        actions={
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create List
          </Button>
        }
      >
        {/* Stats Row */}
        <motion.div variants={pageItemVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Lists"
            value={lists.length}
            icon={ListChecks}
            iconColor="primary"
          />
          <StatCard
            title="Active Lists"
            value={activeLists}
            trend={{ value: 14.2, isPositive: true }}
            icon={Users}
            iconColor="success"
          />
          <StatCard
            title="Total Contacts"
            value={totalContacts.toLocaleString()}
            trend={{ value: 8.5, isPositive: true }}
            icon={Users}
            iconColor="primary"
          />
          <StatCard
            title="Linked Campaigns"
            value={totalCampaigns}
            icon={Megaphone}
            iconColor="warning"
          />
        </motion.div>

        {/* Lists Table */}
        <motion.div variants={pageItemVariants}>
          <ContactListsTable
            lists={lists}
            onListClick={handleListClick}
            onRename={handleRenameList}
            onDelete={handleDeleteList}
          />
        </motion.div>

        {/* Create List Modal */}
        <CreateContactListModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
        />
      </PageContainer>
  );
}
