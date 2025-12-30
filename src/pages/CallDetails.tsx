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
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";

interface CallData {
  id: string;
  phone_number: string | null;
  created_at: string;
  duration_seconds: number | null;
  outcome: string | null;
  sentiment: string | null;
  agent_id: string | null;
  campaign_id: string | null;
  agents?: { name: string } | null;
  campaigns?: { name: string } | null;
}

interface TranscriptEntry {
  id: number;
  speaker: "agent" | "caller";
  text: string;
  timestamp: string;
  latency?: string;
}

interface RecordingData {
  storage_path: string;
  duration_seconds: number | null;
}

const CallDetails = () => {
  const { callId } = useParams<{ callId: string }>();
  const { profile } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [callData, setCallData] = useState<CallData | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[] | null>(null);
  const [recording, setRecording] = useState<RecordingData | null>(null);

  useEffect(() => {
    const fetchCallDetails = async () => {
      if (!callId || !profile?.organization_id) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch call data
        const { data: call, error: callError } = await supabase
          .from("calls")
          .select(`
            *,
            agents:agent_id(name),
            campaigns:campaign_id(name)
          `)
          .eq("id", callId)
          .eq("organization_id", profile.organization_id)
          .single();

        if (callError) {
          console.error("Error fetching call:", callError);
          setCallData(null);
          setIsLoading(false);
          return;
        }

        setCallData(call);

        // Fetch transcript from call_transcripts table
        const { data: transcriptData, error: transcriptError } = await supabase
          .from("call_transcripts")
          .select("*")
          .eq("call_id", callId)
          .order("sequence", { ascending: true });

        if (!transcriptError && transcriptData && transcriptData.length > 0) {
          const formattedTranscript: TranscriptEntry[] = transcriptData.map((t, index) => ({
            id: index + 1,
            speaker: t.speaker === "agent" ? "agent" : "caller",
            text: t.content,
            timestamp: t.timestamp || "0:00",
            latency: t.latency_ms ? `${t.latency_ms}ms` : undefined,
          }));
          setTranscript(formattedTranscript);
        }

        // Fetch recording from call_recordings table
        const { data: recordingData, error: recordingError } = await supabase
          .from("call_recordings")
          .select("storage_path, duration_seconds")
          .eq("call_id", callId)
          .single();

        if (!recordingError && recordingData) {
          setRecording(recordingData);
        }

      } catch (err) {
        console.error("Error:", err);
        setCallData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCallDetails();
  }, [callId, profile?.organization_id]);

  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Call data export is being prepared.",
    });
  };

  // Format duration
  const formatDuration = (seconds: number | null): string | null => {
    if (!seconds) return null;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // Map outcome to status
  const mapOutcomeToStatus = (outcome: string | null): "answered" | "missed" | "failed" | "ended" => {
    switch (outcome) {
      case "answered":
        return "answered";
      case "no_answer":
        return "missed";
      case "failed":
      case "busy":
        return "failed";
      default:
        return "ended";
    }
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

  // Build metadata
  const metadata: CallMetadata = {
    callUuid: callData.id,
    phone: callData.phone_number,
    startTime: callData.created_at
      ? format(new Date(callData.created_at), "MMM d, yyyy h:mm a")
      : "Unknown",
    duration: formatDuration(callData.duration_seconds),
    organization: profile?.organization_id?.slice(0, 8) || "",
    agent: (callData.agents as any)?.name || "Unknown Agent",
    status: mapOutcomeToStatus(callData.outcome),
  };

  // Sentiment data
  const sentimentData = callData.sentiment ? {
    sentiment: callData.sentiment as "positive" | "neutral" | "negative",
    confidenceScore: 75,
    summary: `Call outcome: ${callData.outcome || "completed"}`,
  } : null;

  const isAnalyzed = callData.outcome === "answered" && callData.sentiment !== null;

  // Get recording URL (from storage_path or construct it)
  const recordingUrl = recording?.storage_path || undefined;

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
          <CallMetadataBar metadata={metadata} onExport={handleExport} />

          {/* Campaign Tag */}
          {(callData.campaigns as any)?.name && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex flex-wrap gap-2"
            >
              <Badge variant="secondary" className="text-xs">
                Campaign: {(callData.campaigns as any).name}
              </Badge>
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
                recordingUrl={recordingUrl}
                duration={formatDuration(recording?.duration_seconds ?? callData.duration_seconds) || undefined}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <CallSentimentCard
                sentiment={sentimentData?.sentiment}
                confidenceScore={sentimentData?.confidenceScore}
                summary={sentimentData?.summary}
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
              messages={transcript || undefined}
              isAvailable={callData.outcome === "answered"}
            />
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CallDetails;
