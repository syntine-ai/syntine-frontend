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
  Loader2,
} from "lucide-react";
import { CartDetailDrawer } from "@/components/commerce/CartDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { TriggerReadyBadge } from "@/components/commerce/TriggerReadyBadge";
import { format } from "date-fns";
import { useAbandonedCarts, useCartStats } from "@/hooks/useAbandonedCarts";

const PAGE_SIZE = 20;

const AbandonedCarts = () => {
  const [page, setPage] = useState(1);
  const [selectedCartId, setSelectedCartId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch carts with real API hook
  const { data: carts = [], isLoading, error } = useAbandonedCarts({
    page,
    page_size: PAGE_SIZE,
  });

  // Fetch cart stats
  const { data: stats } = useCartStats();

  const handleRowClick = (cartId: string) => {
    setSelectedCartId(cartId);
    setDrawerOpen(true);
  };

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
      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Failed to load carts. Please try again.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Summary Bar */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <AnalyticsSummaryCard
              title="Total Abandoned"
              value={(stats?.total_abandoned || 0).toString()}
              icon={ShoppingCart}
            />
            <AnalyticsSummaryCard
              title="Total Cart Value"
              value={`₹${((stats?.total_value || 0) / 100).toLocaleString()}`}
              icon={DollarSign}
            />
            <AnalyticsSummaryCard
              title="Recovered Carts"
              value={(stats?.recovered_carts || 0).toString()}
              icon={TrendingUp}
            />
            <AnalyticsSummaryCard
              title="Recovery Rate"
              value={`${(stats?.recovery_rate || 0).toFixed(1)}%`}
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
                {carts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No abandoned carts found. Carts will appear here once synced from your commerce platform.
                    </TableCell>
                  </TableRow>
                ) : (
                  carts.map((cart) => (
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
                          {cart.items?.length || 0} items
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
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {carts.length >= PAGE_SIZE && (
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
                    disabled={carts.length < PAGE_SIZE}
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
        </>
      )}
    </PageContainer>
  );
};

export default AbandonedCarts;

