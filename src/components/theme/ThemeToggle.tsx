import { Moon, Sun } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemeToggleProps {
  showLabel?: boolean;
  disabled?: boolean;
}

export function ThemeToggle({ showLabel = true, disabled = false }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  
  const isDark = theme === "dark";
  
  // Light mode is coming soon - currently disabled
  const isLightModeDisabled = true;

  const handleToggle = (checked: boolean) => {
    if (!isLightModeDisabled) {
      setTheme(checked ? "dark" : "light");
    }
  };

  return (
    <div className="flex items-center justify-between gap-4">
      {showLabel && (
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="h-4 w-4 text-icon" />
          ) : (
            <Sun className="h-4 w-4 text-icon" />
          )}
          <Label htmlFor="theme-toggle" className="text-sm font-medium cursor-pointer">
            Dark Mode
          </Label>
        </div>
      )}
      <div className="flex items-center gap-2">
        <Switch
          id="theme-toggle"
          checked={isDark}
          onCheckedChange={handleToggle}
          disabled={disabled || isLightModeDisabled}
          aria-label="Toggle theme"
        />
        {isLightModeDisabled && (
          <span className="text-xs text-muted-foreground">
            Light mode coming soon
          </span>
        )}
      </div>
    </div>
  );
}
