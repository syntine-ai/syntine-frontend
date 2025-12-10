import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { AccountProfileCard } from "@/components/account/AccountProfileCard";
import { SecuritySettingsCard } from "@/components/account/SecuritySettingsCard";

export default function AdminProfile() {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Profile"
        subtitle="Identity and access for Syntine administrators"
      >
        <div className="grid gap-6 max-w-2xl">
          <AccountProfileCard variant="admin" />
          <SecuritySettingsCard variant="admin" />
        </div>
      </PageContainer>
    </AdminAppShell>
  );
}
