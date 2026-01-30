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
} from "lucide-react";
import { ProductDetailDrawer } from "@/components/commerce/ProductDetailDrawer";
import { AnalyticsSummaryCard } from "@/components/analytics/AnalyticsSummaryCard";
import { format } from "date-fns";
import { demoProducts, getDemoProductStats } from "@/data/demoCommerceData";

const PAGE_SIZE = 20;

const Products = () => {
  const [page, setPage] = useState(0);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const stats = getDemoProductStats();
  const productsData = {
    products: demoProducts,
    count: demoProducts.length,
  };

  const handleRowClick = (productId: string) => {
    setSelectedProductId(productId);
    setDrawerOpen(true);
  };

  const totalPages = Math.ceil((productsData.count || 0) / PAGE_SIZE);

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
        subtitle="Read-only view of your synced product catalog"
      >
        {/* Summary Bar */}
        <div className="grid gap-4 md:grid-cols-4 mb-6">
          <AnalyticsSummaryCard
            title="Total Products"
            value={stats.total.toString()}
            icon={Package}
          />
          <AnalyticsSummaryCard
            title="Active Products"
            value={stats.active.toString()}
            icon={ShoppingBag}
          />
          <AnalyticsSummaryCard
            title="Draft Products"
            value={stats.draft.toString()}
            icon={AlertTriangle}
          />
          <AnalyticsSummaryCard
            title="Last Sync"
            value={
              stats.lastSync
                ? format(new Date(stats.lastSync), "MMM d, h:mm a")
                : "Never"
            }
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
              {productsData.products.map((product) => (
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
                      {product.commerce_product_variants?.length || 0}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-foreground">
                      {product.commerce_product_variants?.[0]?.price
                        ? `₹${product.commerce_product_variants[0].price}`
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
                {Math.min((page + 1) * PAGE_SIZE, productsData.count)} of{" "}
                {productsData.count} products
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

        <ProductDetailDrawer
          productId={selectedProductId}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      </PageContainer>
  );
};

export default Products;
