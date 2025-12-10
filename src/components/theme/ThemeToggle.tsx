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

  const handleToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
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
            {isDark ? "Dark Mode" : "Light Mode"}
          </Label>
        </div>
      )}
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={handleToggle}
        disabled={disabled}
        aria-label="Toggle theme"
      />
    </div>
  );
}
