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
  Package,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { ProductDetailDrawer } from "@/components/commerce/ProductDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { format } from "date-fns";
import { useProducts, useProductStats } from "@/hooks/useProducts";
import { useIntegrations } from "@/hooks/useIntegrations";
import { useTriggerSync } from "@/hooks/useIntegrations";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const PAGE_SIZE = 20;

const Products = () => {
  const [page, setPage] = useState(1);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch products with real API hook
  const { data: products = [], isLoading, error } = useProducts({
    page,
    page_size: PAGE_SIZE,
  });

  // Fetch product stats
  const { data: stats } = useProductStats();

  // Fetch integrations to find connected Shopify integration
  const { data: integrations = [] } = useIntegrations();
  const connectedIntegration = integrations.find(
    (i: any) => i.source === "shopify" && i.status === "connected"
  );

  // Sync mutation
  const syncMutation = useTriggerSync();

  const handleSync = async () => {
    if (!connectedIntegration) {
      toast({
        title: "No Connected Integration",
        description: "Please connect a Shopify store first from the Integrations page.",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await syncMutation.mutateAsync(connectedIntegration.id);
      toast({
        title: "Sync Complete ✅",
        description: result.message || "Products synced successfully",
      });
      // Refresh products and stats
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-stats"] });
    } catch (err: any) {
      toast({
        title: "Sync Failed",
        description: err.message || "Failed to sync products",
        variant: "destructive",
      });
    }
  };

  const handleRowClick = (productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-success/15 text-success border-success/40 border">
            Active
          </Badge>
        );
      case "draft":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 border">
            Draft
          </Badge>
        );
      case "archived":
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            Archived
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <PageContainer
      title="Products"
      subtitle="Synced product catalog from your Shopify store"
      actions={
        <Button
          onClick={handleSync}
          disabled={syncMutation.isPending || !connectedIntegration}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          {syncMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {syncMutation.isPending ? "Syncing..." : "Sync Products"}
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
          <p className="text-destructive">Failed to load products. Please try again.</p>
        </div>
      )}

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Summary Bar */}
          <div className="grid gap-4 md:grid-cols-4 mb-6">
            <AnalyticsSummaryCard
              title="Total Products"
              value={(stats?.total_products || 0).toString()}
              icon={Package}
            />
            <AnalyticsSummaryCard
              title="Active Products"
              value={(stats?.active_products || 0).toString()}
              icon={ShoppingBag}
            />
            <AnalyticsSummaryCard
              title="Draft Products"
              value={(stats?.draft_products || 0).toString()}
              icon={AlertTriangle}
            />
            <AnalyticsSummaryCard
              title="Total"
              value={(stats?.total_products || 0).toString()}
              icon={Clock}
            />
          </div>

          {/* Products Table */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-xl border border-border/50 overflow-hidden"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Product Name</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      No products found. Products will appear here once synced from your commerce platform.
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => (
                    <TableRow
                      key={product.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => handleRowClick(product.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0]}
                                alt={product.title}
                                className="h-10 w-10 rounded-lg object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-foreground">{product.title}</p>
                            {product.vendor && (
                              <p className="text-xs text-muted-foreground">{product.vendor}</p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">
                          {product.variants?.length || 0}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-foreground">
                          {product.variants?.[0]?.price
                            ? `₹${product.variants[0].price}`
                            : "--"}
                        </span>
                      </TableCell>
                      <TableCell>{getStatusBadge(product.status)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          <ShoppingBag className="h-3 w-3 mr-1" />
                          Shopify
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">
                          {product.updated_at
                            ? format(new Date(product.updated_at), "MMM d, yyyy")
                            : "--"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {products.length >= PAGE_SIZE && (
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
                    disabled={products.length < PAGE_SIZE}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </motion.div>

          <ProductDetailDrawer
            productId={selectedProductId}
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
          />
        </>
      )}
    </PageContainer>
  );
};

export default Products;

