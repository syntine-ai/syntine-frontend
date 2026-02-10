import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Phone, Loader2, CheckCircle2, XCircle, Clock, Globe, Mic, MicOff, PhoneOff, Variable } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { makeTestCall } from "@/api/services/calls.service";
import { createWebCall } from "@/api/services/webcall.service";
import { useWebCall, type WebCallState } from "@/hooks/useWebCall";

interface AgentTestPanelProps {
  agentId?: string;
  agentName: string;
  hasPhoneNumber: boolean;
  isDisabled?: boolean;
  systemPrompt?: string;
  firstMessage?: string;
}

type CallStatus = "idle" | "calling" | "connected" | "completed" | "failed";
type TestType = "phone" | "web";

/** Extract {{variable}} names from text */
function extractVariables(text: string): string[] {
  const pattern = /\{\{\s*(\w+)\s*\}\}/g;
  const vars: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(text)) !== null) {
    if (!vars.includes(match[1])) {
      vars.push(match[1]);
    }
  }
  return vars;
}

/** Format seconds as mm:ss */
function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

export function AgentTestPanel({
  agentId,
  agentName,
  hasPhoneNumber,
  isDisabled = false,
  systemPrompt = "",
  firstMessage = "",
}: AgentTestPanelProps) {
  const [phoneNumber, setPhoneNumber] = useState("+91");
  const [callStatus, setCallStatus] = useState<CallStatus>("idle");
  const [testType, setTestType] = useState<TestType>("phone");
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  // LiveKit web call hook
  const webCall = useWebCall();

  // Detect variables from both system prompt and first message
  const detectedVariables = useMemo(() => {
    const combined = `${systemPrompt}\n${firstMessage}`;
    return extractVariables(combined);
  }, [systemPrompt, firstMessage]);

  const handleVariableChange = (varName: string, value: string) => {
    setVariableValues((prev) => ({ ...prev, [varName]: value }));
  };

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

      // Build overrides from filled variables (only non-empty values)
      const overrides: Record<string, string> = {};
      for (const [key, val] of Object.entries(variableValues)) {
        if (val.trim()) overrides[key] = val.trim();
      }

      const response = await makeTestCall(
        agentId,
        phoneNumber,
        Object.keys(overrides).length > 0 ? overrides : undefined
      );

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

  const handleWebCall = async () => {
    if (!agentId) {
      toast.error("Please save the agent first before testing");
      return;
    }

    try {
      // Build overrides from filled variables (only non-empty values)
      const overrides: Record<string, string> = {};
      for (const [key, val] of Object.entries(variableValues)) {
        if (val.trim()) overrides[key] = val.trim();
      }

      toast.info("Creating web call session...");

      const response = await createWebCall(
        agentId,
        Object.keys(overrides).length > 0 ? overrides : undefined
      );

      if (!response.success || !response.data) {
        toast.error(response.message || "Failed to create web call");
        return;
      }

      const { url, token } = response.data;

      toast.success("Connecting to agent...", {
        description: "Please allow microphone access when prompted.",
      });

      await webCall.connect(url, token);
    } catch (error: any) {
      console.error("Web call error:", error);
      toast.error(error.message || "Failed to start web call");
    }
  };

  const handleEndWebCall = () => {
    webCall.disconnect();
    toast.info("Web call ended");
  };

  const getPhoneStatusBadge = () => {
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

  const getWebCallBadge = () => {
    switch (webCall.state) {
      case "connecting":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting...
          </Badge>
        );
      case "connected":
        return (
          <Badge className="bg-primary/15 text-primary border-primary/40 gap-1">
            <Globe className="h-3 w-3" />
            {formatDuration(webCall.duration)}
          </Badge>
        );
      case "disconnected":
        return (
          <Badge className="bg-success/15 text-success border-success/40 gap-1">
            <CheckCircle2 className="h-3 w-3" />
            Ended
          </Badge>
        );
      case "error":
        return (
          <Badge className="bg-destructive/15 text-destructive border-destructive/40 gap-1">
            <XCircle className="h-3 w-3" />
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const isCallInProgress = callStatus === "calling" || callStatus === "connected";
  const canMakePhoneCall = hasPhoneNumber && agentId && !isDisabled && !isCallInProgress;
  const canMakeWebCall = agentId && !isDisabled && webCall.state !== "connecting" && webCall.state !== "connected";
  const isWebCallActive = webCall.state === "connecting" || webCall.state === "connected";

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
              {testType === "phone" && callStatus !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {getPhoneStatusBadge()}
                </motion.div>
              )}
              {testType === "web" && webCall.state !== "idle" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  {getWebCallBadge()}
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

                {/* Variable Fill Section for Phone Calls */}
                {detectedVariables.length > 0 && !isCallInProgress && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Variable className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">
                        Prompt Variables
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {detectedVariables.length}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                      {detectedVariables.map((varName) => (
                        <div key={varName} className="space-y-1">
                          <Label
                            htmlFor={`phone-var-${varName}`}
                            className="text-xs font-mono text-muted-foreground"
                          >
                            {`{{${varName}}}`}
                          </Label>
                          <Input
                            id={`phone-var-${varName}`}
                            placeholder={`Enter ${varName.replace(/_/g, " ")}...`}
                            value={variableValues[varName] || ""}
                            onChange={(e) => handleVariableChange(varName, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fill in values for template variables detected in your prompt
                    </p>
                  </div>
                )}

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
                {/* Variable Fill Section */}
                {detectedVariables.length > 0 && !isWebCallActive && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Variable className="h-4 w-4 text-muted-foreground" />
                      <Label className="text-sm font-medium">
                        Prompt Variables
                      </Label>
                      <Badge variant="secondary" className="text-xs">
                        {detectedVariables.length}
                      </Badge>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                      {detectedVariables.map((varName) => (
                        <div key={varName} className="space-y-1">
                          <Label
                            htmlFor={`var-${varName}`}
                            className="text-xs font-mono text-muted-foreground"
                          >
                            {`{{${varName}}}`}
                          </Label>
                          <Input
                            id={`var-${varName}`}
                            placeholder={`Enter ${varName.replace(/_/g, " ")}...`}
                            value={variableValues[varName] || ""}
                            onChange={(e) => handleVariableChange(varName, e.target.value)}
                            className="h-8 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Fill in values for template variables detected in your prompt
                    </p>
                  </div>
                )}

                {/* Web Call Info (no variables) */}
                {detectedVariables.length === 0 && !isWebCallActive && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <p className="text-sm text-muted-foreground">
                      Start a web-based test call directly in your browser. No phone number required.
                    </p>
                  </div>
                )}

                {/* Active Web Call Controls */}
                {isWebCallActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4 space-y-4"
                  >
                    {/* Call Status */}
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {webCall.state === "connecting" ? "Connecting to agent..." : `Speaking with ${agentName}`}
                      </p>
                      {webCall.state === "connected" && (
                        <p className="text-2xl font-mono font-bold text-primary tabular-nums">
                          {formatDuration(webCall.duration)}
                        </p>
                      )}
                      {webCall.state === "connecting" && (
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      )}
                    </div>

                    {/* Call Controls */}
                    {webCall.state === "connected" && (
                      <div className="flex items-center justify-center gap-4">
                        <Button
                          variant={webCall.isMuted ? "destructive" : "outline"}
                          size="icon"
                          className="rounded-full h-12 w-12"
                          onClick={webCall.toggleMute}
                        >
                          {webCall.isMuted ? (
                            <MicOff className="h-5 w-5" />
                          ) : (
                            <Mic className="h-5 w-5" />
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="rounded-full h-14 w-14"
                          onClick={handleEndWebCall}
                        >
                          <PhoneOff className="h-6 w-6" />
                        </Button>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Error Display */}
                {webCall.state === "error" && webCall.errorMessage && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-sm text-destructive">
                      ❌ {webCall.errorMessage}
                    </p>
                  </div>
                )}

                {/* Start / Restart Web Call Button */}
                {!isWebCallActive && (
                  <Button
                    onClick={handleWebCall}
                    disabled={!canMakeWebCall}
                    className="w-full gap-2"
                    size="lg"
                  >
                    <Globe className="h-4 w-4" />
                    {webCall.state === "disconnected" || webCall.state === "error"
                      ? "Start New Web Call"
                      : "Start Web Call"}
                  </Button>
                )}
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
              <>
                <li>• Use your own number to test agent responses</li>
                {detectedVariables.length > 0 && (
                  <li>• Fill in prompt variables above to test with realistic data</li>
                )}
              </>
            )}
            {testType === "web" && (
              <>
                <li>• Ensure microphone access is enabled in your browser</li>
                {detectedVariables.length > 0 && (
                  <li>• Fill in prompt variables above to test with realistic data</li>
                )}
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}