import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";

export type Channel = "voice" | "chat";

interface ChannelContextType {
  activeChannel: Channel;
  setActiveChannel: (channel: Channel) => void;
  availableChannels: Channel[];
}

const ChannelContext = createContext<ChannelContextType | null>(null);

const STORAGE_KEY = "syntine_active_channel";

export function ChannelProvider({ children }: { children: ReactNode }) {
  const { organization } = useAuth();

  const availableChannels: Channel[] = (() => {
    const orgChannels = (organization as any)?.enabled_channels as string[] | undefined;
    if (orgChannels && Array.isArray(orgChannels)) {
      return orgChannels.map((c) => {
        if (c === "whatsapp") return "chat" as Channel;
        return c;
      }).filter((c): c is Channel => c === "voice" || c === "chat");
    }
    return ["voice", "chat"];
  })();

  const [activeChannel, setActiveChannelState] = useState<Channel>(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Channel | null;
    // Migrate old "whatsapp" stored value
    if (stored === "whatsapp" as any) return "chat";
    if (stored && availableChannels.includes(stored)) return stored;
    return availableChannels[0] || "voice";
  });

  const setActiveChannel = (channel: Channel) => {
    setActiveChannelState(channel);
    localStorage.setItem(STORAGE_KEY, channel);
  };

  useEffect(() => {
    if (!availableChannels.includes(activeChannel)) {
      setActiveChannel(availableChannels[0] || "voice");
    }
  }, [availableChannels, activeChannel]);

  return (
    <ChannelContext.Provider value={{ activeChannel, setActiveChannel, availableChannels }}>
      {children}
    </ChannelContext.Provider>
  );
}

export function useChannel() {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannel must be used within a ChannelProvider");
  }
  return context;
}
