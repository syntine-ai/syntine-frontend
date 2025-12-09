import { Card, CardContent } from "@/components/ui/card";
import { Phone, Calendar, Hash } from "lucide-react";

interface ContactInfoCardProps {
  name: string;
  phone: string;
  totalCalls: number;
  firstContacted: string;
  lastContacted: string;
}

export function ContactInfoCard({
  name,
  phone,
  totalCalls,
  firstContacted,
  lastContacted,
}: ContactInfoCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-semibold text-primary">
              {name.split(" ").map((n) => n[0]).join("")}
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{name}</h3>
            <p className="text-sm text-muted-foreground">{phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Hash className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-xl font-semibold text-foreground">{totalCalls}</p>
            <p className="text-xs text-muted-foreground">Total Calls</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{firstContacted}</p>
            <p className="text-xs text-muted-foreground">First Contact</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-secondary/30">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Phone className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground">{lastContacted}</p>
            <p className="text-xs text-muted-foreground">Last Contact</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
