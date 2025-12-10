import { Moon } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = true }: ThemeToggleProps) {
  const { theme } = useTheme();
  
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between gap-4">
      {showLabel && (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-icon" />
            <Label htmlFor="theme-toggle" className="text-sm font-medium cursor-not-allowed opacity-70">
              Dark Mode
            </Label>
          </div>
          <span className="text-xs text-muted-foreground ml-6">Light Mode coming soon</span>
        </div>
      )}
      <Switch
        id="theme-toggle"
        checked={isDark}
        disabled={true}
        aria-label="Toggle theme (coming soon)"
        className="opacity-50 cursor-not-allowed"
      />
    </div>
  );
}
