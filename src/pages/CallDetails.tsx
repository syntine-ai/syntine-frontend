import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCallLogs, type CallLogWithDetails } from "@/hooks/useCallLogs";

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
  no_answer: {
    label: "No Answer",
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
  answered: {
    label: "Answered",
    icon: Phone,
    className: "bg-primary/15 text-primary border-primary/30",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-destructive/15 text-destructive border-destructive/30",
  },
  unknown: {
    label: "Unknown Outcome",
    icon: PhoneOff,
    className: "bg-muted text-muted-foreground border-border",
  },
};

const CallDetails = () => {
  const { callId } = useParams<{ callId: string }>();
  // Handle optional explicit ID from route, though param usually captures it.
  const navigate = useNavigate();
  const { getCall, fetchTranscript } = useCallLogs();

  const [callData, setCallData] = useState<CallLogWithDetails | null>(null);
  const [transcript, setTranscript] = useState<any[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCallData = async () => {
      if (!callId) return;
      setIsLoading(true);
      try {
        const data = await getCall(callId);
        setCallData(data);

        if (data) {
          const t = await fetchTranscript(callId);
          // Map DB transcript to UI format
          const mappedTranscript = t.map((item: any) => ({
            id: item.id,
            speaker: item.speaker === "agent" ? "agent" : "caller",
            text: item.content,
            timestamp: item.timestamp
              ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
              : ""
          }));
          setTranscript(mappedTranscript);

          // Fetch recording from call_recordings table
          try {
            const { supabase } = await import("@/integrations/supabase/client");
            const { data: recordingData } = await supabase
              .from("call_recordings")
              .select("storage_path")
              .eq("call_id", callId)
              .single();

            if (recordingData?.storage_path) {
              setRecordingUrl(recordingData.storage_path);
            }
          } catch (recordingError) {
            console.log("No recording found for this call");
          }
        }
      } catch (error) {
        console.error("Failed to load call details", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCallData();
  }, [callId, getCall, fetchTranscript]);

  if (isLoading) {
    return (
      <PageContainer title="Call Details">
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </PageContainer>
    )
  }

  if (!callData) {
    return (
      <PageContainer title="Call Details" subtitle="Call not found">
        <div className="flex flex-col items-center justify-center py-16">
          <p className="text-muted-foreground mb-4">
            The requested call could not be found.
          </p>
          <Button asChild>
            <Link to="/calls">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Call Logs
            </Link>
          </Button>
        </div>
      </PageContainer>
    );
  }

  const outcomeData = outcomeConfig[callData.outcome || ""] || outcomeConfig["unknown"];
  const OutcomeIcon = outcomeData.icon;

  const formatDuration = (seconds?: number | null): string => {
    if (!seconds) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  // Helper to safely access metadata properties
  const getMetadata = (key: string) => {
    return (callData.metadata as any)?.[key];
  };

  // derived from direct columns first, falling back to metadata
  const relatedId = callData.order_id || callData.cart_id || getMetadata('related_id');
  const relatedTo = callData.order_id ? "order" : (callData.cart_id ? "cart" : (getMetadata('related_to') || 'N/A'));

  const orderValue = getMetadata('order_value');
  const cartValue = getMetadata('cart_value');
  const items = getMetadata('items') || [];
  const customerName = callData.contact_name || getMetadata('customer_name') || 'Unknown Customer';
  const customerPhone = callData.to_number; // Assuming outbound call

  return (
    <PageContainer title="Call Details" subtitle="View call outcome, context, and transcript">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back Button */}
        <Button variant="ghost" asChild className="-ml-2">
          <Link to="/calls">
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
            {relatedId && (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted">
                  {relatedTo === "order" ? (
                    <Package className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">
                    {relatedTo === "order" ? "Order" : "Cart"}
                  </p>
                  <Link
                    to={relatedTo === "order" ? `/orders` : `/abandoned-carts`}
                    className="text-primary hover:underline font-mono font-medium"
                  >
                    {relatedId}
                  </Link>
                </div>
              </div>
            )}

            {/* Campaign */}
            {callData.campaign_name && (
              <>
                <div className="h-12 w-px bg-border hidden sm:block" />
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted">
                    <Megaphone className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Campaign</p>
                    <Link
                      to={`/campaigns/${callData.campaign_id}`}
                      className="text-foreground hover:text-primary font-medium"
                    >
                      {callData.campaign_name}
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
                  to={`/agents/${callData.agent_id}`}
                  className="text-foreground hover:text-primary font-medium"
                >
                  {callData.agent_name}
                </Link>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Business Context Section */}
        {(orderValue || cartValue) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <Card className="border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  {relatedTo === "order" ? (
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
                    <span className="text-sm text-foreground">{customerName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground font-mono">{customerPhone}</span>
                  </div>
                  {/* Payment type could be extracted from metadata if available */}
                </div>

                {/* Items */}
                {items && items.length > 0 && (
                  <div className="border-t border-border/50 pt-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Items</p>
                    <div className="space-y-2">
                      {items.map((item: any, index: number) => (
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
                    {formatCurrency(orderValue || cartValue || 0)}
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
            {/* Recording player with real URL from call_recordings table */}
            <CallRecordingPlayer
              recordingUrl={recordingUrl}
              duration={formatDuration(callData.duration_seconds)}
            />
            {!recordingUrl && callData.outcome !== "no_answer" && (
              <p className="text-xs text-muted-foreground mt-2 italic">
                Recording processing — check back in a few moments
              </p>
            )}
            {callData.outcome === "no_answer" && (
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
                      {callData.summary ||
                        (callData.sentiment === "positive" ? "Customer responded positively." :
                          callData.sentiment === "neutral" ? "Neutral conversation." :
                            "Customer expressed dissatisfaction.")}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sentiment analysis not available.
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
            messages={transcript.length > 0 ? transcript : undefined}
            isAvailable={transcript.length > 0}
          />
        </motion.div>
      </motion.div>
    </PageContainer>
  );
};

export default CallDetails;
