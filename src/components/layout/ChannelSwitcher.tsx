import { Phone, MessageCircle } from "lucide-react";
import { useChannel, Channel } from "@/contexts/ChannelContext";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const channels: { id: Channel; label: string; icon: typeof Phone }[] = [
  { id: "voice", label: "Voice", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

interface ChannelSwitcherProps {
  isCollapsed?: boolean;
}

export function ChannelSwitcher({ isCollapsed }: ChannelSwitcherProps) {
  const { activeChannel, setActiveChannel, availableChannels } = useChannel();

  const visibleChannels = channels.filter((c) => availableChannels.includes(c.id));
  if (visibleChannels.length <= 1) return null;

  return (
    <div className={cn("px-3 pb-2", isCollapsed ? "flex flex-col items-center gap-1" : "flex gap-1 bg-muted/30 rounded-lg p-1")}>
      {visibleChannels.map((channel) => {
        const isActive = activeChannel === channel.id;
        const isWhatsApp = channel.id === "whatsapp";

        const button = (
          <button
            key={channel.id}
            onClick={() => setActiveChannel(channel.id)}
            className={cn(
              "relative flex items-center gap-2 rounded-md transition-all duration-200",
              isCollapsed ? "p-2 justify-center" : "flex-1 px-3 py-1.5 text-sm font-medium justify-center",
              isActive
                ? isWhatsApp
                  ? "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]"
                  : "bg-primary/15 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <channel.icon className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span>{channel.label}</span>}
          </button>
        );

        if (isCollapsed) {
          return (
            <Tooltip key={channel.id} delayDuration={0}>
              <TooltipTrigger asChild>{button}</TooltipTrigger>
              <TooltipContent side="right" className="font-medium">
                {channel.label}
              </TooltipContent>
            </Tooltip>
          );
        }
        return button;
      })}
    </div>
  );
}
