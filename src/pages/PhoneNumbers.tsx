import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { PhoneNumbersTable } from "@/components/phone-numbers/PhoneNumbersTable";
import { ConnectAgentModal } from "@/components/phone-numbers/ConnectAgentModal";
import { usePhoneNumbers } from "@/hooks/usePhoneNumbers";
import type { PhoneNumberWithAgent } from "@/hooks/usePhoneNumbers";
import { Phone, Bot, Globe, IndianRupee, Search } from "lucide-react";

const StatCard = ({
  icon: Icon,
  label,
  value,
  prefix,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  prefix?: string;
}) => (
  <div className="bg-card border border-border rounded-lg p-4">
    <div className="flex items-center gap-3">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold text-foreground">
          {prefix}
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>
      </div>
    </div>
  </div>
);

const PhoneNumbers = () => {
  const {
    orgNumbers,
    availableNumbers,
    isLoading,
    stats,
    assignNumber,
    releaseNumber,
    connectToAgent,
    disconnectFromAgent,
  } = usePhoneNumbers();

  const [searchQuery, setSearchQuery] = useState("");
  const [connectModalOpen, setConnectModalOpen] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<PhoneNumberWithAgent | null>(null);

  // Filter numbers based on search
  const filteredOrgNumbers = orgNumbers.filter(
    (n) =>
      n.phone_number.includes(searchQuery) ||
      n.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAvailableNumbers = availableNumbers.filter(
    (n) =>
      n.phone_number.includes(searchQuery) ||
      n.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.region?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenConnectModal = (numberId: string) => {
    const number = orgNumbers.find((n) => n.id === numberId);
    if (number) {
      setSelectedNumber(number);
      setConnectModalOpen(true);
    }
  };

  // Get agent IDs that already have phone numbers
  const existingConnections = orgNumbers
    .filter((n) => n.agent_id)
    .map((n) => n.agent_id as string);

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground mb-1">Phone Numbers</h1>
        <p className="text-muted-foreground">
          Manage your organization's phone numbers and connect them to agents
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Phone} label="My Numbers" value={stats.totalAssigned} />
        <StatCard icon={Bot} label="Connected to Agents" value={stats.connectedToAgents} />
        <StatCard icon={Globe} label="Available Pool" value={stats.availablePool} />
        <StatCard
          icon={IndianRupee}
          label="Monthly Cost"
          value={stats.monthlyCost}
          prefix="₹"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="my-numbers" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <TabsList>
            <TabsTrigger value="my-numbers">
              My Numbers ({orgNumbers.length})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available Pool ({availableNumbers.length})
            </TabsTrigger>
          </TabsList>

          {/* Search */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search numbers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <TabsContent value="my-numbers">
          <PhoneNumbersTable
            numbers={filteredOrgNumbers}
            variant="org"
            onRelease={releaseNumber}
            onConnect={handleOpenConnectModal}
            onDisconnect={disconnectFromAgent}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="available">
          <PhoneNumbersTable
            numbers={filteredAvailableNumbers}
            variant="available"
            onAssign={assignNumber}
            isLoading={isLoading}
          />
        </TabsContent>
      </Tabs>

      {/* Connect Modal */}
      <ConnectAgentModal
        open={connectModalOpen}
        onOpenChange={setConnectModalOpen}
        phoneNumber={selectedNumber}
        onConnect={connectToAgent}
        existingConnections={existingConnections}
      />
    </PageContainer>
  );
};

export default PhoneNumbers;
