import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Phone, Loader2, CheckCircle2, XCircle, Clock, Globe } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { makeTestCall } from "@/api/services/calls.service";

interface AgentTestPanelProps {
  agentId?: string;
  agentName: string;
  hasPhoneNumber: boolean;
  isDisabled?: boolean;
}

type CallStatus = "idle" | "calling" | "connected" | "completed" | "failed";
type TestType = "phone" | "web";

export function AgentTestPanel({
  agentId,
  agentName,
  hasPhoneNumber,
  isDisabled = false,
}: AgentTestPanelProps) {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [testType, setTestType] = useState<TestType>("phone");

  const handleTestCall = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!phoneNumber.startsWith("+")) {
      toast.error("Phone number must start with country code (e.g., +91)");
      return;
    }

    if (!agentId) {
      toast.error("Please save the agent first before testing");
      return;
    }

    try {
      setCallStatus("calling");

      const response = await makeTestCall(agentId, phoneNumber);

      if (response.success) {
        setCallStatus("connected");
        toast.success("Test call initiated!", {
          description: `Calling ${phoneNumber}...`,
        });

        // Simulate call completion after delay (in real app, this would be websocket/polling)
        setTimeout(() => {
          setCallStatus("completed");
        }, 5000);
      } else {
        setCallStatus("failed");
        toast.error(response.message || "Failed to initiate call");
      }
    } catch (error: any) {
      console.error("Test call error:", error);
      setCallStatus("failed");
      toast.error(error.message || "Failed to make test call");
    }
  };

  const handleWebCall = () => {
    // Web call API will be implemented later
    toast.info("Web Call feature coming soon", {
      description: "This feature is under development.",
    });
  };

  const getStatusBadge = () => {
    switch (callStatus) {
      case "calling":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Calling...
          </Badge>
        );
      case "connected":
        return (
          <Badge className="bg-primary/15 text-primary border-primary/40 gap-1">
            <Phone className="h-3 w-3" />
            Connected
          </Badge>
        );
      case "completed":
        return (
          <Badge className="bg-success/15 text-success border-success/40 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Completed
          </Badge>
        );
      case "failed":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/40 gap-1">
            <XCircle className="h-3 w-3" />
            Failed
          </Badge>
        );
      default:
        return null;
    }
  };

  const isCallInProgress = callStatus === "calling" || callStatus === "connected";
  const canMakePhoneCall = hasPhoneNumber && agentId && !isDisabled && !isCallInProgress;
  const canMakeWebCall = agentId && !isDisabled;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-medium">Test Call</CardTitle>
              <CardDescription>
                Validate agent behavior with a live test call
              </CardDescription>
            </div>
            <AnimatePresence mode="wait">
              {callStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {getStatusBadge()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Type Selector */}
          <div className="space-y-2">
            <Label>Test Type</Label>
            <ToggleGroup
              type="single"
              value={testType}
              onValueChange={(value) => value && setTestType(value as TestType)}
              className="justify-start"
            >
              <ToggleGroupItem value="phone" aria-label="Phone Call" className="gap-2">
                <Phone className="h-4 w-4" />
                Phone Call
              </ToggleGroupItem>
              <ToggleGroupItem value="web" aria-label="Web Call" className="gap-2">
                <Globe className="h-4 w-4" />
                Web Call
              </ToggleGroupItem>
            </ToggleGroup>
          </div>

          <AnimatePresence mode="wait">
            {testType === "phone" ? (
              <motion.div
                key="phone"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Phone Number Input */}
                <div className="space-y-2">
                  <Label htmlFor="test-phone">Phone Number</Label>
                  <div className="flex gap-2">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="test-phone"
                      type="tel"
                      placeholder="+91XXXXXXXXXX"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="flex-1 font-mono"
                      disabled={!canMakePhoneCall}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter the phone number with country code
                  </p>
                </div>

                {/* Start Phone Call Button */}
                <Button
                  onClick={handleTestCall}
                  disabled={!canMakePhoneCall}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isCallInProgress ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {callStatus === "calling" ? "Initiating..." : "In Progress..."}
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4" />
                      Start Test Call
                    </>
                  )}
                </Button>

                {!hasPhoneNumber && (
                  <p className="text-xs text-destructive text-center">
                    ⚠️ No phone number assigned. Connect one in Phone Numbers.
                  </p>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="web"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {/* Web Call Info */}
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Start a web-based test call directly in your browser. No phone number required.
                  </p>
                </div>

                {/* Start Web Call Button */}
                <Button
                  onClick={handleWebCall}
                  disabled={!canMakeWebCall}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Globe className="h-4 w-4" />
                  Start Web Call
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {!agentId && (
            <p className="text-xs text-warning text-center">
              Save the agent first to enable testing.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Test Call Guidelines */}
      <Card className="bg-muted/30">
        <CardContent className="pt-4">
          <h4 className="font-medium text-foreground text-sm mb-2 flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            Test Call Guidelines
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1.5">
            <li>• Calls are limited to 2 minutes for testing</li>
            <li>• Test calls don't count against campaign limits</li>
            <li>• Recording is enabled for quality review</li>
            {testType === "phone" && (
              <li>• Use your own number to test agent responses</li>
            )}
            {testType === "web" && (
              <li>• Ensure microphone access is enabled in your browser</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}