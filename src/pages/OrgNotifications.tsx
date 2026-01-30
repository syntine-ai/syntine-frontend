import { PageContainer } from "@/components/layout/PageContainer";
import { NotificationList } from "@/components/notifications/NotificationList";
import { NotificationData } from "@/components/notifications/NotificationItem";

const mockNotifications: NotificationData[] = [
  {
    id: 1,
    title: "Campaign 'Renewal Follow-Up' started",
    message: "Your campaign is now running with concurrency 3. Expected completion in 2 hours.",
    type: "info",
    time: "5 minutes ago",
    read: false,
  },
  {
    id: 2,
    title: "Failed calls spike detected",
    message: "There was a temporary increase in failed calls for 'Summer Outreach'. The issue has been resolved.",
    type: "warning",
    time: "1 hour ago",
    read: false,
  },
  {
    id: 3,
    title: "Agent 'Sales Bot Pro' updated",
    message: "Your changes to the agent's prompt have been saved and deployed.",
    type: "success",
    time: "2 hours ago",
    read: false,
  },
  {
    id: 4,
    title: "Weekly analytics report ready",
    message: "Your weekly call analytics report is now available to view.",
    type: "info",
    time: "5 hours ago",
    read: true,
  },
  {
    id: 5,
    title: "Campaign 'Q4 Sales Push' completed",
    message: "Campaign finished with 89% success rate. 1,247 calls completed successfully.",
    type: "success",
    time: "1 day ago",
    read: true,
  },
  {
    id: 6,
    title: "New contacts imported",
    message: "248 contacts have been added to your caller list from the CSV upload.",
    type: "info",
    time: "2 days ago",
    read: true,
  },
];

export default function OrgNotifications() {
  return (
    <PageContainer
        title="Notifications"
        subtitle="Your activity updates and alerts"
      >
        <div className="max-w-3xl">
          <NotificationList notifications={mockNotifications} variant="org" />
        </div>
      </PageContainer>
  );
}
