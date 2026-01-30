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
  DollarSign,
  TrendingUp,
  Clock,
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { CartDetailDrawer } from "@/components/commerce/CartDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format } from "date-fns";
import { demoAbandonedCarts, getDemoCartStats } from "@/data/demoCommerceData";

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
  const [page, setPage] = useState(0);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stats = getDemoCartStats();
  const cartsData = {
    carts: demoAbandonedCarts,
    count: demoAbandonedCarts.length,
  };

  const handleRowClick = (cartId: string) => {
    setSelectedCartId(cartId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((cartsData.count || 0) / PAGE_SIZE);

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

  return (
    <PageContainer
        title="Abandoned Carts"
        subtitle="Track abandoned carts for recovery campaigns"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Carts Today"
            value={stats.todayCarts.toString()}
            icon={ShoppingCart}
          />
          <AnalyticsSummaryCard
            title="Total Cart Value"
            value={`₹${stats.totalValue.toLocaleString()}`}
            icon={DollarSign}
          />
          <AnalyticsSummaryCard
            title="Avg Cart Value"
            value={`₹${stats.avgValue.toFixed(0)}`}
            icon={TrendingUp}
          />
          <AnalyticsSummaryCard
            title="Last Cart Event"
            value={
              stats.lastCart
                ? format(new Date(stats.lastCart), "MMM d, h:mm a")
                : "Never"
            }
            icon={Clock}
          />
        </div>

        {/* Carts Table */}
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
              {cartsData.carts.map((cart) => (
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
                {Math.min((page + 1) * PAGE_SIZE, cartsData.count)} of{" "}
                {cartsData.count} carts
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

        <CartDetailDrawer
          cartId={selectedCartId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
  );
};

export default AbandonedCarts;
