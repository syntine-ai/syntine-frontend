import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { StatusPill } from "@/components/shared/StatusPill";
import { PhoneCall, CheckCircle, Timer, Smile, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
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
  { date: "Mon", calls: 120, answered: 98, failed: 22 },
  { date: "Tue", calls: 150, answered: 130, failed: 20 },
  { date: "Wed", calls: 180, answered: 155, failed: 25 },
  { date: "Thu", calls: 140, answered: 118, failed: 22 },
  { date: "Fri", calls: 200, answered: 175, failed: 25 },
  { date: "Sat", calls: 90, answered: 78, failed: 12 },
  { date: "Sun", calls: 80, answered: 70, failed: 10 },
];

const outcomesData = [
  { name: "Answered", value: 724, color: "hsl(var(--primary))" },
  { name: "No Answer", value: 320, color: "hsl(var(--muted-foreground))" },
  { name: "Busy", value: 140, color: "hsl(var(--warning))" },
  { name: "Failed", value: 100, color: "hsl(var(--destructive))" },
];

const sentimentData = [
  { date: "Mon", positive: 65, neutral: 25, negative: 10 },
  { date: "Tue", positive: 70, neutral: 22, negative: 8 },
  { date: "Wed", positive: 68, neutral: 24, negative: 8 },
  { date: "Thu", positive: 72, neutral: 20, negative: 8 },
  { date: "Fri", positive: 75, neutral: 18, negative: 7 },
  { date: "Sat", positive: 68, neutral: 25, negative: 7 },
  { date: "Sun", positive: 66, neutral: 26, negative: 8 },
];

const systemHealthItems = [
  { label: "API Response", value: 98 },
  { label: "Database", value: 100 },
  { label: "Voice Processing", value: 92 },
  { label: "Queue Capacity", value: 88 },
];

const recentActivity = [
  { message: "Campaign 'Renewal Follow-up' started", time: "10:12 AM", type: "success" },
  { message: "Agent prompt updated for 'Feedback Bot'", time: "9:45 AM", type: "info" },
  { message: "Spike detected in failed calls", time: "8:30 AM", type: "warning" },
  { message: "New contact list imported (2,340 contacts)", time: "8:00 AM", type: "success" },
  { message: "Weekly report generated", time: "7:30 AM", type: "info" },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const Dashboard = () => {
  const [campaign, setCampaign] = useState("all");
  const [agent, setAgent] = useState("all");
  const [dateRange, setDateRange] = useState("7d");
  const [date, setDate] = useState<Date>();
  const [chartTab, setChartTab] = useState("calls");

  return (
    <OrgAppShell>
      <PageContainer
        title="Dashboard"
        subtitle="Monitor all your AI calling activity, performance, and system health."
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
            className="flex flex-wrap items-center gap-3 p-4 bg-card rounded-lg border border-border/50 shadow-card"
          >
            <Select value={campaign} onValueChange={setCampaign}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Campaign" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All campaigns</SelectItem>
                <SelectItem value="campaign-a">Campaign A</SelectItem>
                <SelectItem value="campaign-b">Campaign B</SelectItem>
              </SelectContent>
            </Select>

            <Select value={agent} onValueChange={setAgent}>
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All agents</SelectItem>
                <SelectItem value="agent-x">Agent X</SelectItem>
                <SelectItem value="agent-y">Agent Y</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 ml-auto">
              {["Today", "7d", "30d", "This month"].map((range) => (
                <Button
                  key={range}
                  variant={dateRange === range ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDateRange(range)}
                  className="text-xs"
                >
                  {range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range}
                </Button>
              ))}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {date ? format(date, "PP") : "Custom"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            variants={itemVariants}
            className="flex items-center gap-4 flex-wrap"
          >
            <span className="text-sm font-medium text-muted-foreground">System Status:</span>
            <div className="flex items-center gap-3">
              {[
                { label: "Database", status: "active" as const },
                { label: "Server", status: "active" as const },
                { label: "Agent Engine", status: "active" as const },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <StatusPill status={item.status} />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Metric Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <StatCard
              title="Total Calls"
              value="1,284"
              trend={{ value: 12.4, isPositive: true }}
              icon={PhoneCall}
              iconColor="primary"
            />
            <StatCard
              title="Success Rate"
              value="87.2%"
              trend={{ value: 4.1, isPositive: true }}
              icon={CheckCircle}
              iconColor="success"
            />
            <StatCard
              title="Avg Duration"
              value="3m 22s"
              trend={{ value: 2.4, isPositive: false }}
              icon={Timer}
              iconColor="warning"
            />
            <StatCard
              title="Positive Sentiment"
              value="68%"
              trend={{ value: 6.5, isPositive: true }}
              icon={Smile}
              iconColor="primary"
            />
          </motion.div>

          {/* Charts Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Call Volume Chart */}
            <div className="lg:col-span-2 bg-card rounded-lg shadow-card border border-border/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-foreground">Call Volume Over Time</h2>
                <Tabs value={chartTab} onValueChange={setChartTab}>
                  <TabsList className="h-8">
                    <TabsTrigger value="calls" className="text-xs px-3">Calls</TabsTrigger>
                    <TabsTrigger value="answered" className="text-xs px-3">Answered</TabsTrigger>
                    <TabsTrigger value="failed" className="text-xs px-3">Failed</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={callVolumeData}>
                    <defs>
                      <linearGradient id="colorCalls" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey={chartTab}
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 4 }}
                      activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outcomes Donut */}
            <div className="bg-card rounded-lg shadow-card border border-border/50 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Call Outcomes</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={outcomesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={3}
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
                        fontSize: "12px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-4">
                {outcomesData.map((item) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-xs text-muted-foreground">{item.name}</span>
                    <span className="text-xs font-medium text-foreground ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bottom Row */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sentiment Trend */}
            <div className="bg-card rounded-lg shadow-card border border-border/50 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Sentiment Trend</h2>
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={sentimentData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "8px",
                        fontSize: "12px",
                      }}
                    />
                    <Line type="monotone" dataKey="positive" stroke="hsl(var(--success))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="neutral" stroke="hsl(var(--muted-foreground))" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="negative" stroke="hsl(var(--destructive))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-success" />
                  <span className="text-xs text-muted-foreground">Positive</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Neutral</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-destructive" />
                  <span className="text-xs text-muted-foreground">Negative</span>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-card rounded-lg shadow-card border border-border/50 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-1">System Health</h2>
              <p className="text-sm text-muted-foreground mb-5">Internal diagnostics for core services.</p>
              <div className="space-y-4">
                {systemHealthItems.map((item) => (
                  <div key={item.label} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-foreground">{item.label}</span>
                      <span className={cn(
                        "text-sm font-medium",
                        item.value >= 95 ? "text-success" : item.value >= 80 ? "text-warning" : "text-destructive"
                      )}>
                        {item.value}%
                      </span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.value}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={cn(
                          "h-full rounded-full",
                          item.value >= 95 ? "bg-success" : item.value >= 80 ? "bg-warning" : "bg-destructive"
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-card rounded-lg shadow-card border border-border/50 p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3"
                  >
                    <div className={cn(
                      "h-2 w-2 rounded-full mt-2 flex-shrink-0",
                      item.type === "success" ? "bg-success" :
                      item.type === "warning" ? "bg-warning" : "bg-primary"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground leading-tight">{item.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4 text-muted-foreground">
                View all activity
              </Button>
            </div>
          </motion.div>
        </motion.div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Dashboard;
