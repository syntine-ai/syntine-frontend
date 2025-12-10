import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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
    ],
  },
  {
    category: "Campaigns",
    items: [
      { name: "Summer Outreach 2024", route: "/app/campaigns/1", icon: Megaphone },
      { name: "Q4 Sales Push", route: "/app/campaigns/2", icon: Megaphone },
      { name: "Customer Retention", route: "/app/campaigns/3", icon: Megaphone },
    ],
  },
  {
    category: "Agents",
    items: [
      { name: "Sales Bot Pro", route: "/app/agents/1", icon: Bot },
      { name: "Support Assistant", route: "/app/agents/2", icon: Bot },
      { name: "Lead Qualifier", route: "/app/agents/3", icon: Bot },
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
    ],
  },
  {
    category: "Organizations",
    items: [
      { name: "Acme Corporation", route: "/admin/organizations/1", icon: Building2 },
      { name: "TechStart Inc", route: "/admin/organizations/2", icon: Building2 },
      { name: "Global Enterprises", route: "/admin/organizations/3", icon: Building2 },
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
      <CommandInput placeholder="Search pages, campaigns, agents..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        {searchItems.map((group) => (
          <CommandGroup key={group.category} heading={group.category}>
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
