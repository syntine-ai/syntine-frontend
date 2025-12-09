import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, RotateCcw, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface PromptEditorCardProps {
  value: string;
  onChange: (value: string) => void;
}

const defaultPrompt = `You are a helpful AI assistant for customer service calls.

Guidelines:
- Be polite and professional at all times
- Listen carefully to customer concerns
- Provide clear and concise answers
- Offer solutions when possible
- Escalate to a human agent if needed

Remember to:
- Introduce yourself at the start of each call
- Confirm customer details before proceeding
- Summarize key points at the end of the call`;

export function PromptEditorCard({ value, onChange }: PromptEditorCardProps) {
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    toast.success("Prompt copied to clipboard");
  };

  const handleReset = () => {
    onChange(defaultPrompt);
    toast.success("Prompt reset to default");
  };

  const handleEnhance = () => {
    toast.success("AI enhancement coming soon", {
      description: "This feature will use AI to improve your prompt",
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-lg">Base Prompt</CardTitle>
          <CardDescription>
            Define how the AI agent should behave during calls
          </CardDescription>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy} className="gap-1.5">
            <Copy className="h-3.5 w-3.5" />
            Copy
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset} className="gap-1.5">
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </Button>
          <Button variant="outline" size="sm" onClick={handleEnhance} className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Enhance
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-[300px] font-mono text-sm resize-y"
          placeholder="Enter your agent's base prompt instructions..."
        />
        <p className="text-xs text-muted-foreground mt-2">
          {value.length} characters • {value.split(/\s+/).filter(Boolean).length} words
        </p>
      </CardContent>
    </Card>
  );
}
