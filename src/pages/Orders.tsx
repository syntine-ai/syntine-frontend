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
  Loader2,
  Plus,
} from "lucide-react";
import { OrderDetailDrawer } from "@/components/commerce/OrderDetailDrawer";
import { AddOrderModal, type ManualOrderData } from "@/components/commerce/AddOrderModal";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format } from "date-fns";
import { useOrders, useOrderStats, useCreateOrder } from "@/hooks/useOrders";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const Orders = () => {
  const [page, setPage] = useState(1);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const { toast } = useToast();
  const createOrder = useCreateOrder();

  // Fetch orders with real API hook
  const { data: orders = [], isLoading, error } = useOrders({
    page,
    page_size: PAGE_SIZE,
  });

  // Fetch order stats
  const { data: stats } = useOrderStats();

  const handleRowClick = (orderId: string) => {
    setSelectedOrderId(orderId);
    setDrawerOpen(true);
  };

  const handleCreateOrder = async (data: ManualOrderData) => {
    try {
      await createOrder.mutateAsync(data);
      toast({
        title: "Order Created",
        description: "The order has been added successfully.",
      });
      setAddModalOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const totalPages = Math.ceil((orders.length > 0 ? PAGE_SIZE * page : 0) / PAGE_SIZE);

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
      actions={
        <Button onClick={() => setAddModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Order
        </Button>
      }
    >
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Failed to load orders. Please try again.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Summary Bar */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <AnalyticsSummaryCard
              title="Total Orders"
              value={(stats?.total_orders || 0).toString()}
              icon={ShoppingCart}
            />
            <AnalyticsSummaryCard
              title="COD Orders"
              value={(stats?.cod_orders || 0).toString()}
              icon={CreditCard}
            />
            <AnalyticsSummaryCard
              title="Trigger Ready"
              value={(stats?.trigger_ready || 0).toString()}
              icon={Truck}
            />
            <AnalyticsSummaryCard
              title="Total Revenue"
              value={`₹${((stats?.total_revenue || 0) / 100).toLocaleString()}`}
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
                {orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No orders found. Orders will appear here once synced from your commerce platform.
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
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
                          {order.items?.length || 0} items
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
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {orders.length >= PAGE_SIZE && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Showing page {page} of results
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => p + 1)}
                    disabled={orders.length < PAGE_SIZE}
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

          <AddOrderModal
            open={addModalOpen}
            onOpenChange={setAddModalOpen}
            onSubmit={handleCreateOrder}
            isSubmitting={createOrder.isPending}
          />
        </>
      )}
    </PageContainer>
  );
};

export default Orders;
