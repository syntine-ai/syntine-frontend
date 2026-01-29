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
  CreditCard,
  Truck,
  Clock,
  CheckCircle2,
  AlertCircle,
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
import { OrderDetailDrawer } from "@/components/commerce/OrderDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format, isToday } from "date-fns";

const PAGE_SIZE = 20;

const Orders = () => {
  const { profile } = useAuth();
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch orders with pagination
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["commerce-orders", profile?.organization_id, page],
    queryFn: async () => {
      if (!profile?.organization_id) return { orders: [], count: 0 };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("commerce_orders")
        .select("*", { count: "exact" })
        .eq("organization_id", profile.organization_id)
        .order("order_created_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { orders: data || [], count: count || 0 };
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch summary stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["commerce-orders-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data: orders, error } = await supabase
        .from("commerce_orders")
        .select("id, payment_type, fulfillment_status, order_created_at, synced_at")
        .eq("organization_id", profile.organization_id);

      if (error) throw error;

      const total = orders?.length || 0;
      const todayOrders = orders?.filter((o) =>
        o.order_created_at ? isToday(new Date(o.order_created_at)) : false
      ).length || 0;
      const codOrders = orders?.filter((o) => o.payment_type === "cod").length || 0;
      const pendingOrders = orders?.filter((o) => o.fulfillment_status === "unfulfilled").length || 0;
      const lastOrder = orders?.[0]?.synced_at;

      return { total, todayOrders, codOrders, pendingOrders, lastOrder };
    },
    enabled: !!profile?.organization_id,
  });

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((ordersData?.count || 0) / PAGE_SIZE);

  const getPaymentBadge = (paymentType: string) => {
    switch (paymentType) {
      case "cod":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 border">
            COD
          </Badge>
        );
      case "prepaid":
        return (
          <Badge className="bg-success/15 text-success border-success/40 border">
            Prepaid
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            Unknown
          </Badge>
        );
    }
  };

  const getFulfillmentBadge = (status: string) => {
    switch (status) {
      case "fulfilled":
        return (
          <Badge className="bg-success/15 text-success border-success/40 border">
            <Truck className="h-3 w-3 mr-1" />
            Fulfilled
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 border">
            <Truck className="h-3 w-3 mr-1" />
            Partial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            <Clock className="h-3 w-3 mr-1" />
            Unfulfilled
          </Badge>
        );
    }
  };

  if (ordersLoading || statsLoading) {
    return (
      <OrgAppShell>
        <PageContainer title="Orders" subtitle="Loading your orders...">
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
        title="Orders"
        subtitle="Real-time view of your synced orders with trigger readiness"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Orders Today"
            value={stats?.todayOrders?.toString() || "0"}
            icon={ShoppingCart}
          />
          <AnalyticsSummaryCard
            title="COD Orders"
            value={stats?.codOrders?.toString() || "0"}
            icon={CreditCard}
          />
          <AnalyticsSummaryCard
            title="Pending Fulfillment"
            value={stats?.pendingOrders?.toString() || "0"}
            icon={Truck}
          />
          <AnalyticsSummaryCard
            title="Last Order"
            value={
              stats?.lastOrder
                ? format(new Date(stats.lastOrder), "MMM d, h:mm a")
                : "Never"
            }
            icon={Clock}
          />
        </div>

        {/* Orders Table */}
        {ordersData?.orders.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="No orders synced yet"
            description="Connect your Shopify store to see orders here. Orders will appear automatically via webhooks."
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
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Trigger Ready</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ordersData?.orders.map((order: any) => (
                  <TableRow
                    key={order.id}
                    className="cursor-pointer hover:bg-muted/30"
                    onClick={() => handleRowClick(order.id)}
                  >
                    <TableCell>
                      <span className="font-mono text-sm text-foreground">
                        #{order.order_number || order.external_order_id?.slice(-8)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {order.customer_name || "Guest"}
                        </p>
                        {order.customer_phone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {order.customer_phone}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-foreground">
                        {order.currency} {order.total_amount?.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>{getPaymentBadge(order.payment_type)}</TableCell>
                    <TableCell>
                      <span className="text-muted-foreground">
                        {order.items_count} items
                      </span>
                    </TableCell>
                    <TableCell>
                      {getFulfillmentBadge(order.fulfillment_status)}
                    </TableCell>
                    <TableCell>
                      <TriggerReadyBadge status={order.trigger_ready} />
                    </TableCell>
                    <TableCell>
                      <span className="text-muted-foreground text-sm">
                        {order.order_created_at
                          ? format(new Date(order.order_created_at), "MMM d, h:mm a")
                          : "--"}
                      </span>
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
                  {Math.min((page + 1) * PAGE_SIZE, ordersData?.count || 0)} of{" "}
                  {ordersData?.count} orders
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

        <OrderDetailDrawer
          orderId={selectedOrderId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Orders;
