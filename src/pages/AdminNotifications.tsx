import { AdminAppShell } from "@/components/layout/AdminAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationData } from "@/components/notifications/NotificationItem";

const mockNotifications: NotificationData[] = [
  {
    id: 101,
    title: "New organization onboarded",
    message: "Acme Corp (Trial) was created and is now active. User: john@acmecorp.com",
    type: "info",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 102,
    title: "System Error: Telephony provider",
    message: "Latency increased above 500ms threshold. Auto-recovery initiated.",
    type: "error",
    time: "45 minutes ago",
    read: false,
  },
  {
    id: 103,
    title: "Subscription upgraded",
    message: "TechStart Inc upgraded from Pro to Enterprise plan. MRR increased by $450.",
    type: "success",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 104,
    title: "High API error rate detected",
    message: "Error rate exceeded 5% threshold on /api/calls endpoint. Investigation required.",
    type: "warning",
    time: "6 hours ago",
    read: true,
  },
  {
    id: 105,
    title: "System maintenance completed",
    message: "Scheduled database maintenance completed successfully. No downtime recorded.",
    type: "success",
    time: "1 day ago",
    read: true,
  },
  {
    id: 106,
    title: "New admin user added",
    message: "support@syntine.io was added as a Support Admin by super.admin@syntine.io.",
    type: "info",
    time: "2 days ago",
    read: true,
  },
  {
    id: 107,
    title: "Organization suspended",
    message: "BadActor LLC was suspended due to ToS violation. All campaigns paused.",
    type: "warning",
    time: "3 days ago",
    read: true,
  },
];

export default function AdminNotifications() {
  return (
    <AdminAppShell>
      <PageContainer
        title="Admin Notifications"
        subtitle="Platform-wide system alerts and admin activity"
      >
        <div className="max-w-3xl">
          <NotificationList notifications={mockNotifications} variant="admin" />
        </div>
      </PageContainer>
    </AdminAppShell>
  );
}
