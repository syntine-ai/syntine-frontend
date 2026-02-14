import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, User, Bot, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Message {
    role: "user" | "ai";
    content: string;
}

const API_URL = "http://localhost:8003"; // Adjust if needed or use env

export function ChatWidget({ agentId }: { agentId: string }) {
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionLoading, setIsSessionLoading] = useState(false);
    const [streamingContent, setStreamingContent] = useState("");

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Auto-scroll
        if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages, streamingContent]);

    // Format new messages from Realtime
    useEffect(() => {
        if (!sessionId) return;

        const channel = supabase.channel(`widget-${sessionId}`)
            .on(
                "postgres_changes",
                { event: "INSERT", schema: "public", table: "chat_messages", filter: `session_id=eq.${sessionId}` },
                (payload) => {
                    console.log("[ChatWidget] Realtime payload:", payload);
                    const newMsg = payload.new as any;
                    if (newMsg.sender === "human_agent") {
                        console.log("[ChatWidget] Adding human message to UI");
                        setMessages(prev => [...prev, { role: "ai", content: newMsg.content }]);
                    }
                }
            )
            .subscribe((status) => {
                console.log("[ChatWidget] Subscription status:", status);
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    const startSession = async () => {
        if (!agentId) {
            toast.error("Agent ID is required");
            return;
        }

        setIsSessionLoading(true);
        try {
            // 1. Get Token (Optional/Skipped for now as per backend)
            // 2. Create Session
            const res = await fetch(`${API_URL}/chat/session`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent_id: agentId,
                    metadata: { source: "web_test" }
                })
            });

            if (!res.ok) throw new Error(await res.text());

            const data = await res.json();
            setSessionId(data.id);
            setMessages([]); // Clear history on new session
            toast.success("Session started!");
        } catch (e: any) {
            toast.error(`Failed to start session: ${e.message}`);
        } finally {
            setIsSessionLoading(false);
        }
    };

    const sendMessage = async () => {
        if (!input.trim() || !sessionId || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: "user", content: userMsg }]);
        setInput("");
        setIsLoading(true);
        setStreamingContent("");

        try {
            const res = await fetch(`${API_URL}/chat/message`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    session_id: sessionId,
                    content: userMsg
                })
            });

            if (!res.ok) throw new Error(await res.text());
            if (!res.body) throw new Error("No response body");

            const reader = res.body.getReader();
            const decoder = new TextDecoder();
            let aiResponse = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                // Process SSE lines
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.content) {
                                aiResponse += data.content;
                                setStreamingContent(prev => prev + data.content);
                            }
                            if (data.error) {
                                toast.error(data.error.detail);
                            }
                        } catch (e) {
                            console.error("Parse error", e);
                        }
                    }
                }
            }

            // Finalize message
            setMessages(prev => [...prev, { role: "ai", content: aiResponse }]);
            setStreamingContent("");

        } catch (e: any) {
            toast.error(`Send failed: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md h-[600px] flex flex-col shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between py-3 bg-muted/20">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Bot className="w-4 h-4" />
                    AI Chat Test
                </CardTitle>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={startSession}
                    disabled={isSessionLoading}
                    title="Restart Session"
                >
                    <RefreshCw className={`w-4 h-4 ${isSessionLoading ? "animate-spin" : ""}`} />
                </Button>
            </CardHeader>

            <CardContent className="flex-1 p-0 overflow-hidden relative">
                <ScrollArea className="h-full p-4">
                    {!sessionId ? (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-4">
                            <Bot className="w-12 h-12 opacity-20" />
                            <p>Start a session to begin chatting</p>
                            <Button onClick={startSession} disabled={isSessionLoading}>
                                {isSessionLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                                Start Session
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`
                                max-w-[80%] rounded-lg px-3 py-2 text-sm
                                ${m.role === 'user'
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-muted text-foreground'}
                            `}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {streamingContent && (
                                <div className="flex justify-start">
                                    <div className="max-w-[80%] rounded-lg px-3 py-2 text-sm bg-muted text-foreground animate-pulse">
                                        {streamingContent}
                                    </div>
                                </div>
                            )}
                            <div ref={scrollRef} />
                        </div>
                    )}
                </ScrollArea>
            </CardContent>

            <CardFooter className="p-3 bg-muted/20">
                <form
                    className="flex w-full gap-2"
                    onSubmit={(e) => {
                        e.preventDefault();
                        sendMessage();
                    }}
                >
                    <Input
                        placeholder="Type a message..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        disabled={!sessionId || isLoading}
                    />
                    <Button type="submit" size="icon" disabled={!sessionId || isLoading || !input.trim()}>
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </Button>
                </form>
            </CardFooter>
        </Card>
    );
}
