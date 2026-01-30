import { useNavigate } from "react-router-dom";
import { User, Settings, LogOut, Shield, Moon, Sun } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/contexts/ThemeContext";

interface UserMenuProps {
  variant: "org" | "admin";
}

export function UserMenu({ variant }: UserMenuProps) {
  const navigate = useNavigate();
  const { signOut, profile, user, isAdmin } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleLogout = async () => {
    await signOut();
    navigate(variant === "admin" ? "/admin/login" : "/auth");
  };

  const isAdminVariant = variant === "admin";
  const isDark = theme === "dark";

  // Get user initials
  const getInitials = () => {
    if (profile?.first_name && profile?.last_name) {
      return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return isAdminVariant ? "AD" : "U";
  };

  const displayName = profile 
    ? `${profile.first_name || ""} ${profile.last_name || ""}`.trim() || "User"
    : "User";
  
  const displayEmail = user?.email || "";

  const menuItems = isAdminVariant
    ? [
        { label: "Admin Profile", route: "/admin/profile", icon: User },
        { label: "Admin Settings", route: "/admin/settings", icon: Settings },
      ]
    : [
        { label: "View Account", route: "/account", icon: User },
        { label: "Settings", route: "/settings", icon: Settings },
      ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
          <AvatarImage src={profile?.avatar_url || ""} />
          <AvatarFallback
            className={
              isAdminVariant
                ? "bg-admin-accent text-admin-accent-foreground"
                : "bg-primary text-primary-foreground"
            }
          >
            {getInitials()}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-popover border-border">
        <DropdownMenuLabel className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={profile?.avatar_url || ""} />
            <AvatarFallback
              className={
                isAdminVariant
                  ? "bg-admin-accent text-admin-accent-foreground"
                  : "bg-primary text-primary-foreground"
              }
            >
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {isAdminVariant && isAdmin ? "Super Admin" : displayName}
            </span>
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {displayEmail}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isAdminVariant && isAdmin && (
          <DropdownMenuItem className="text-admin-accent cursor-pointer" disabled>
            <Shield className="mr-2 h-4 w-4" />
            <span className="text-xs">Admin Access</span>
          </DropdownMenuItem>
        )}
        {menuItems.map((item) => (
          <DropdownMenuItem
            key={item.route}
            className="cursor-pointer"
            onClick={() => navigate(item.route)}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.label}</span>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer flex items-center justify-between"
          onSelect={(e) => e.preventDefault()}
        >
          <div className="flex items-center">
            {isDark ? (
              <Moon className="mr-2 h-4 w-4" />
            ) : (
              <Sun className="mr-2 h-4 w-4" />
            )}
            <span>{isDark ? "Dark Mode" : "Light Mode"}</span>
          </div>
          <Switch
            checked={isDark}
            onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            className="scale-75"
            aria-label="Toggle theme"
          />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
