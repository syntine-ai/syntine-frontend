import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FilterChipProps {
  label: string;
  isActive?: boolean;
  onToggle?: () => void;
  onRemove?: () => void;
  removable?: boolean;
  className?: string;
}

export function FilterChip({
  label,
  isActive = false,
  onToggle,
  onRemove,
  removable = false,
  className,
}: FilterChipProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all border",
        isActive
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-secondary text-secondary-foreground border-border hover:bg-secondary/80",
        className
      )}
    >
      {label}
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 hover:bg-primary-foreground/20 rounded-full p-0.5"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </motion.button>
  );
}

interface FilterChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterChipGroup({ children, className }: FilterChipGroupProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}
