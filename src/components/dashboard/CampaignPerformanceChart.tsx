import { useState } from "react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

const campaignColors = {
  "Renewal Follow-up": "hsl(244, 94%, 69%)",
  "Lead Qualification": "hsl(145, 63%, 42%)",
  "Customer Feedback": "hsl(40, 91%, 64%)",
  "Product Launch": "hsl(280, 80%, 65%)",
  "Churn Prevention": "hsl(200, 80%, 55%)",
};

const mockData = [
  { date: "Dec 1", "Renewal Follow-up": 180, "Lead Qualification": 120, "Customer Feedback": 200, "Product Launch": 50, "Churn Prevention": 150 },
  { date: "Dec 2", "Renewal Follow-up": 220, "Lead Qualification": 150, "Customer Feedback": 180, "Product Launch": 80, "Churn Prevention": 160 },
  { date: "Dec 3", "Renewal Follow-up": 250, "Lead Qualification": 180, "Customer Feedback": 0, "Product Launch": 120, "Churn Prevention": 180 },
  { date: "Dec 4", "Renewal Follow-up": 280, "Lead Qualification": 200, "Customer Feedback": 0, "Product Launch": 150, "Churn Prevention": 200 },
  { date: "Dec 5", "Renewal Follow-up": 320, "Lead Qualification": 220, "Customer Feedback": 0, "Product Launch": 180, "Churn Prevention": 220 },
  { date: "Dec 6", "Renewal Follow-up": 280, "Lead Qualification": 190, "Customer Feedback": 0, "Product Launch": 140, "Churn Prevention": 190 },
  { date: "Dec 7", "Renewal Follow-up": 240, "Lead Qualification": 160, "Customer Feedback": 0, "Product Launch": 100, "Churn Prevention": 170 },
];

const campaigns = Object.keys(campaignColors) as (keyof typeof campaignColors)[];

export function CampaignPerformanceChart() {
  const [visibleCampaigns, setVisibleCampaigns] = useState<Set<string>>(
    new Set(campaigns)
  );

  const toggleCampaign = (campaign: string) => {
    setVisibleCampaigns((prev) => {
      const next = new Set(prev);
      if (next.has(campaign)) {
        next.delete(campaign);
      } else {
        next.add(campaign);
      }
      return next;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-card rounded-xl border border-border/50 shadow-card p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Campaign Performance
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Calls per day by campaign
          </p>
        </div>
      </div>

      {/* Custom Legend */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        {campaigns.map((campaign) => (
          <button
            key={campaign}
            onClick={() => toggleCampaign(campaign)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all",
              visibleCampaigns.has(campaign)
                ? "bg-card border border-border/50 text-foreground"
                : "bg-muted/50 text-muted-foreground opacity-60"
            )}
          >
            <div
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: visibleCampaigns.has(campaign)
                  ? campaignColors[campaign]
                  : "hsl(var(--muted-foreground))",
              }}
            />
            {campaign}
          </button>
        ))}
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockData}>
            <defs>
              {campaigns.map((campaign) => (
                <linearGradient
                  key={campaign}
                  id={`gradient-${campaign.replace(/\s/g, "")}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="5%" stopColor={campaignColors[campaign]} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={campaignColors[campaign]} stopOpacity={0} />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${value}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "var(--shadow-elevated)",
              }}
              labelStyle={{ color: "hsl(var(--foreground))", fontWeight: 600 }}
            />
            {campaigns.map((campaign) =>
              visibleCampaigns.has(campaign) ? (
                <Line
                  key={campaign}
                  type="monotone"
                  dataKey={campaign}
                  stroke={campaignColors[campaign]}
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 5, fill: campaignColors[campaign] }}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
