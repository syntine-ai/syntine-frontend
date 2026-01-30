import { useState } from "react";
import { motion } from "framer-motion";
import { PageContainer } from "@/components/layout/PageContainer";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { GlobalDateFilter, DatePreset } from "@/components/dashboard/GlobalDateFilter";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Phone,
  PhoneIncoming,
  PhoneMissed,
  Clock,
  TrendingUp,
  Smile,
  List,
  Users,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Link } from "react-router-dom";

const callsOverTime = [
  { date: "Dec 1", calls: 1200, answered: 980, failed: 220 },
  { date: "Dec 2", calls: 1450, answered: 1200, failed: 250 },
  { date: "Dec 3", calls: 1380, answered: 1150, failed: 230 },
  { date: "Dec 4", calls: 1600, answered: 1350, failed: 250 },
  { date: "Dec 5", calls: 1720, answered: 1480, failed: 240 },
  { date: "Dec 6", calls: 1550, answered: 1320, failed: 230 },
  { date: "Dec 7", calls: 1400, answered: 1180, failed: 220 },
];

const outcomesData = [
  { name: "Answered", value: 8420, fill: "hsl(var(--success))" },
  { name: "No Answer", value: 2150, fill: "hsl(var(--muted-foreground))" },
  { name: "Busy", value: 890, fill: "hsl(var(--warning))" },
  { name: "Failed", value: 540, fill: "hsl(var(--destructive))" },
];

const sentimentData = [
  { name: "Positive", value: 58, fill: "hsl(var(--success))" },
  { name: "Neutral", value: 32, fill: "hsl(var(--warning))" },
  { name: "Negative", value: 10, fill: "hsl(var(--destructive))" },
];

const campaigns = [
  { id: "all", name: "All Campaigns" },
  { id: "1", name: "Renewal Follow-up Q4" },
  { id: "2", name: "Lead Qualification" },
  { id: "3", name: "Customer Feedback" },
];

const agents = [
  { id: "all", name: "All Agents" },
  { id: "1", name: "Renewal Assistant" },
  { id: "2", name: "Lead Qualifier" },
  { id: "3", name: "Feedback Bot" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const CallAnalytics = () => {
  const [dateFilter, setDateFilter] = useState<DatePreset>("7d");
  const [campaign, setCampaign] = useState("all");
  const [agent, setAgent] = useState("all");

  return (
    <PageContainer
        title="Call Analytics"
        subtitle="Comprehensive insights into your call performance"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          {/* Filters Row */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <Select value={campaign} onValueChange={setCampaign}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Campaign" />
                </SelectTrigger>
                <SelectContent>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={agent} onValueChange={setAgent}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3">
              <GlobalDateFilter value={dateFilter} onChange={setDateFilter} />
              <Button variant="outline" asChild>
                <Link to="/calls/logs">
                  <List className="h-4 w-4 mr-2" />
                  View Logs
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/calls/callers">
                  <Users className="h-4 w-4 mr-2" />
                  Callers
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Metrics Row */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4"
          >
            <MetricCard label="Total Calls" value="12,000" trend={8.4} icon={Phone} />
            <MetricCard label="Answered" value="9,660" trend={5.2} icon={PhoneIncoming} />
            <MetricCard label="Failed" value="1,640" trend={-12.1} trendDirection="down" icon={PhoneMissed} />
            <MetricCard label="Avg. Duration" value="3m 42s" trend={2.1} icon={Clock} />
            <MetricCard label="Success Rate" value="80.5%" trend={3.2} icon={TrendingUp} />
            <MetricCard label="Avg. Sentiment" value="72" trend={4.8} icon={Smile} />
          </motion.div>

          {/* Charts */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calls Over Time */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Calls Over Time</CardTitle>
                <CardDescription>Daily call volume breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={callsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Line type="monotone" dataKey="calls" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} name="Total" />
                      <Line type="monotone" dataKey="answered" stroke="hsl(var(--success))" strokeWidth={2} dot={false} name="Answered" />
                      <Line type="monotone" dataKey="failed" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} name="Failed" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-xs text-muted-foreground">Total</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-success" />
                    <span className="text-xs text-muted-foreground">Answered</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-xs text-muted-foreground">Failed</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Outcomes Bar Chart */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Call Outcomes</CardTitle>
                <CardDescription>Distribution of call results</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={outcomesData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                      <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} width={80} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "hsl(var(--card))",
                          border: "1px solid hsl(var(--border))",
                          borderRadius: "12px",
                        }}
                      />
                      <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                        {outcomesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Sentiment Distribution */}
          <motion.div variants={itemVariants}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Sentiment Distribution</CardTitle>
                <CardDescription>Overall sentiment analysis of calls</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-around">
                  <div className="h-[200px] w-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sentimentData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={4}
                          dataKey="value"
                        >
                          {sentimentData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            border: "1px solid hsl(var(--border))",
                            borderRadius: "12px",
                          }}
                          formatter={(value: number) => [`${value}%`, ""]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-4">
                    {sentimentData.map((item) => (
                      <div key={item.name} className="flex items-center gap-4">
                        <div className="h-4 w-4 rounded-full" style={{ backgroundColor: item.fill }} />
                        <div>
                          <p className="font-medium text-foreground">{item.name}</p>
                          <p className="text-2xl font-bold text-foreground">{item.value}%</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </PageContainer>
  );
};

export default CallAnalytics;
