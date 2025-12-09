import { Badge } from "@/components/ui/badge";

type OrgStatus = "active" | "trial" | "suspended";

interface OrgStatusPillProps {
  status: OrgStatus;
}

const statusConfig: Record<OrgStatus, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20 hover:bg-emerald-500/20",
  },
  trial: {
    label: "Trial",
    className: "bg-amber-500/10 text-amber-600 border-amber-500/20 hover:bg-amber-500/20",
  },
  suspended: {
    label: "Suspended",
    className: "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20",
  },
};

export const OrgStatusPill = ({ status }: OrgStatusPillProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={config.className}>
      {config.label}
    </Badge>
  );
};
