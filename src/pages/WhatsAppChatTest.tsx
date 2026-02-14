import { useState } from "react";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function WhatsAppChatTest() {
    const [agentId, setAgentId] = useState("");
    const [activeAgentId, setActiveAgentId] = useState<string | null>(null);

    return (
        <div className="container mx-auto py-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Chat Simulator</h1>
                <p className="text-muted-foreground">Test your AI agent in a simulated web chat environment.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Configuration Column */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Configuration</CardTitle>
                            <CardDescription>Enter the Agent ID you want to test.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="agentId">Agent ID</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="agentId"
                                        placeholder="e.g. 550e8400-e29b..."
                                        value={agentId}
                                        onChange={(e) => setAgentId(e.target.value)}
                                    />
                                    <Button onClick={() => setActiveAgentId(agentId)}>Load Agent</Button>
                                </div>
                            </div>

                            <div className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                <p className="font-semibold mb-1">How to find Agent ID:</p>
                                <ul className="list-disc pl-4 space-y-1">
                                    <li>Check the URL of the agent config page</li>
                                    <li>Look in the `agents` table in Supabase</li>
                                    <li>Use `2435af93-d4e8-4463-a0fd-ad04d57f7750` (if testing locally)</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Chat Widget Column */}
                <div className="flex justify-center">
                    {activeAgentId ? (
                        <ChatWidget agentId={activeAgentId} />
                    ) : (
                        <div className="h-[600px] w-full max-w-md border-2 border-dashed rounded-xl flex items-center justify-center text-muted-foreground bg-muted/10">
                            Enter Agent ID to load chat
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
