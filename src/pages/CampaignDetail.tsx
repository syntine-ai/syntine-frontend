import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import { StatusPill } from "@/components/shared/StatusPill";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ConcurrencySlider } from "@/components/campaigns/ConcurrencySlider";
import { AgentSelector } from "@/components/campaigns/AgentSelector";
import { SentimentConfigCard } from "@/components/campaigns/SentimentConfigCard";
import { CampaignActivityFeed } from "@/components/campaigns/CampaignActivityFeed";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Pause, Settings, Phone, Clock, TrendingUp, Users } from "lucide-react";
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
  { name: "Answered", value: 65, color: "hsl(var(--primary))" },
  { name: "No Answer", value: 20, color: "hsl(var(--muted-foreground))" },
  { name: "Busy", value: 10, color: "hsl(var(--warning))" },
  { name: "Failed", value: 5, color: "hsl(var(--destructive))" },
];

const recentCalls = [
  { id: 1, phone: "+1 555-0123", status: "completed", duration: "4:23", sentiment: "positive", time: "2 min ago" },
  { id: 2, phone: "+1 555-0456", status: "completed", duration: "2:45", sentiment: "neutral", time: "5 min ago" },
  { id: 3, phone: "+1 555-0789", status: "no_answer", duration: "-", sentiment: "-", time: "8 min ago" },
  { id: 4, phone: "+1 555-0321", status: "completed", duration: "5:12", sentiment: "positive", time: "12 min ago" },
  { id: 5, phone: "+1 555-0654", status: "failed", duration: "-", sentiment: "-", time: "15 min ago" },
];

const contacts = [
  { id: 1, name: "John Smith", phone: "+1 555-0123", status: "completed", attempts: 1, lastOutcome: "Answered", sentiment: "positive" },
  { id: 2, name: "Sarah Johnson", phone: "+1 555-0456", status: "pending", attempts: 0, lastOutcome: "-", sentiment: "-" },
  { id: 3, name: "Mike Brown", phone: "+1 555-0789", status: "completed", attempts: 2, lastOutcome: "Answered", sentiment: "neutral" },
  { id: 4, name: "Emily Davis", phone: "+1 555-0321", status: "failed", attempts: 3, lastOutcome: "No Answer", sentiment: "-" },
  { id: 5, name: "Chris Wilson", phone: "+1 555-0654", status: "pending", attempts: 0, lastOutcome: "-", sentiment: "-" },
  { id: 6, name: "Lisa Anderson", phone: "+1 555-0987", status: "completed", attempts: 1, lastOutcome: "Answered", sentiment: "positive" },
  { id: 7, name: "David Lee", phone: "+1 555-0147", status: "completed", attempts: 1, lastOutcome: "Answered", sentiment: "negative" },
  { id: 8, name: "Amy Chen", phone: "+1 555-0258", status: "pending", attempts: 0, lastOutcome: "-", sentiment: "-" },
  { id: 9, name: "Tom Harris", phone: "+1 555-0369", status: "completed", attempts: 2, lastOutcome: "Busy", sentiment: "neutral" },
  { id: 10, name: "Rachel Green", phone: "+1 555-0741", status: "pending", attempts: 0, lastOutcome: "-", sentiment: "-" },
];

const CampaignDetail = () => {
  const { id } = useParams();
  const [isRunning, setIsRunning] = useState(true);
  const [concurrency, setConcurrency] = useState(5);
  const [selectedAgent, setSelectedAgent] = useState("1");
  const [promptOverride, setPromptOverride] = useState(
    "You are a friendly sales assistant helping customers with their renewal. Be helpful, patient, and focus on understanding their needs."
  );
  const [maxAttempts, setMaxAttempts] = useState(3);
  const [retryDelay, setRetryDelay] = useState(10);
  const [callWindowStart, setCallWindowStart] = useState("09:00");
  const [callWindowEnd, setCallWindowEnd] = useState("17:00");

  return (
    <OrgAppShell>
      <PageContainer>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                  Renewal Follow-up
                </h1>
                <StatusPill status={isRunning ? "running" : "paused"} />
              </div>
              <p className="text-muted-foreground">Campaign ID: {id}</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant={isRunning ? "outline" : "default"}
                className="gap-2"
                onClick={() => setIsRunning(!isRunning)}
              >
                {isRunning ? (
                  <>
                    <Pause className="h-4 w-4" /> Pause
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" /> Start
                  </>
                )}
              </Button>
              <Button variant="outline" className="gap-2">
                <Settings className="h-4 w-4" /> Edit Campaign
              </Button>
            </div>
          </div>

          {/* Substats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Calls Today", value: "134", icon: Phone },
              { label: "Success Rate", value: "82%", icon: TrendingUp },
              { label: "Avg Duration", value: "3m 12s", icon: Clock },
              { label: "Contacts Left", value: "1,206", icon: Users },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-lg border border-border/50 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <stat.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-secondary/50">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="orchestration">Orchestration</TabsTrigger>
            <TabsTrigger value="agent">Agent & Prompts</TabsTrigger>
            <TabsTrigger value="contacts">Contacts</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Call Volume Chart */}
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Call Volume</CardTitle>
                  <CardDescription>Calls over time today</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={callVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis dataKey="time" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "8px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="calls"
                          stroke="hsl(var(--primary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--primary))" }}
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
                  <CardDescription>Distribution of call results</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px] flex items-center justify-center">
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
                            borderRadius: "8px",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
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
                <CardDescription>Latest call activity</CardDescription>
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
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-foreground">{call.duration}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            call.status === "completed"
                              ? "bg-success/10 text-success"
                              : call.status === "no_answer"
                              ? "bg-muted text-muted-foreground"
                              : "bg-destructive/10 text-destructive"
                          }`}
                        >
                          {call.status.replace("_", " ")}
                        </span>
                        {call.sentiment !== "-" && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              call.sentiment === "positive"
                                ? "bg-success/10 text-success"
                                : call.sentiment === "neutral"
                                ? "bg-muted text-muted-foreground"
                                : "bg-destructive/10 text-destructive"
                            }`}
                          >
                            {call.sentiment}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Orchestration Tab */}
          <TabsContent value="orchestration" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Concurrency Control</CardTitle>
                  <CardDescription>
                    Control how many calls can run simultaneously
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ConcurrencySlider
                    value={concurrency}
                    onChange={setConcurrency}
                    min={1}
                    max={10}
                  />
                </CardContent>
              </Card>

              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-lg">Call Window</CardTitle>
                  <CardDescription>
                    Set allowed calling hours
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Start Time</Label>
                      <Input
                        type="time"
                        value={callWindowStart}
                        onChange={(e) => setCallWindowStart(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>End Time</Label>
                      <Input
                        type="time"
                        value={callWindowEnd}
                        onChange={(e) => setCallWindowEnd(e.target.value)}
                      />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Calls will only be made between these hours (local timezone)
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Activity</CardTitle>
                <CardDescription>Recent events and status changes</CardDescription>
              </CardHeader>
              <CardContent>
                <CampaignActivityFeed />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agent & Prompts Tab */}
          <TabsContent value="agent" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Assigned Agent</CardTitle>
                <CardDescription>
                  Select the AI agent for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AgentSelector value={selectedAgent} onChange={setSelectedAgent} />
              </CardContent>
            </Card>

            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Prompt Override</CardTitle>
                <CardDescription>
                  Customize the AI agent instructions for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={promptOverride}
                  onChange={(e) => setPromptOverride(e.target.value)}
                  className="min-h-[200px] font-mono text-sm"
                  placeholder="Enter custom prompt instructions..."
                />
              </CardContent>
            </Card>

            <SentimentConfigCard />
          </TabsContent>

          {/* Contacts Tab */}
          <TabsContent value="contacts">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Campaign Contacts</CardTitle>
                <CardDescription>
                  All contacts assigned to this campaign
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Name</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Phone</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Status</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Attempts</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Last Outcome</th>
                        <th className="text-left p-3 text-sm font-medium text-muted-foreground">Sentiment</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contacts.map((contact, i) => (
                        <motion.tr
                          key={contact.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className="border-b border-border/50 last:border-0 hover:bg-secondary/20"
                        >
                          <td className="p-3 font-medium text-foreground">{contact.name}</td>
                          <td className="p-3 text-foreground">{contact.phone}</td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                contact.status === "completed"
                                  ? "bg-success/10 text-success"
                                  : contact.status === "pending"
                                  ? "bg-warning/10 text-warning"
                                  : "bg-destructive/10 text-destructive"
                              }`}
                            >
                              {contact.status}
                            </span>
                          </td>
                          <td className="p-3 text-foreground">{contact.attempts}</td>
                          <td className="p-3 text-muted-foreground">{contact.lastOutcome}</td>
                          <td className="p-3">
                            {contact.sentiment !== "-" ? (
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  contact.sentiment === "positive"
                                    ? "bg-success/10 text-success"
                                    : contact.sentiment === "neutral"
                                    ? "bg-muted text-muted-foreground"
                                    : "bg-destructive/10 text-destructive"
                                }`}
                              >
                                {contact.sentiment}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Retry Logic</CardTitle>
                <CardDescription>
                  Configure how failed calls are retried
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxAttempts">Max Attempts</Label>
                    <Input
                      id="maxAttempts"
                      type="number"
                      value={maxAttempts}
                      onChange={(e) => setMaxAttempts(Number(e.target.value))}
                      min={1}
                      max={10}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="retryDelay">Retry Delay (minutes)</Label>
                    <Input
                      id="retryDelay"
                      type="number"
                      value={retryDelay}
                      onChange={(e) => setRetryDelay(Number(e.target.value))}
                      min={1}
                      max={60}
                    />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Calls that fail will be retried up to {maxAttempts} times with a {retryDelay} minute delay between attempts.
                </p>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
                <CardDescription>
                  Irreversible actions for this campaign
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium text-foreground">Archive Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      This will permanently disable and archive the campaign
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Archive
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-destructive/5 border border-destructive/20">
                  <div>
                    <p className="font-medium text-foreground">Delete Campaign</p>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete this campaign and all its data
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </OrgAppShell>
  );
};

export default CampaignDetail;
