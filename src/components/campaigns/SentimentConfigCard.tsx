import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown } from "lucide-react";
import { useState } from "react";

export function SentimentConfigCard() {
  const [positiveAction, setPositiveAction] = useState("Continue conversation and offer upsell opportunities.");
  const [negativeAction, setNegativeAction] = useState("Apologize, attempt resolution, escalate if needed.");
  const [autoEscalate, setAutoEscalate] = useState(true);
  const [logSentiment, setLogSentiment] = useState(true);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Sentiment Handling</CardTitle>
        <CardDescription>
          Configure how the agent responds based on detected customer sentiment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Smile className="h-4 w-4 text-success" />
            </div>
            <Label className="font-medium">Positive Sentiment Action</Label>
          </div>
          <Textarea
            value={positiveAction}
            onChange={(e) => setPositiveAction(e.target.value)}
            placeholder="What should the agent do when sentiment is positive?"
            className="min-h-[80px]"
          />
        </div>

        {/* Neutral Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
              <Meh className="h-4 w-4 text-muted-foreground" />
            </div>
            <Label className="font-medium">Neutral Sentiment</Label>
          </div>
          <p className="text-sm text-muted-foreground">
            Default behavior - continue with standard conversation flow.
          </p>
        </div>

        {/* Negative Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Frown className="h-4 w-4 text-destructive" />
            </div>
            <Label className="font-medium">Negative Sentiment Action</Label>
          </div>
          <Textarea
            value={negativeAction}
            onChange={(e) => setNegativeAction(e.target.value)}
            placeholder="What should the agent do when sentiment is negative?"
            className="min-h-[80px]"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Auto-escalate negative calls</p>
              <p className="text-sm text-muted-foreground">
                Automatically flag calls with negative sentiment for human review
              </p>
            </div>
            <Switch checked={autoEscalate} onCheckedChange={setAutoEscalate} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Log sentiment data</p>
              <p className="text-sm text-muted-foreground">
                Store sentiment analysis for reporting
              </p>
            </div>
            <Switch checked={logSentiment} onCheckedChange={setLogSentiment} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
