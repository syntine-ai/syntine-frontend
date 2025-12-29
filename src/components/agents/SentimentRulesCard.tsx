import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardCheck } from "lucide-react";
import { useState } from "react";

interface SentimentRulesCardProps {
  value?: string;
  onChange?: (value: string) => void;
}

export function SentimentRulesCard({ value, onChange }: SentimentRulesCardProps) {
  const [criteria, setCriteria] = useState(
    value || "After the call ends, analyze the conversation to determine:\n- Overall customer satisfaction\n- Key issues discussed\n- Resolution status\n- Follow-up actions needed"
  );

  const handleChange = (newValue: string) => {
    setCriteria(newValue);
    onChange?.(newValue);
  };

  return (
    <Card className="border-border/50 h-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-lg">Post-Call Analysis</CardTitle>
            <CardDescription>
              Define criteria for analyzing the call after it ends
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Textarea
          value={criteria}
          onChange={(e) => handleChange(e.target.value)}
          className="min-h-[180px] text-sm resize-none"
          placeholder="Enter the criteria for post-call analysis..."
        />
      </CardContent>
    </Card>
  );
}
