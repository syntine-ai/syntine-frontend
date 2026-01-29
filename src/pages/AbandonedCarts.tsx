import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { CartDetailDrawer } from "@/components/commerce/CartDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format, isToday } from "date-fns";

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
  const { profile } = useAuth();
  const [page, setPage] = useState(0);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch carts with pagination
  const { data: cartsData, isLoading: cartsLoading } = useQuery({
    queryKey: ["commerce-carts", profile?.organization_id, page],
    queryFn: async () => {
      if (!profile?.organization_id) return { carts: [], count: 0 };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("commerce_abandoned_carts")
        .select("*", { count: "exact" })
        .eq("organization_id", profile.organization_id)
        .eq("status", "abandoned")
        .order("abandoned_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { carts: data || [], count: count || 0 };
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch summary stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["commerce-carts-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data: carts, error } = await supabase
        .from("commerce_abandoned_carts")
        .select("id, total_value, abandoned_at, synced_at")
        .eq("organization_id", profile.organization_id)
        .eq("status", "abandoned");

      if (error) throw error;

      const total = carts?.length || 0;
      const todayCarts = carts?.filter((c) =>
        c.abandoned_at ? isToday(new Date(c.abandoned_at)) : false
      ).length || 0;
      const totalValue = carts?.reduce((sum, c) => sum + (c.total_value || 0), 0) || 0;
      const avgValue = total > 0 ? totalValue / total : 0;
      const lastCart = carts?.[0]?.synced_at;

      return { total, todayCarts, totalValue, avgValue, lastCart };
    },
    enabled: !!profile?.organization_id,
  });

  const handleRowClick = (cartId: string) => {
    setSelectedCartId(cartId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((cartsData?.count || 0) / PAGE_SIZE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "abandoned":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 border">
            Abandoned
          </Badge>
        );
      case "recovered":
        return (
          <Badge className="bg-success/15 text-success border-success/40 border">
            Recovered
          </Badge>
        );
      case "expired":
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            Expired
          </Badge>
        );
      default:
        return null;
    }
  };

  if (cartsLoading || statsLoading) {
    return (
      <OrgAppShell>
        <PageContainer
          title="Abandoned Carts"
          subtitle="Loading abandoned carts..."
        >
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
              <SkeletonCard className="h-[100px]" />
              <SkeletonCard className="h-[100px]" />
              <SkeletonCard className="h-[100px]" />
              <SkeletonCard className="h-[100px]" />
            </div>
            <SkeletonTable rows={8} />
          </div>
        </PageContainer>
      </OrgAppShell>
    );
  }

  return (
    <OrgAppShell>
      <PageContainer
        title="Abandoned Carts"
        subtitle="Track abandoned carts for recovery campaigns"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Carts Today"
            value={stats?.todayCarts?.toString() || "0"}
            icon={ShoppingCart}
          />
          <AnalyticsSummaryCard
            title="Total Cart Value"
            value={`₹${stats?.totalValue?.toLocaleString() || "0"}`}
            icon={DollarSign}
          />
          <AnalyticsSummaryCard
            title="Avg Cart Value"
            value={`₹${stats?.avgValue?.toFixed(0) || "0"}`}
            icon={TrendingUp}
          />
          <AnalyticsSummaryCard
            title="Last Cart Event"
            value={
              stats?.lastCart
                ? format(new Date(stats.lastCart), "MMM d, h:mm a")
                : "Never"
            }
            icon={Clock}
          />
        </div>

        {/* Carts Table */}
        {cartsData?.carts.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No abandoned carts yet"
            description="Abandoned carts will appear here when customers leave items in their cart without completing checkout."
            actionLabel="Go to Integrations"
            actionHref="/app/integrations"
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Cart ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Cart Value</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger Ready</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cartsData?.carts.map((cart: any) => (
                  <TableRow
                    key={cart.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleRowClick(cart.id)}
                  >
                    <TableCell>
                      <span className="font-mono text-sm text-foreground">
                        #{cart.external_cart_id?.slice(-8) || cart.id.slice(-8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {cart.customer_name || "Guest"}
                        </p>
                        {cart.customer_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {cart.customer_phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {cart.currency} {cart.total_value?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {cart.items_count} items
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {cart.abandoned_at
                          ? format(new Date(cart.abandoned_at), "MMM d, h:mm a")
                          : "--"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(cart.status)}</TableCell>
                    <TableCell>
                      <TriggerReadyBadge status={cart.trigger_ready} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing {page * PAGE_SIZE + 1} to{" "}
                  {Math.min((page + 1) * PAGE_SIZE, cartsData?.count || 0)} of{" "}
                  {cartsData?.count} carts
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                    disabled={page >= totalPages - 1}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        <CartDetailDrawer
          cartId={selectedCartId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default AbandonedCarts;
