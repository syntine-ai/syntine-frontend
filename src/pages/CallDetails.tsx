import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { CallMetadataBar, CallMetadata } from "@/components/calls/CallMetadataBar";
import { CallRecordingPlayer } from "@/components/calls/CallRecordingPlayer";
import { CallSentimentCard } from "@/components/calls/CallSentimentCard";
import { CallTranscriptChat } from "@/components/calls/CallTranscriptChat";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Mock data for call details
const mockCallDetails: Record<string, {
  metadata: CallMetadata;
  tags: string[];
  recording: string | undefined;
  sentiment: {
    sentiment: "positive" | "neutral" | "negative";
    confidenceScore: number;
    summary: string;
  } | null;
  transcript: Array<{
    id: number;
    speaker: "agent" | "caller";
    text: string;
    timestamp: string;
    latency?: string;
  }> | null;
}> = {
  "call-001": {
    metadata: {
      callUuid: "call-001-uuid-abc123",
      phone: "+91 98765 43210",
      startTime: "Dec 28, 2024 10:30 AM",
      duration: "2:34",
      organization: "42487a3f",
      agent: "Agent A",
      status: "answered",
    },
    tags: ["callback request", "scheduling"],
    recording: "mock-recording-url",
    sentiment: {
      sentiment: "positive",
      confidenceScore: 87,
      summary: "The caller expressed interest in scheduling a follow-up demo. They were pleased with the initial presentation and requested additional documentation. The conversation ended on a positive note with a scheduled callback.",
    },
    transcript: [
      { id: 1, speaker: "agent", text: "Hello! This is Sarah from Syntine. Am I speaking with John?", timestamp: "0:00", latency: "120ms" },
      { id: 2, speaker: "caller", text: "Yes, this is John. How can I help you?", timestamp: "0:05" },
      { id: 3, speaker: "agent", text: "Hi John! I'm calling regarding the demo you requested for our AI calling platform. Do you have a few minutes to discuss?", timestamp: "0:08", latency: "95ms" },
      { id: 4, speaker: "caller", text: "Sure, I was actually looking forward to this call. Go ahead.", timestamp: "0:18" },
      { id: 5, speaker: "agent", text: "Great! I'd love to walk you through how our AI agents can handle outbound calls. They can qualify leads, schedule appointments, and even handle objections.", timestamp: "0:22", latency: "110ms" },
      { id: 6, speaker: "caller", text: "That sounds interesting. What kind of integration options do you have?", timestamp: "0:35" },
      { id: 7, speaker: "agent", text: "We integrate with most major CRMs including Salesforce, HubSpot, and Pipedrive. We also have a robust API for custom integrations.", timestamp: "0:40", latency: "88ms" },
      { id: 8, speaker: "caller", text: "Perfect. Can you send me some documentation? I'd like to review it with my team.", timestamp: "0:55" },
      { id: 9, speaker: "agent", text: "Absolutely! I'll send that over right away. Should I schedule a follow-up call for next week to answer any questions?", timestamp: "1:02", latency: "102ms" },
    ],
  },
  "call-002": {
    metadata: {
      callUuid: "call-002-uuid-def456",
      phone: null,
      startTime: "Dec 28, 2024 10:25 AM",
      duration: "1:15",
      organization: "42487a3f",
      agent: "Agent B",
      status: "ended",
    },
    tags: ["web call", "quick inquiry"],
    recording: "mock-recording-url",
    sentiment: {
      sentiment: "neutral",
      confidenceScore: 72,
      summary: "Brief web call inquiry about pricing. The caller was comparing options and requested email follow-up with pricing details.",
    },
    transcript: [
      { id: 1, speaker: "agent", text: "Thank you for calling Syntine. How can I assist you today?", timestamp: "0:00", latency: "85ms" },
      { id: 2, speaker: "caller", text: "Hi, I'm looking for pricing information for your AI calling service.", timestamp: "0:06" },
      { id: 3, speaker: "agent", text: "I'd be happy to help with that. Are you looking for outbound calling, inbound support, or both?", timestamp: "0:12", latency: "92ms" },
      { id: 4, speaker: "caller", text: "Mainly outbound for sales calls. About 500 calls per month.", timestamp: "0:20" },
      { id: 5, speaker: "agent", text: "For that volume, our Growth plan would be ideal. It includes unlimited AI agents and priority support. Shall I email you the complete pricing breakdown?", timestamp: "0:28", latency: "105ms" },
    ],
  },
  "call-003": {
    metadata: {
      callUuid: "call-003-uuid-ghi789",
      phone: "+1 555 123 4567",
      startTime: "Dec 28, 2024 10:20 AM",
      duration: null,
      organization: "7b3e2a1c",
      agent: "Agent A",
      status: "missed",
    },
    tags: ["outbound", "no answer"],
    recording: undefined,
    sentiment: null,
    transcript: null,
  },
  "call-004": {
    metadata: {
      callUuid: "call-004-uuid-jkl012",
      phone: "+44 20 7946 0958",
      startTime: "Dec 28, 2024 10:15 AM",
      duration: "5:42",
      organization: "42487a3f",
      agent: "Agent C",
      status: "answered",
    },
    tags: ["demo", "enterprise", "high value"],
    recording: "mock-recording-url",
    sentiment: {
      sentiment: "positive",
      confidenceScore: 94,
      summary: "Excellent enterprise demo call. The prospect showed strong buying signals and requested a formal proposal. Decision expected within two weeks.",
    },
    transcript: [
      { id: 1, speaker: "agent", text: "Good morning! This is Alex from Syntine. I'm calling about the enterprise demo you scheduled.", timestamp: "0:00", latency: "78ms" },
      { id: 2, speaker: "caller", text: "Yes, perfect timing. I have my team here as well.", timestamp: "0:08" },
      { id: 3, speaker: "agent", text: "Wonderful! I'll be covering our enterprise features including custom voice training, advanced analytics, and dedicated support.", timestamp: "0:14", latency: "92ms" },
    ],
  },
  "call-005": {
    metadata: {
      callUuid: "call-005-uuid-mno345",
      phone: "+91 87654 32109",
      startTime: "Dec 28, 2024 10:10 AM",
      duration: null,
      organization: "9f8d4c5e",
      agent: "Agent B",
      status: "failed",
    },
    tags: ["connection error"],
    recording: undefined,
    sentiment: null,
    transcript: null,
  },
};

const CallDetails = () => {
  const { callId } = useParams<{ callId: string }>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 600);
    return () => clearTimeout(timer);
  }, []);

  const callData = callId ? mockCallDetails[callId] : null;

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Call data export is being prepared.",
    });
  };

  if (isLoading) {
    return (
      <OrgAppShell>
        <PageContainer title="Call Details" subtitle="Loading call information...">
          <div className="space-y-6">
            <SkeletonCard className="h-[140px]" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SkeletonCard className="h-[200px]" />
              <SkeletonCard className="h-[200px]" />
            </div>
            <SkeletonCard className="h-[400px]" />
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

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
                Back to Calls
              </Link>
            </Button>
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  const isAnalyzed = callData.metadata.status === "answered" && callData.sentiment !== null;

  return (
    <OrgAppShell>
      <PageContainer title="Call Details" subtitle="Inspect call metadata, recording, and transcript">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Back Button */}
          <Button variant="ghost" asChild className="-ml-2">
            <Link to="/app/calls">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Calls
            </Link>
          </Button>

          {/* Metadata Bar */}
          <CallMetadataBar metadata={callData.metadata} onExport={handleExport} />

          {/* Tags */}
          {callData.tags.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              {callData.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </motion.div>
          )}

          {/* Recording and Sentiment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <CallRecordingPlayer
                recordingUrl={callData.recording}
                duration={callData.metadata.duration || undefined}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CallSentimentCard
                sentiment={callData.sentiment?.sentiment}
                confidenceScore={callData.sentiment?.confidenceScore}
                summary={callData.sentiment?.summary}
                isAnalyzed={isAnalyzed}
              />
            </motion.div>
          </div>

          {/* Transcript */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <CallTranscriptChat
              messages={callData.transcript || undefined}
              isAvailable={callData.metadata.status === "answered"}
            />
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallDetails;
