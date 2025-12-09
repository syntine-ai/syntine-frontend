import { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CampaignAgentsTab } from "@/components/campaigns/CampaignAgentsTab";
import { CampaignContactsTab } from "@/components/campaigns/CampaignContactsTab";
import { CampaignSentimentTab } from "@/components/campaigns/CampaignSentimentTab";
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

// Mock data
const callVolumeData = [
  { time: "9AM", calls: 12 },
  { time: "10AM", calls: 28 },
  { time: "11AM", calls: 35 },
  { time: "12PM", calls: 22 },
  { time: "1PM", calls: 18 },
  { time: "2PM", calls: 42 },
  { time: "3PM", calls: 38 },
  { time: "4PM", calls: 30 },
];

const outcomesData = [
  { name: "Success", value: 65, color: "hsl(var(--success))" },
  { name: "No Answer", value: 20, color: "hsl(var(--muted-foreground))" },
  { name: "Failed", value: 10, color: "hsl(var(--destructive))" },
  { name: "Do Not Call", value: 5, color: "hsl(var(--warning))" },
];

const recentCalls = [
  { id: 1, phone: "+1 555-0123", status: "completed", duration: "4:23", sentiment: "positive", time: "2 min ago" },
  { id: 2, phone: "+1 555-0456", status: "completed", duration: "2:45", sentiment: "neutral", time: "5 min ago" },
  { id: 3, phone: "+1 555-0789", status: "no_answer", duration: "-", sentiment: null, time: "8 min ago" },
  { id: 4, phone: "+1 555-0321", status: "completed", duration: "5:12", sentiment: "positive", time: "12 min ago" },
  { id: 5, phone: "+1 555-0654", status: "failed", duration: "-", sentiment: null, time: "15 min ago" },
];

const statusConfig = {
  active: { label: "Active", className: "bg-success/15 text-success border-success/30" },
  paused: { label: "Paused", className: "bg-warning/15 text-warning border-warning/30" },
  completed: { label: "Completed", className: "bg-muted text-muted-foreground border-border" },
};

const sentimentConfig = {
  positive: { label: "Positive", className: "bg-success/15 text-success" },
  neutral: { label: "Neutral", className: "bg-warning/15 text-warning" },
  negative: { label: "Negative", className: "bg-destructive/15 text-destructive" },
};

const CampaignDetail = () => {
  const { id } = useParams();
  const [isRunning, setIsRunning] = useState(true);
  const campaignStatus = isRunning ? "active" : "paused";

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                  Renewal Follow-up Q4
                </h1>
                <Badge
                  variant="outline"
                  className={cn("border", statusConfig[campaignStatus].className)}
                >
                  {statusConfig[campaignStatus].label}
                </Badge>
              </div>
              <p className="text-muted-foreground">
                Last run: Today at 2:45 PM • 2,340 calls in selected range
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
                onClick={() => setIsRunning(!isRunning)}
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
            <TabsTrigger value="agents" className="data-[state=active]:bg-background">
              Agents
            </TabsTrigger>
            <TabsTrigger value="contacts" className="data-[state=active]:bg-background">
              Contacts
            </TabsTrigger>
            <TabsTrigger value="sentiment" className="data-[state=active]:bg-background">
              Sentiment
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Metrics Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <MetricCard
                label="Total Calls"
                value="2,340"
                trend={15.2}
                trendDirection="up"
                icon={Phone}
              />
              <MetricCard
                label="Connected"
                value="1,892"
                trend={8.4}
                trendDirection="up"
                icon={PhoneIncoming}
              />
              <MetricCard
                label="Success Rate"
                value="80.9%"
                trend={2.1}
                trendDirection="up"
                icon={TrendingUp}
              />
              <MetricCard
                label="Avg. Duration"
                value="3m 24s"
                trend={-1.2}
                trendDirection="down"
                icon={Clock}
              />
              <MetricCard
                label="Avg. Sentiment"
                value="74"
                trend={4.5}
                trendDirection="up"
                icon={Smile}
              />
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Volume Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Calls Over Time</CardTitle>
                  <CardDescription>Today's call volume</CardDescription>
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
                            call.status === "completed"
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
                              sentimentConfig[call.sentiment as keyof typeof sentimentConfig].className
                            )}
                          >
                            {sentimentConfig[call.sentiment as keyof typeof sentimentConfig].label}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Controls Tab */}
          <TabsContent value="controls">
            <CampaignControlsTab />
          </TabsContent>

          {/* Agents Tab */}
          <TabsContent value="agents">
            <CampaignAgentsTab />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <CampaignContactsTab />
          </TabsContent>

          {/* Sentiment Tab */}
          <TabsContent value="sentiment">
            <CampaignSentimentTab />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CampaignDetail;
