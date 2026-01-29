import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CallRecordingPlayer } from "@/components/calls/CallRecordingPlayer";
import { CallTranscriptChat } from "@/components/calls/CallTranscriptChat";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  PhoneOff,
  ShoppingCart,
  Phone,
  CreditCard,
  User,
  Bot,
  Megaphone,
  Package,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getCallById, formatCurrency } from "@/data/demoOutcomesData";

const outcomeConfig: Record<string, { label: string; icon: any; className: string }> = {
  confirmed: {
    label: "Order Confirmed",
    icon: CheckCircle2,
    className: "bg-success/15 text-success border-success/30",
  },
  rejected: {
    label: "Order Rejected",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  no_response: {
    label: "No Response",
    icon: PhoneOff,
    className: "bg-muted text-muted-foreground border-border",
  },
  recovered: {
    label: "Cart Recovered",
    icon: ShoppingCart,
    className: "bg-success/15 text-success border-success/30",
  },
  not_recovered: {
    label: "Not Recovered",
    icon: ShoppingCart,
    className: "bg-warning/15 text-warning border-warning/30",
  },
  handled: {
    label: "Call Handled",
    icon: Phone,
    className: "bg-primary/15 text-primary border-primary/30",
  },
};

// Mock transcript data
const mockTranscript = [
  { id: 1, speaker: "agent" as const, text: "Hello! This is a call from the store to confirm your recent order.", timestamp: "0:02" },
  { id: 2, speaker: "caller" as const, text: "Yes, hello. What order are you referring to?", timestamp: "0:08" },
  { id: 3, speaker: "agent" as const, text: "I'm calling about your Cash on Delivery order placed today. Would you like to confirm this order for delivery?", timestamp: "0:14" },
  { id: 4, speaker: "caller" as const, text: "Yes, I confirm. Please proceed with the delivery.", timestamp: "0:22" },
  { id: 5, speaker: "agent" as const, text: "Thank you for confirming! Your order will be dispatched shortly. Have a great day!", timestamp: "0:28" },
];

const CallDetails = () => {
  const { callId } = useParams<{ callId: string }>();
  const navigate = useNavigate();
  
  const callData = callId ? getCallById(callId) : null;

  if (!callData) {
    return (
      <OrgAppShell>
        <PageContainer title="Call Details" subtitle="Call not found">
          <div className="flex flex-col items-center justify-center py-16">
            <p className="text-muted-foreground mb-4">
              The requested call could not be found.
            </p>
            <Button asChild>
              <Link to="/app/calls">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Call Logs
              </Link>
            </Button>
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  const outcomeData = outcomeConfig[callData.outcome];
  const OutcomeIcon = outcomeData.icon;

  const formatDuration = (seconds: number): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <OrgAppShell>
      <PageContainer title="Call Details" subtitle="View call outcome, context, and transcript">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button variant="ghost" asChild className="-ml-2">
            <Link to="/app/calls">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Logs
            </Link>
          </Button>

          {/* Top Summary Strip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card border border-border rounded-lg p-6"
          >
            <div className="flex flex-wrap items-center gap-6">
              {/* Outcome Badge - Large */}
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-3 rounded-full",
                  outcomeData.className
                )}>
                  <OutcomeIcon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Outcome</p>
                  <p className="text-lg font-semibold text-foreground">{outcomeData.label}</p>
                </div>
              </div>

              {/* Divider */}
              <div className="h-12 w-px bg-border hidden sm:block" />

              {/* Related Order/Cart */}
              {callData.relatedId && (
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    {callData.relatedTo === "order" ? (
                      <Package className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">
                      {callData.relatedTo === "order" ? "Order" : "Cart"}
                    </p>
                    <Link
                      to={callData.relatedTo === "order" ? `/app/orders` : `/app/abandoned-carts`}
                      className="text-primary hover:underline font-mono font-medium"
                    >
                      {callData.relatedId}
                    </Link>
                  </div>
                </div>
              )}

              {/* Campaign */}
              {callData.campaign && (
                <>
                  <div className="h-12 w-px bg-border hidden sm:block" />
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <Megaphone className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wide">Campaign</p>
                      <Link
                        to={`/app/campaigns/${callData.campaign.toLowerCase().replace(/ /g, "_")}_campaign`}
                        className="text-foreground hover:text-primary font-medium"
                      >
                        {callData.campaign}
                      </Link>
                    </div>
                  </div>
                </>
              )}

              {/* Agent */}
              <div className="h-12 w-px bg-border hidden sm:block" />
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  <Bot className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Agent</p>
                  <Link
                    to={`/app/agents/${callData.agent.toLowerCase().replace(/ /g, "_")}`}
                    className="text-foreground hover:text-primary font-medium"
                  >
                    {callData.agent}
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Business Context Section */}
          {(callData.orderValue || callData.cartValue) && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    {callData.relatedTo === "order" ? (
                      <>
                        <Package className="h-5 w-5 text-primary" />
                        Order Details
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="h-5 w-5 text-primary" />
                        Cart Details
                      </>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Customer Info */}
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{callData.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground font-mono">{callData.customerPhone}</span>
                    </div>
                    {callData.paymentType && (
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="outline" className="uppercase text-xs">
                          {callData.paymentType}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Items */}
                  {callData.items && callData.items.length > 0 && (
                    <div className="border-t border-border/50 pt-4">
                      <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                      <div className="space-y-2">
                        {callData.items.map((item, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-foreground">{item.title}</span>
                              <span className="text-xs text-muted-foreground">× {item.quantity}</span>
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {formatCurrency(item.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="border-t border-border/50 pt-4 flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">Total Value</span>
                    <span className="text-lg font-bold text-primary">
                      {formatCurrency(callData.orderValue || callData.cartValue || 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Recording and Transcript */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CallRecordingPlayer
                recordingUrl={callData.outcome !== "no_response" ? "demo-recording" : undefined}
                duration={formatDuration(callData.duration)}
              />
              {callData.outcome === "no_response" && (
                <p className="text-xs text-muted-foreground mt-2 italic">
                  Recording not available — call was not answered.
                </p>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <Card className="border-border/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">Conversation Insight</CardTitle>
                </CardHeader>
                <CardContent>
                  {callData.sentiment ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">Sentiment:</span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "font-medium capitalize",
                            callData.sentiment === "positive" && "bg-success/15 text-success border-success/30",
                            callData.sentiment === "neutral" && "bg-warning/15 text-warning border-warning/30",
                            callData.sentiment === "negative" && "bg-destructive/15 text-destructive border-destructive/30"
                          )}
                        >
                          {callData.sentiment}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {callData.sentiment === "positive" && "Customer responded positively and confirmed the request."}
                        {callData.sentiment === "neutral" && "Customer was neutral during the conversation."}
                        {callData.sentiment === "negative" && "Customer expressed dissatisfaction or declined."}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Sentiment analysis not available for unanswered calls.
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CallTranscriptChat
              messages={callData.outcome !== "no_response" ? mockTranscript : undefined}
              isAvailable={callData.outcome !== "no_response"}
            />
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallDetails;
