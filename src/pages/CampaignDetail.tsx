import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { CampaignContactsTab } from "@/components/campaigns/CampaignContactsTab";
import { CampaignControlsTab } from "@/components/campaigns/CampaignControlsTab";
import {
  Play,
  Pause,
  Settings,
  Copy,
  Phone,
  PhoneIncoming,
  TrendingUp,
  Clock,
  Smile,
  ArrowLeft,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { cn } from "@/lib/utils";
import { useCampaigns, CampaignWithDetails } from "@/hooks/useCampaigns";
import { useCallLogs } from "@/hooks/useCallLogs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";
import type { Database } from "@/integrations/supabase/types";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

const statusConfig: Record<string, { label: string; className: string }> = {
  running: { label: "Running", className: "bg-success/15 text-success border-success/30" },
  paused: { label: "Paused", className: "bg-warning/15 text-warning border-warning/30" },
  draft: { label: "Draft", className: "bg-muted text-muted-foreground border-border" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
  cancelled: { label: "Cancelled", className: "bg-destructive/15 text-destructive border-destructive/30" },
};

const sentimentConfig = {
  positive: { label: "Positive", className: "bg-success/15 text-success" },
  neutral: { label: "Neutral", className: "bg-warning/15 text-warning" },
  negative: { label: "Negative", className: "bg-destructive/15 text-destructive" },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { campaigns, updateCampaignStatus, isLoading: campaignsLoading } = useCampaigns();
  const { calls } = useCallLogs();

  const [isUpdating, setIsUpdating] = useState(false);

  // Find the campaign by ID
  const campaign = useMemo(() => {
    return campaigns.find((c) => c.id === id);
  }, [campaigns, id]);

  // Filter calls for this campaign
  const campaignCalls = useMemo(() => {
    if (!id) return [];
    return calls.filter((call) => call.campaign_id === id);
  }, [calls, id]);

  // Recent calls (last 5)
  const recentCalls = useMemo(() => {
    return campaignCalls.slice(0, 5).map((call) => ({
      id: call.id,
      phone: call.phone_number || "N/A",
      status: call.outcome || "completed",
      duration: call.duration_seconds
        ? `${Math.floor(call.duration_seconds / 60)}:${(call.duration_seconds % 60).toString().padStart(2, "0")}`
        : "-",
      sentiment: call.sentiment,
      time: call.created_at
        ? formatRelativeTime(new Date(call.created_at))
        : "Unknown",
    }));
  }, [campaignCalls]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const totalCalls = campaignCalls.length;
    const connected = campaignCalls.filter((c) => c.outcome === "answered").length;
    const successRate = totalCalls > 0 ? ((connected / totalCalls) * 100).toFixed(1) : "0";

    const callsWithDuration = campaignCalls.filter((c) => c.duration_seconds);
    const avgDurationSec = callsWithDuration.length > 0
      ? callsWithDuration.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / callsWithDuration.length
      : 0;
    const avgMins = Math.floor(avgDurationSec / 60);
    const avgSecs = Math.floor(avgDurationSec % 60);

    const positiveCount = campaignCalls.filter((c) => c.sentiment === "positive").length;
    const avgSentiment = totalCalls > 0 ? Math.round((positiveCount / totalCalls) * 100) : 0;

    return {
      totalCalls,
      connected,
      successRate: `${successRate}%`,
      avgDuration: `${avgMins}m ${avgSecs}s`,
      avgSentiment,
    };
  }, [campaignCalls]);

  // Call volume by hour (for chart)
  const callVolumeData = useMemo(() => {
    const hourCounts: Record<string, number> = {};
    const hours = ["9AM", "10AM", "11AM", "12PM", "1PM", "2PM", "3PM", "4PM", "5PM"];
    hours.forEach((h) => (hourCounts[h] = 0));

    campaignCalls.forEach((call) => {
      if (!call.created_at) return;
      const hour = new Date(call.created_at).getHours();
      const hourLabel = hour < 12 ? `${hour}AM` : hour === 12 ? "12PM" : `${hour - 12}PM`;
      if (hourCounts[hourLabel] !== undefined) {
        hourCounts[hourLabel]++;
      }
    });

    return Object.entries(hourCounts).map(([time, calls]) => ({ time, calls }));
  }, [campaignCalls]);

  // Call outcomes distribution (for pie chart)
  const outcomesData = useMemo(() => {
    const outcomes = {
      answered: 0,
      no_answer: 0,
      failed: 0,
      busy: 0,
      voicemail: 0,
    };

    campaignCalls.forEach((call) => {
      if (call.outcome && outcomes[call.outcome as keyof typeof outcomes] !== undefined) {
        outcomes[call.outcome as keyof typeof outcomes]++;
      }
    });

    const total = campaignCalls.length || 1;
    return [
      { name: "Success", value: Math.round((outcomes.answered / total) * 100), color: "hsl(var(--success))" },
      { name: "No Answer", value: Math.round((outcomes.no_answer / total) * 100), color: "hsl(var(--muted-foreground))" },
      { name: "Failed", value: Math.round((outcomes.failed / total) * 100), color: "hsl(var(--destructive))" },
      { name: "Busy/VM", value: Math.round(((outcomes.busy + outcomes.voicemail) / total) * 100), color: "hsl(var(--warning))" },
    ].filter((d) => d.value > 0);
  }, [campaignCalls]);

  const handleToggleStatus = async () => {
    if (!campaign || !id) return;

    setIsUpdating(true);
    const newStatus: CampaignStatus = campaign.status === "running" ? "paused" : "running";
    await updateCampaignStatus(id, newStatus);
    setIsUpdating(false);
  };

  const isRunning = campaign?.status === "running";
  const campaignStatus = campaign?.status || "draft";

  if (campaignsLoading) {
    return (
      <OrgAppShell>
        <PageContainer>
          <div className="space-y-6">
            <SkeletonCard className="h-24" />
            <div className="grid grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonCard key={i} className="h-[100px]" />
              ))}
            </div>
            <SkeletonCard className="h-96" />
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  if (!campaign) {
    return (
      <OrgAppShell>
        <PageContainer>
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold text-foreground mb-2">Campaign not found</h2>
            <p className="text-muted-foreground mb-4">The campaign you're looking for doesn't exist.</p>
            <Button onClick={() => navigate("/app/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/app/campaigns")}>
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Campaigns
            </Button>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                  {campaign.name}
                </h1>
                <Badge
                  variant="outline"
                  className={cn("border", statusConfig[campaignStatus]?.className)}
                >
                  {statusConfig[campaignStatus]?.label || campaignStatus}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                {campaign.description || "No description"} • {metrics.totalCalls} calls total
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" className="gap-2">
                <Copy className="h-4 w-4" />
                Duplicate
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" />
                Edit
              </Button>
              <Button
                variant={isRunning ? "outline" : "default"}
                className="gap-2"
                onClick={handleToggleStatus}
                disabled={isUpdating}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> Stop
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start
                  </>
                )}
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50 p-1">
            <TabsTrigger value="overview" className="data-[state=active]:bg-background">
              Overview
            </TabsTrigger>
            <TabsTrigger value="controls" className="data-[state=active]:bg-background">
              Concurrency & Controls
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-background">
              Contacts
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Total Calls"
                value={metrics.totalCalls.toLocaleString()}
                icon={Phone}
              />
              <MetricCard
                label="Connected"
                value={metrics.connected.toLocaleString()}
                icon={PhoneIncoming}
              />
              <MetricCard
                label="Success Rate"
                value={metrics.successRate}
                icon={TrendingUp}
              />
              <MetricCard
                label="Avg. Duration"
                value={metrics.avgDuration}
                icon={Clock}
              />
              <MetricCard
                label="Avg. Sentiment"
                value={metrics.avgSentiment.toString()}
                icon={Smile}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Volume Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Calls Over Time</CardTitle>
                  <CardDescription>Call volume by hour</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={callVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={false}
                          activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Outcomes Donut */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Call Outcomes</CardTitle>
                  <CardDescription>Distribution of results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[220px] flex items-center justify-center">
                    {outcomesData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={outcomesData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={4}
                            dataKey="value"
                          >
                            {outcomesData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "hsl(var(--card))",
                              border: "1px solid hsl(var(--border))",
                              borderRadius: "12px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="text-muted-foreground text-sm">No call data yet</p>
                    )}
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-2">
                    {outcomesData.map((item) => (
                      <div key={item.name} className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-sm text-muted-foreground">
                          {item.name} ({item.value}%)
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Calls */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Recent Calls</CardTitle>
                <CardDescription>Latest call activity with sentiment</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCalls.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No calls yet for this campaign</p>
                ) : (
                  <div className="space-y-3">
                    {recentCalls.map((call, i) => (
                      <motion.div
                        key={call.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-secondary/30"
                      >
                        <div className="flex items-center gap-4">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Phone className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{call.phone}</p>
                            <p className="text-sm text-muted-foreground">{call.time}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-foreground">{call.duration}</span>
                          <span
                            className={cn(
                              "px-2 py-0.5 rounded-full text-xs font-medium",
                              call.status === "answered"
                                ? "bg-success/10 text-success"
                                : call.status === "no_answer"
                                  ? "bg-muted text-muted-foreground"
                                  : "bg-destructive/10 text-destructive"
                            )}
                          >
                            {call.status.replace("_", " ")}
                          </span>
                          {call.sentiment && (
                            <span
                              className={cn(
                                "px-2 py-0.5 rounded-full text-xs font-medium",
                                sentimentConfig[call.sentiment as keyof typeof sentimentConfig]?.className
                              )}
                            >
                              {sentimentConfig[call.sentiment as keyof typeof sentimentConfig]?.label}
                            </span>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls">
            <CampaignControlsTab campaign={campaign} />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <CampaignContactsTab campaignId={id!} campaign={campaign} />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </OrgAppShell>
  );
};

// Helper function for relative time
function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} min ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
}

export default CampaignDetail;
