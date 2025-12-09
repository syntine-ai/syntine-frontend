import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Smile, Meh, Frown, AlertTriangle } from "lucide-react";
import { useState } from "react";

export function SentimentRulesCard() {
  const [positiveRule, setPositiveRule] = useState(
    "When customer shows positive sentiment, express appreciation and explore upsell opportunities."
  );
  const [negativeRule, setNegativeRule] = useState(
    "When customer shows frustration, acknowledge their feelings, apologize if appropriate, and focus on resolution."
  );
  const [autoDetect, setAutoDetect] = useState(true);
  const [realTimeAdjust, setRealTimeAdjust] = useState(true);
  const [logAnalysis, setLogAnalysis] = useState(true);

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Sentiment Rules</CardTitle>
        <CardDescription>
          Configure how the agent interprets and responds to customer sentiment
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Positive Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
              <Smile className="h-4 w-4 text-success" />
            </div>
            <Label className="font-medium">Positive Sentiment Response</Label>
          </div>
          <Textarea
            value={positiveRule}
            onChange={(e) => setPositiveRule(e.target.value)}
            className="min-h-[80px] text-sm"
            placeholder="How should the agent respond to positive sentiment?"
          />
        </div>

        {/* Neutral indicator */}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
          <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center">
            <Meh className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium text-foreground">Neutral Sentiment</p>
            <p className="text-sm text-muted-foreground">
              Default conversation flow - no special handling
            </p>
          </div>
        </div>

        {/* Negative Sentiment */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <Frown className="h-4 w-4 text-destructive" />
            </div>
            <Label className="font-medium">Negative Sentiment Response</Label>
          </div>
          <Textarea
            value={negativeRule}
            onChange={(e) => setNegativeRule(e.target.value)}
            className="min-h-[80px] text-sm"
            placeholder="How should the agent respond to negative sentiment?"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Auto-detect sentiment</p>
                <p className="text-sm text-muted-foreground">
                  Automatically analyze customer tone in real-time
                </p>
              </div>
            </div>
            <Switch checked={autoDetect} onCheckedChange={setAutoDetect} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Real-time adjustment</p>
                <p className="text-sm text-muted-foreground">
                  Adjust agent behavior based on sentiment shifts
                </p>
              </div>
            </div>
            <Switch checked={realTimeAdjust} onCheckedChange={setRealTimeAdjust} />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium text-foreground">Log sentiment analysis</p>
                <p className="text-sm text-muted-foreground">
                  Store sentiment data for analytics and reporting
                </p>
              </div>
            </div>
            <Switch checked={logAnalysis} onCheckedChange={setLogAnalysis} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
