import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";

interface UsageItem {
  label: string;
  value: number;
  limit: number;
  unit?: string;
}

interface UsageMeterProps {
  items: UsageItem[];
  delay?: number;
}

export const UsageMeter = ({ items, delay = 0 }: UsageMeterProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="space-y-5"
    >
      {items.map((item, index) => {
        const percentage = Math.min((item.value / item.limit) * 100, 100);
        const isHigh = percentage >= 80;
        const isMedium = percentage >= 60 && percentage < 80;

        return (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + index * 0.1, duration: 0.3 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">{item.label}</span>
              <span className="text-muted-foreground">
                <span
                  className={
                    isHigh
                      ? "text-destructive font-semibold"
                      : isMedium
                      ? "text-amber-500 font-semibold"
                      : "text-foreground font-semibold"
                  }
                >
                  {item.value.toLocaleString()}
                </span>
                {" / "}
                {item.limit.toLocaleString()} {item.unit || ""}
              </span>
            </div>
            <div className="relative">
              <Progress
                value={percentage}
                className={`h-2.5 ${
                  isHigh
                    ? "[&>div]:bg-destructive"
                    : isMedium
                    ? "[&>div]:bg-amber-500"
                    : "[&>div]:bg-primary"
                }`}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {percentage.toFixed(1)}% used
              {isHigh && " — Consider upgrading your plan"}
            </p>
          </motion.div>
        );
      })}
    </motion.div>
  );
};
