import { motion } from "framer-motion";
import { AdminActivityEventCard } from "./AdminActivityEventCard";
import {
  Building2,
  CreditCard,
  Cpu,
  ShieldCheck,
  UserPlus,
  Settings,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface ActivityEvent {
  id: number;
  type: "organization" | "billing" | "system" | "security";
  title: string;
  description: string;
  icon: string;
  time: string;
  timestamp: Date;
  metadata?: Record<string, string>;
}

interface TimelineGroup {
  label: string;
  events: ActivityEvent[];
}

interface AdminActivityTimelineProps {
  events: ActivityEvent[];
}

const iconMap: Record<string, LucideIcon> = {
  Building2,
  CreditCard,
  Cpu,
  ShieldCheck,
  UserPlus,
  Settings,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
};

function groupEventsByDate(events: ActivityEvent[]): TimelineGroup[] {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const thisWeekStart = new Date(today);
  thisWeekStart.setDate(thisWeekStart.getDate() - 7);

  const groups: Record<string, ActivityEvent[]> = {
    Today: [],
    Yesterday: [],
    "This Week": [],
    Earlier: [],
  };

  events.forEach((event) => {
    const eventDate = new Date(event.timestamp);
    if (eventDate >= today) {
      groups["Today"].push(event);
    } else if (eventDate >= yesterday) {
      groups["Yesterday"].push(event);
    } else if (eventDate >= thisWeekStart) {
      groups["This Week"].push(event);
    } else {
      groups["Earlier"].push(event);
    }
  });

  return Object.entries(groups)
    .filter(([, events]) => events.length > 0)
    .map(([label, events]) => ({ label, events }));
}

export function AdminActivityTimeline({ events }: AdminActivityTimelineProps) {
  const groupedEvents = groupEventsByDate(events);

  return (
    <div className="space-y-8">
      {groupedEvents.map((group, groupIndex) => (
        <motion.div
          key={group.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.1, duration: 0.3 }}
        >
          {/* Group Header */}
          <div className="flex items-center gap-3 mb-4">
            <h3 className="text-sm font-semibold text-foreground">{group.label}</h3>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {group.events.length} event{group.events.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Events */}
          <div className="pl-1">
            {group.events.map((event, eventIndex) => {
              const IconComponent = iconMap[event.icon] || Building2;
              return (
                <AdminActivityEventCard
                  key={event.id}
                  icon={IconComponent}
                  title={event.title}
                  description={event.description}
                  time={event.time}
                  type={event.type}
                  metadata={event.metadata}
                  delay={eventIndex * 0.05}
                />
              );
            })}
          </div>
        </motion.div>
      ))}

      {events.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No activity events found.</p>
        </div>
      )}
    </div>
  );
}
