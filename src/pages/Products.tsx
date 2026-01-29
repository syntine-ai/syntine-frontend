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
  Package,
  ShoppingBag,
  AlertTriangle,
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { SkeletonCard } from "@/components/shared/SkeletonCard";
import { SkeletonTable } from "@/components/shared/SkeletonTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { ProductDetailDrawer } from "@/components/commerce/ProductDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { format } from "date-fns";

const PAGE_SIZE = 20;

const Products = () => {
  const { profile } = useAuth();
  const [page, setPage] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Fetch products with pagination
  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["commerce-products", profile?.organization_id, page],
    queryFn: async () => {
      if (!profile?.organization_id) return { products: [], count: 0 };

      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from("commerce_products")
        .select("*, commerce_product_variants(count)", { count: "exact" })
        .eq("organization_id", profile.organization_id)
        .order("updated_at", { ascending: false })
        .range(from, to);

      if (error) throw error;
      return { products: data || [], count: count || 0 };
    },
    enabled: !!profile?.organization_id,
  });

  // Fetch summary stats
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["commerce-products-stats", profile?.organization_id],
    queryFn: async () => {
      if (!profile?.organization_id) return null;

      const { data: products, error } = await supabase
        .from("commerce_products")
        .select("id, status, synced_at")
        .eq("organization_id", profile.organization_id);

      if (error) throw error;

      const total = products?.length || 0;
      const active = products?.filter((p) => p.status === "active").length || 0;
      const draft = products?.filter((p) => p.status === "draft").length || 0;
      const lastSync = products?.[0]?.synced_at;

      return { total, active, draft, lastSync };
    },
    enabled: !!profile?.organization_id,
  });

  const handleRowClick = (productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((productsData?.count || 0) / PAGE_SIZE);

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

  if (productsLoading || statsLoading) {
    return (
      <OrgAppShell>
        <PageContainer
          title="Products"
          subtitle="Loading your product catalog..."
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
        title="Products"
        subtitle="Read-only view of your synced product catalog"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Total Products"
            value={stats?.total?.toString() || "0"}
            icon={Package}
          />
          <AnalyticsSummaryCard
            title="Active Products"
            value={stats?.active?.toString() || "0"}
            icon={ShoppingBag}
          />
          <AnalyticsSummaryCard
            title="Draft Products"
            value={stats?.draft?.toString() || "0"}
            icon={AlertTriangle}
          />
          <AnalyticsSummaryCard
            title="Last Sync"
            value={
              stats?.lastSync
                ? format(new Date(stats.lastSync), "MMM d, h:mm a")
                : "Never"
            }
            icon={Clock}
          />
        </div>

        {/* Products Table */}
        {productsData?.products.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No products synced yet"
            description="Connect your Shopify store and sync your products to see them here."
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
                  <TableHead>Product Name</TableHead>
                  <TableHead>Variants</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Source</TableHead>
                  <TableHead>Last Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productsData?.products.map((product: any) => (
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
                        {product.commerce_product_variants?.[0]?.count || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-foreground">--</span>
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
                        {format(new Date(product.updated_at), "MMM d, yyyy")}
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
                  {Math.min((page + 1) * PAGE_SIZE, productsData?.count || 0)} of{" "}
                  {productsData?.count} products
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

        <ProductDetailDrawer
          productId={selectedProductId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
    </OrgAppShell>
  );
};

export default Products;
