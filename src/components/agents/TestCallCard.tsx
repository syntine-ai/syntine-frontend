import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

export function TestCallCard() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestCall = () => {
    if (!phoneNumber.trim()) {
      toast.error("Please enter a phone number");
      return;
    }

    setIsLoading(true);
    
    // Mock call initiation
    setTimeout(() => {
      setIsLoading(false);
      toast.success("Test call initiated", {
        description: `Calling ${phoneNumber}... (This is a mock action)`,
      });
    }, 1500);
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <CardTitle className="text-lg">Test Call</CardTitle>
        <CardDescription>
          Initiate a test call to verify agent behavior
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="testPhone">Phone Number</Label>
          <div className="flex gap-3">
            <Input
              id="testPhone"
              type="tel"
              placeholder="+1 555-0123"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="flex-1"
            />
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                onClick={handleTestCall}
                disabled={isLoading}
                className="gap-2 min-w-[140px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Calling...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4" />
                    Start Test Call
                  </>
                )}
              </Button>
            </motion.div>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
          <h4 className="font-medium text-foreground mb-2">Test Call Guidelines</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>• Calls are limited to 2 minutes for testing</li>
            <li>• Use your own number to test agent responses</li>
            <li>• Test calls do not count against campaign limits</li>
            <li>• Recording is enabled for quality review</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
