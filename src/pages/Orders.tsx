import { useState } from "react";
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
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { OrderDetailDrawer } from "@/components/commerce/OrderDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format } from "date-fns";
import { demoOrders, getDemoOrderStats } from "@/data/demoCommerceData";

const PAGE_SIZE = 20;

const Orders = () => {
  const [page, setPage] = useState(0);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stats = getDemoOrderStats();
  const ordersData = {
    orders: demoOrders,
    count: demoOrders.length,
  };

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((ordersData.count || 0) / PAGE_SIZE);

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

  return (
    <PageContainer
        title="Orders"
        subtitle="Real-time view of your synced orders with trigger readiness"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Orders Today"
            value={stats.todayOrders.toString()}
            icon={ShoppingCart}
          />
          <AnalyticsSummaryCard
            title="COD Orders"
            value={stats.codOrders.toString()}
            icon={CreditCard}
          />
          <AnalyticsSummaryCard
            title="Pending Fulfillment"
            value={stats.pendingOrders.toString()}
            icon={Truck}
          />
          <AnalyticsSummaryCard
            title="Last Order"
            value={
              stats.lastOrder
                ? format(new Date(stats.lastOrder), "MMM d, h:mm a")
                : "Never"
            }
            icon={Clock}
          />
        </div>

        {/* Orders Table */}
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
              {ordersData.orders.map((order) => (
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
                {Math.min((page + 1) * PAGE_SIZE, ordersData.count)} of{" "}
                {ordersData.count} orders
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

        <OrderDetailDrawer
          orderId={selectedOrderId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
  );
};

export default Orders;
