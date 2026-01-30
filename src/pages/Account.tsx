import { PageContainer } from "@/components/layout/PageContainer";
import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { SecuritySettingsCard } from "@/components/account/SecuritySettingsCard";

export default function Account() {
  return (
    <PageContainer
        title="My Account"
        subtitle="Manage your personal details and preferences"
      >
        <div className="grid gap-6 max-w-2xl">
          <AccountProfileCard variant="org" />
          <SecuritySettingsCard variant="org" />
        </div>
      </PageContainer>
  );
}
