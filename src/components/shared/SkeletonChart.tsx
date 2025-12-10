import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface SkeletonChartProps {
  className?: string;
  height?: string;
}

export function SkeletonChart({ className, height = "h-[300px]" }: SkeletonChartProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg p-6",
        "bg-card border border-border",
        className
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-20 rounded-md" />
          <Skeleton className="h-8 w-20 rounded-md" />
        </div>
      </div>
      <div className={cn("relative", height)}>
        {/* Chart bars skeleton */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-2 h-full pb-8">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton
              key={i}
              className="flex-1 rounded-t-md"
              style={{ height: `${Math.random() * 60 + 20}%` }}
            />
          ))}
        </div>
        {/* X-axis */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-around">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-8" />
          ))}
        </div>
      </div>
    </div>
  );
}
