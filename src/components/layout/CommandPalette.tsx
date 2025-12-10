import { useEffect, useState } from "react";
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
  LayoutDashboard,
  Megaphone,
  Bot,
  Phone,
  Settings,
  Building2,
  CreditCard,
  Users,
  Activity,
  FileText,
  User,
  Bell,
} from "lucide-react";

interface CommandPaletteProps {
  variant: "org" | "admin";
}

const orgSearchItems = [
  {
    category: "Pages",
    items: [
      { name: "Dashboard", route: "/app/dashboard", icon: LayoutDashboard },
      { name: "Campaigns", route: "/app/campaigns", icon: Megaphone },
      { name: "Agents", route: "/app/agents", icon: Bot },
      { name: "Call Analytics", route: "/app/calls", icon: Phone },
      { name: "Settings", route: "/app/settings", icon: Settings },
      { name: "My Account", route: "/app/account", icon: User },
      { name: "Notifications", route: "/app/notifications", icon: Bell },
    ],
  },
  {
    category: "Campaigns",
    items: [
      { name: "Renewal Follow-Up", route: "/app/campaigns/1", icon: Megaphone },
      { name: "Lead Re-Activate", route: "/app/campaigns/2", icon: Megaphone },
      { name: "Summer Outreach 2024", route: "/app/campaigns/3", icon: Megaphone },
      { name: "Q4 Sales Push", route: "/app/campaigns/4", icon: Megaphone },
    ],
  },
  {
    category: "Agents",
    items: [
      { name: "Assistant A", route: "/app/agents/1", icon: Bot },
      { name: "Assistant B", route: "/app/agents/2", icon: Bot },
      { name: "Sales Bot Pro", route: "/app/agents/3", icon: Bot },
      { name: "Support Assistant", route: "/app/agents/4", icon: Bot },
    ],
  },
];

const adminSearchItems = [
  {
    category: "Pages",
    items: [
      { name: "Organizations", route: "/admin/organizations", icon: Building2 },
      { name: "Subscriptions", route: "/admin/subscriptions", icon: CreditCard },
      { name: "Sessions", route: "/admin/sessions", icon: Users },
      { name: "System Health", route: "/admin/system", icon: Activity },
      { name: "Admin Profile", route: "/admin/profile", icon: User },
      { name: "Admin Settings", route: "/admin/settings", icon: Settings },
      { name: "Admin Notifications", route: "/admin/notifications", icon: Bell },
    ],
  },
  {
    category: "Organizations",
    items: [
      { name: "Acme Corp", route: "/admin/organizations/1", icon: Building2 },
      { name: "Bluewave Ltd", route: "/admin/organizations/2", icon: Building2 },
      { name: "TechStart Inc", route: "/admin/organizations/3", icon: Building2 },
      { name: "Global Enterprises", route: "/admin/organizations/4", icon: Building2 },
    ],
  },
  {
    category: "System Logs",
    items: [
      { name: "Error Logs", route: "/admin/system?tab=logs", icon: FileText },
      { name: "API Requests", route: "/admin/system?tab=api", icon: FileText },
      { name: "Audit Trail", route: "/admin/system?tab=audit", icon: FileText },
    ],
  },
];

export function CommandPalette({ variant }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const searchItems = variant === "org" ? orgSearchItems : adminSearchItems;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search pages, campaigns, agents, organizations..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {searchItems.map((group, index) => (
          <div key={group.category}>
            <CommandGroup heading={group.category}>
              {group.items.map((item) => (
                <CommandItem
                  key={item.route}
                  onSelect={() => handleSelect(item.route)}
                  className="cursor-pointer"
                >
                  <item.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            {index < searchItems.length - 1 && <CommandSeparator />}
          </div>
        ))}
      </CommandList>
    </CommandDialog>
  );
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false);
  
  const toggle = () => setOpen((prev) => !prev);
  
  return { open, setOpen, toggle };
}
