import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Briefcase, Heart, Sparkles, HandHeart } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface TonePreset {
  id: string;
  name: string;
  description: string;
  icon: LucideIcon;
}

const tonePresets: TonePreset[] = [
  {
    id: "professional",
    name: "Professional",
    description: "Formal, business-appropriate tone",
    icon: Briefcase,
  },
  {
    id: "friendly",
    name: "Friendly",
    description: "Warm, approachable conversation style",
    icon: Heart,
  },
  {
    id: "persuasive",
    name: "Persuasive",
    description: "Compelling, action-oriented approach",
    icon: Sparkles,
  },
  {
    id: "empathetic",
    name: "Empathetic",
    description: "Understanding, supportive demeanor",
    icon: HandHeart,
  },
];

interface TonePresetSelectorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function TonePresetSelector({ value, onChange, className }: TonePresetSelectorProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-3", className)}>
      {tonePresets.map((preset) => {
        const isSelected = value === preset.id;
        const Icon = preset.icon;

        return (
          <motion.button
            key={preset.id}
            onClick={() => onChange(preset.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              "relative p-4 rounded-lg border-2 text-left transition-all",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 bg-card"
            )}
          >
            {isSelected && (
              <motion.div
                layoutId="tone-indicator"
                className="absolute inset-0 rounded-lg border-2 border-primary"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <div className="relative">
              <div
                className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center mb-3",
                  isSelected ? "bg-primary/10" : "bg-secondary"
                )}
              >
                <Icon
                  className={cn(
                    "h-5 w-5",
                    isSelected ? "text-primary" : "text-muted-foreground"
                  )}
                />
              </div>
              <h4
                className={cn(
                  "font-medium mb-1",
                  isSelected ? "text-primary" : "text-foreground"
                )}
              >
                {preset.name}
              </h4>
              <p className="text-xs text-muted-foreground">{preset.description}</p>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
