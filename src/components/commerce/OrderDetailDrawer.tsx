import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ShoppingCart,
  Phone,
  Mail,
  Truck,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { format } from "date-fns";
import { TriggerReadyBadge } from "./TriggerReadyBadge";
import { demoOrders } from "@/data/demoCommerceData";

interface OrderDetailDrawerProps {
  orderId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function OrderDetailDrawer({
  orderId,
  open,
  onOpenChange,
}: OrderDetailDrawerProps) {
  const order = orderId ? demoOrders.find(o => o.id === orderId) : null;

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
            Fulfilled
          </Badge>
        );
      case "partial":
        return (
          <Badge className="bg-warning/15 text-warning border-warning/40 border">
            Partial
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            Unfulfilled
          </Badge>
        );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-primary" />
            Order Details
          </SheetTitle>
        </SheetHeader>

        {order ? (
          <div className="space-y-6">
            {/* Order Header */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-foreground">
                    Order #{order.order_number || order.external_order_id?.slice(-8)}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {order.order_created_at
                      ? format(new Date(order.order_created_at), "MMMM d, yyyy 'at' h:mm a")
                      : "--"}
                  </p>
                </div>
                <TriggerReadyBadge status={order.trigger_ready} />
              </div>
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                <p className="text-lg font-semibold text-foreground">
                  {order.currency} {order.total_amount?.toFixed(2)}
                </p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-xs text-muted-foreground mb-1">Items</p>
                <p className="text-lg font-semibold text-foreground">
                  {order.items_count}
                </p>
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-muted-foreground" />
                {getPaymentBadge(order.payment_type)}
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-muted-foreground" />
                {getFulfillmentBadge(order.fulfillment_status)}
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
                      {order.customer_name?.charAt(0)?.toUpperCase() || "G"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {order.customer_name || "Guest Customer"}
                    </p>
                    {order.customer_phone && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {order.customer_phone}
                      </p>
                    )}
                    {order.customer_email && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {order.customer_email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Order Items */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-3">
                Items ({order.commerce_order_items?.length || 0})
              </h4>
              <div className="space-y-2">
                {order.commerce_order_items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.title}
                      </p>
                      {item.variant_title && (
                        <p className="text-xs text-muted-foreground">
                          {item.variant_title}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      ₹{item.total?.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-4 rounded-lg bg-muted/50 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">
                  ₹{order.subtotal?.toFixed(2) || "--"}
                </span>
              </div>
              {order.total_tax > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="text-foreground">
                    ₹{order.total_tax?.toFixed(2)}
                  </span>
                </div>
              )}
              {order.total_discounts > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Discounts</span>
                  <span className="text-success">
                    -₹{order.total_discounts?.toFixed(2)}
                  </span>
                </div>
              )}
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="font-medium text-foreground">Total</span>
                <span className="text-lg font-semibold text-foreground">
                  {order.currency} {order.total_amount?.toFixed(2)}
                </span>
              </div>
            </div>

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
                  {format(new Date(order.synced_at), "MMM d, h:mm a")}
                </span>
              </div>
            </div>

            {/* Managed Notice */}
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-primary flex items-center gap-1.5">
                <ExternalLink className="h-3.5 w-3.5" />
                This order is managed in Shopify. View full details in your Shopify admin.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            Order not found
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
