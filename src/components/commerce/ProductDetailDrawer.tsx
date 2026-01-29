import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Package, ShoppingBag, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductDetailDrawerProps {
  productId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProductDetailDrawer({
  productId,
  open,
  onOpenChange,
}: ProductDetailDrawerProps) {
  const { data: product, isLoading } = useQuery({
    queryKey: ["commerce-product-detail", productId],
    queryFn: async () => {
      if (!productId) return null;

      const { data, error } = await supabase
        .from("commerce_products")
        .select("*, commerce_product_variants(*)")
        .eq("id", productId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!productId && open,
  });

  // Count linked orders
  const { data: linkedOrders } = useQuery({
    queryKey: ["product-linked-orders", productId],
    queryFn: async () => {
      if (!productId) return 0;

      const { count, error } = await supabase
        .from("commerce_order_items")
        .select("*", { count: "exact", head: true })
        .eq("product_id", productId);

      if (error) return 0;
      return count || 0;
    },
    enabled: !!productId && open,
  });

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

  const getPriceRange = () => {
    if (!product?.commerce_product_variants?.length) return "--";
    const prices = product.commerce_product_variants
      .map((v: any) => v.price)
      .filter((p: any) => p != null);
    if (prices.length === 0) return "--";
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min === max) return `₹${min.toFixed(2)}`;
    return `₹${min.toFixed(2)} - ₹${max.toFixed(2)}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Product Details
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-lg" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : product ? (
          <div className="space-y-6">
            {/* Product Image */}
            <div className="h-48 w-full rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              {product.images?.[0] ? (
                <img
                  src={product.images[0]}
                  alt={product.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <Package className="h-16 w-16 text-muted-foreground" />
              )}
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <h3 className="text-xl font-semibold text-foreground">
                  {product.title}
                </h3>
                {getStatusBadge(product.status)}
              </div>
              {product.vendor && (
                <p className="text-sm text-muted-foreground mt-1">
                  by {product.vendor}
                </p>
              )}
            </div>

            <Separator />

            {/* Price & Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Price Range</p>
                <p className="text-lg font-semibold text-foreground">
                  {getPriceRange()}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Linked Orders</p>
                <p className="text-lg font-semibold text-foreground">
                  {linkedOrders || 0}
                </p>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">
                  Description
                </h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            <Separator />

            {/* Variants */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Variants ({product.commerce_product_variants?.length || 0})
              </h4>
              <div className="space-y-2">
                {product.commerce_product_variants?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No variants</p>
                ) : (
                  product.commerce_product_variants?.map((variant: any) => (
                    <div
                      key={variant.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {variant.title || "Default"}
                        </p>
                        {variant.sku && (
                          <p className="text-xs text-muted-foreground">
                            SKU: {variant.sku}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          ₹{variant.price?.toFixed(2) || "--"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {variant.inventory_quantity ?? "--"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <Badge variant="outline" className="text-xs">
                  <ShoppingBag className="h-3 w-3 mr-1" />
                  Shopify
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Product Type</span>
                <span className="text-foreground">
                  {product.product_type || "--"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Updated</span>
                <span className="text-foreground">
                  {format(new Date(product.updated_at), "MMM d, yyyy h:mm a")}
                </span>
              </div>
            </div>

            {/* Managed in Shopify Notice */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                This product is managed in Shopify. Changes sync automatically.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Product not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
