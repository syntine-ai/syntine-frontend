import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/contexts/ThemeContext";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface ThemeToggleProps {
  showLabel?: boolean;
}

export function ThemeToggle({ showLabel = false }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  if (showLabel) {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {isDark ? (
            <Moon className="h-4 w-4 text-icon" />
          ) : (
            <Sun className="h-4 w-4 text-icon" />
          )}
          <span className="text-sm font-medium">
            {isDark ? "Dark Mode" : "Light Mode"}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-8 w-8"
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 text-icon hover:text-foreground"
          aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        >
          {isDark ? (
            <Sun className="h-[18px] w-[18px]" />
          ) : (
            <Moon className="h-[18px] w-[18px]" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isDark ? "Light mode" : "Dark mode"}</p>
      </TooltipContent>
    </Tooltip>
  );
}
