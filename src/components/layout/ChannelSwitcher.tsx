import { Phone, MessageCircle } from "lucide-react";
import { useChannel, Channel } from "@/contexts/ChannelContext";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const channels: { id: Channel; label: string; icon: typeof Phone }[] = [
  { id: "voice", label: "Voice", icon: Phone },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle },
];

export function ChannelSwitcher() {
  const { activeChannel, setActiveChannel, availableChannels } = useChannel();
  const navigate = useNavigate();

  const visibleChannels = channels.filter((c) => availableChannels.includes(c.id));
  if (visibleChannels.length <= 1) return null;

  return (
    <div className="flex items-center gap-0.5 bg-muted/40 rounded-lg p-0.5">
      {visibleChannels.map((channel) => {
        const isActive = activeChannel === channel.id;
        const isWhatsApp = channel.id === "whatsapp";

        return (
          <Tooltip key={channel.id} delayDuration={0}>
            <TooltipTrigger asChild>
              <button
                onClick={() => {
                  setActiveChannel(channel.id);
                  navigate(channel.id === "whatsapp" ? "/wa/dashboard" : "/dashboard");
                }}
                className={cn(
                  "relative flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? isWhatsApp
                      ? "bg-[hsl(142,71%,45%)]/15 text-[hsl(142,71%,45%)]"
                      : "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                <channel.icon className="h-4 w-4 shrink-0" />
                <span>{channel.label}</span>
              </button>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="font-medium">
              Switch to {channel.label}
            </TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
