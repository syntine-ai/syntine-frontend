import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  ShoppingCart,
  Phone,
  Mail,
  Clock,
  ExternalLink,
  Link2,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { TriggerReadyBadge } from "./TriggerReadyBadge";

interface CartDetailDrawerProps {
  cartId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CartDetailDrawer({
  cartId,
  open,
  onOpenChange,
}: CartDetailDrawerProps) {
  const { data: cart, isLoading } = useQuery({
    queryKey: ["commerce-cart-detail", cartId],
    queryFn: async () => {
      if (!cartId) return null;

      const { data, error } = await supabase
        .from("commerce_abandoned_carts")
        .select("*, commerce_cart_items(*)")
        .eq("id", cartId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!cartId && open,
  });

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
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Cart Details
          </SheetTitle>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : cart ? (
          <div className="space-y-6">
            {/* Cart Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Cart #{cart.external_cart_id?.slice(-8) || cart.id.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    Abandoned{" "}
                    {cart.abandoned_at
                      ? format(new Date(cart.abandoned_at), "MMMM d, yyyy 'at' h:mm a")
                      : "--"}
                  </p>
                </div>
                {getStatusBadge(cart.status)}
              </div>
            </div>

            <Separator />

            {/* Cart Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Cart Value</p>
                <p className="text-lg font-semibold text-foreground">
                  {cart.currency} {cart.total_value?.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Trigger Status</p>
                <div className="mt-1">
                  <TriggerReadyBadge status={cart.trigger_ready} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Customer Info */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Customer Information
              </h4>
              <div className="space-y-2">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary">
                      {cart.customer_name?.charAt(0)?.toUpperCase() || "G"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {cart.customer_name || "Guest Customer"}
                    </p>
                    {cart.customer_phone ? (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {cart.customer_phone}
                      </p>
                    ) : (
                      <p className="text-xs text-warning flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        No phone number
                      </p>
                    )}
                    {cart.customer_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {cart.customer_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Cart Items */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Items ({cart.commerce_cart_items?.length || 0})
              </h4>
              <div className="space-y-2">
                {cart.commerce_cart_items?.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No items</p>
                ) : (
                  cart.commerce_cart_items?.map((item: any) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/50"
                    >
                      <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="h-12 w-12 object-cover"
                          />
                        ) : (
                          <ShoppingCart className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {item.title}
                        </p>
                        {item.variant_title && (
                          <p className="text-xs text-muted-foreground">
                            {item.variant_title}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Qty: {item.quantity} × ₹{item.price?.toFixed(2)}
                        </p>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        ₹{item.total?.toFixed(2)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Total */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Total Cart Value</span>
                <span className="text-lg font-semibold text-foreground">
                  {cart.currency} {cart.total_value?.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Recovery URL */}
            {cart.recovery_url && (
              <>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Recovery Link
                  </h4>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => window.open(cart.recovery_url, "_blank")}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Open Recovery URL
                    <ExternalLink className="h-3.5 w-3.5 ml-auto" />
                  </Button>
                </div>
              </>
            )}

            <Separator />

            {/* Sync Status */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Source</span>
                <Badge variant="outline" className="text-xs">
                  Shopify
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Last Synced</span>
                <span className="text-foreground">
                  {format(new Date(cart.synced_at), "MMM d, h:mm a")}
                </span>
              </div>
            </div>

            {/* Notice */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                Cart data is read-only. Recovery actions are available in Part 2.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Cart not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
