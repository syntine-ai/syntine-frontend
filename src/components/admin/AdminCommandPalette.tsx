import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Building2,
  CreditCard,
  Cpu,
  Server,
  AlertTriangle,
  ListOrdered,
  Plus,
  Activity,
  Shield,
  LayoutDashboard,
  Settings,
  User,
  Bell,
  Search,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface SearchItem {
  id: string;
  name: string;
  description?: string;
  route: string;
  icon: LucideIcon;
  category: string;
}

interface QuickAction {
  label: string;
  route: string;
  icon: LucideIcon;
}

// Mock search data
const mockOrganizations: SearchItem[] = [
  { id: "org_1", name: "Acme Corporation", description: "Enterprise Plan", route: "/admin/organizations/org_1", icon: Building2, category: "organizations" },
  { id: "org_2", name: "Bluewave Technologies", description: "Growth Plan", route: "/admin/organizations/org_2", icon: Building2, category: "organizations" },
  { id: "org_3", name: "Lumen Digital", description: "Starter Plan", route: "/admin/organizations/org_3", icon: Building2, category: "organizations" },
  { id: "org_4", name: "Synthware Labs", description: "Enterprise Plan", route: "/admin/organizations/org_4", icon: Building2, category: "organizations" },
  { id: "org_5", name: "TechStart Inc", description: "Pro Plan", route: "/admin/organizations/org_5", icon: Building2, category: "organizations" },
];

const mockSubscriptions: SearchItem[] = [
  { id: "sub_1", name: "Acme – Enterprise Plan", description: "$2,450/mo", route: "/admin/subscriptions", icon: CreditCard, category: "subscriptions" },
  { id: "sub_2", name: "Bluewave – Growth Plan", description: "$890/mo", route: "/admin/subscriptions", icon: CreditCard, category: "subscriptions" },
  { id: "sub_3", name: "Lumen – Starter Plan", description: "$49/mo", route: "/admin/subscriptions", icon: CreditCard, category: "subscriptions" },
];

const mockSessions: SearchItem[] = [
  { id: "sess_1", name: "Session 4029 – Telephony Worker", description: "Active", route: "/admin/sessions", icon: Cpu, category: "sessions" },
  { id: "sess_2", name: "Session 1981 – Vector DB", description: "Active", route: "/admin/sessions", icon: Cpu, category: "sessions" },
  { id: "sess_3", name: "Session 1188 – AI Runtime", description: "Active", route: "/admin/sessions", icon: Cpu, category: "sessions" },
];

const mockSystemAlerts: SearchItem[] = [
  { id: "alert_1", name: "AI runtime latency spike", description: "Warning", route: "/admin/system", icon: AlertTriangle, category: "systemAlerts" },
  { id: "alert_2", name: "Database connection reset", description: "Error", route: "/admin/system", icon: AlertTriangle, category: "systemAlerts" },
  { id: "alert_3", name: "Unusual traffic from US-EAST", description: "Info", route: "/admin/system", icon: AlertTriangle, category: "systemAlerts" },
];

const mockActivityLogs: SearchItem[] = [
  { id: "log_1", name: "New organization created", description: "10m ago", route: "/admin/activity", icon: ListOrdered, category: "activityLogs" },
  { id: "log_2", name: "Subscription upgraded", description: "1h ago", route: "/admin/activity", icon: ListOrdered, category: "activityLogs" },
  { id: "log_3", name: "Admin login from new device", description: "3h ago", route: "/admin/activity", icon: ListOrdered, category: "activityLogs" },
  { id: "log_4", name: "System auto-restart", description: "Yesterday", route: "/admin/activity", icon: ListOrdered, category: "activityLogs" },
];

const adminPages: SearchItem[] = [
  { id: "page_1", name: "Dashboard", route: "/admin/dashboard", icon: LayoutDashboard, category: "pages" },
  { id: "page_2", name: "Organizations", route: "/admin/organizations", icon: Building2, category: "pages" },
  { id: "page_3", name: "Subscriptions", route: "/admin/subscriptions", icon: CreditCard, category: "pages" },
  { id: "page_4", name: "Sessions", route: "/admin/sessions", icon: Cpu, category: "pages" },
  { id: "page_5", name: "System Status", route: "/admin/system", icon: Server, category: "pages" },
  { id: "page_6", name: "Activity Logs", route: "/admin/activity", icon: ListOrdered, category: "pages" },
  { id: "page_7", name: "Admin Profile", route: "/admin/profile", icon: User, category: "pages" },
  { id: "page_8", name: "Admin Settings", route: "/admin/settings", icon: Settings, category: "pages" },
  { id: "page_9", name: "Notifications", route: "/admin/notifications", icon: Bell, category: "pages" },
];

const quickActions: QuickAction[] = [
  { label: "Create Organization", route: "/admin/organizations?action=new", icon: Plus },
  { label: "View System Status", route: "/admin/system", icon: Activity },
  { label: "View Activity Logs", route: "/admin/activity", icon: ListOrdered },
];

const allSearchItems = [
  ...adminPages,
  ...mockOrganizations,
  ...mockSubscriptions,
  ...mockSessions,
  ...mockSystemAlerts,
  ...mockActivityLogs,
];

const categoryConfig: Record<string, { label: string; icon: LucideIcon }> = {
  pages: { label: "Pages", icon: LayoutDashboard },
  organizations: { label: "Organizations", icon: Building2 },
  subscriptions: { label: "Subscriptions", icon: CreditCard },
  sessions: { label: "Sessions", icon: Cpu },
  systemAlerts: { label: "System Alerts", icon: AlertTriangle },
  activityLogs: { label: "Activity Logs", icon: ListOrdered },
};

interface AdminCommandPaletteProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AdminCommandPalette({ open: controlledOpen, onOpenChange }: AdminCommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Keyboard shortcut
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen(!open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, setOpen]);

  // Filter results based on search
  const filteredResults = useMemo(() => {
    if (!search.trim()) {
      // Show pages and quick actions when no search
      return {
        pages: adminPages,
        quickActions,
        organizations: [],
        subscriptions: [],
        sessions: [],
        systemAlerts: [],
        activityLogs: [],
      };
    }

    const query = search.toLowerCase();
    const filterItems = (items: SearchItem[]) =>
      items.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query)
      );

    return {
      pages: filterItems(adminPages).slice(0, 5),
      quickActions: quickActions.filter((a) => a.label.toLowerCase().includes(query)),
      organizations: filterItems(mockOrganizations).slice(0, 5),
      subscriptions: filterItems(mockSubscriptions).slice(0, 5),
      sessions: filterItems(mockSessions).slice(0, 5),
      systemAlerts: filterItems(mockSystemAlerts).slice(0, 5),
      activityLogs: filterItems(mockActivityLogs).slice(0, 5),
    };
  }, [search]);

  const handleSelect = (route: string) => {
    setOpen(false);
    setSearch("");
    navigate(route);
  };

  const hasResults =
    filteredResults.pages.length > 0 ||
    filteredResults.quickActions.length > 0 ||
    filteredResults.organizations.length > 0 ||
    filteredResults.subscriptions.length > 0 ||
    filteredResults.sessions.length > 0 ||
    filteredResults.systemAlerts.length > 0 ||
    filteredResults.activityLogs.length > 0;

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput
        placeholder="Search organizations, sessions, alerts, logs..."
        value={search}
        onValueChange={setSearch}
      />
      <CommandList>
        {!hasResults && <CommandEmpty>No results found.</CommandEmpty>}

        {/* Quick Actions */}
        {filteredResults.quickActions.length > 0 && (
          <>
            <CommandGroup heading="Quick Actions">
              {filteredResults.quickActions.map((action) => (
                <CommandItem
                  key={action.label}
                  onSelect={() => handleSelect(action.route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 mr-3">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="font-medium">{action.label}</span>
                  <Zap className="ml-auto h-3 w-3 text-muted-foreground" />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Pages */}
        {filteredResults.pages.length > 0 && (
          <>
            <CommandGroup heading="Pages">
              {filteredResults.pages.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-3 h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Organizations */}
        {filteredResults.organizations.length > 0 && (
          <>
            <CommandGroup heading="Organizations">
              {filteredResults.organizations.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-primary/10 mr-3">
                    <Building2 className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Subscriptions */}
        {filteredResults.subscriptions.length > 0 && (
          <>
            <CommandGroup heading="Subscriptions">
              {filteredResults.subscriptions.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-success/10 mr-3">
                    <CreditCard className="h-4 w-4 text-success" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Sessions */}
        {filteredResults.sessions.length > 0 && (
          <>
            <CommandGroup heading="Sessions">
              {filteredResults.sessions.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-warning/10 mr-3">
                    <Cpu className="h-4 w-4 text-warning" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* System Alerts */}
        {filteredResults.systemAlerts.length > 0 && (
          <>
            <CommandGroup heading="System Alerts">
              {filteredResults.systemAlerts.map((item) => (
                <CommandItem
                  key={item.id}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-center h-6 w-6 rounded-md bg-destructive/10 mr-3">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{item.name}</span>
                    {item.description && (
                      <span className="text-xs text-muted-foreground">{item.description}</span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {/* Activity Logs */}
        {filteredResults.activityLogs.length > 0 && (
          <CommandGroup heading="Activity Logs">
            {filteredResults.activityLogs.map((item) => (
              <CommandItem
                key={item.id}
                onSelect={() => handleSelect(item.route)}
                className="cursor-pointer"
              >
                <div className="flex items-center justify-center h-6 w-6 rounded-md bg-muted mr-3">
                  <ListOrdered className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium">{item.name}</span>
                  {item.description && (
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}
