import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Bot } from "lucide-react";

export function WhatsAppAgentConfigPanel() {
  const [config, setConfig] = useState({
    botName: "WhatsApp Bot",
    tone: "friendly",
    language: "English",
    systemPrompt: "",
    customInstructions: "",
    isActive: false,
  });

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[hsl(142,71%,45%)]/10 flex items-center justify-center">
              <Bot className="h-5 w-5 text-[hsl(142,71%,45%)]" />
            </div>
            <CardTitle className="text-lg">Agent Configuration</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Label htmlFor="agent-active" className="text-sm text-muted-foreground">Active</Label>
            <Switch
              id="agent-active"
              checked={config.isActive}
              onCheckedChange={(v) => setConfig((c) => ({ ...c, isActive: v }))}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-sm">Bot Name</Label>
            <Input
              value={config.botName}
              onChange={(e) => setConfig((c) => ({ ...c, botName: e.target.value }))}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Tone</Label>
            <Select value={config.tone} onValueChange={(v) => setConfig((c) => ({ ...c, tone: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label className="text-sm">Language</Label>
            <Select value={config.language} onValueChange={(v) => setConfig((c) => ({ ...c, language: v }))}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">Hindi</SelectItem>
                <SelectItem value="Hinglish">Hinglish</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">System Prompt</Label>
          <Textarea
            rows={3}
            placeholder="Define how the bot should behave..."
            value={config.systemPrompt}
            onChange={(e) => setConfig((c) => ({ ...c, systemPrompt: e.target.value }))}
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm">Custom Instructions</Label>
          <Textarea
            rows={2}
            placeholder="Additional instructions for specific scenarios..."
            value={config.customInstructions}
            onChange={(e) => setConfig((c) => ({ ...c, customInstructions: e.target.value }))}
          />
        </div>

        <div className="flex justify-end">
          <Button size="sm">Save Configuration</Button>
        </div>
      </CardContent>
    </Card>
  );
}
