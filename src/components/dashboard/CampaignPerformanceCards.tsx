import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ShoppingCart, TrendingUp } from "lucide-react";
import { demoCampaignPerformance, formatCurrency } from "@/data/demoOutcomesData";
import { Link } from "react-router-dom";

export function CampaignPerformanceCards() {
  const orderConfirmation = demoCampaignPerformance.find(
    (c) => c.campaignId === "order_confirmation_campaign"
  );
  const cartAbandonment = demoCampaignPerformance.find(
    (c) => c.campaignId === "cart_abandonment_campaign"
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Order Confirmation Campaign */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-border/50 hover:border-border transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Order Confirmation
              </CardTitle>
              <Badge className="bg-success/15 text-success border-success/30">
                Active
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              COD order verification calls
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Orders Triggered</p>
                <p className="text-2xl font-bold text-foreground">
                  {orderConfirmation?.triggered || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Confirmation Rate</p>
                <p className="text-2xl font-bold text-success">
                  {orderConfirmation?.rate || 0}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">
                  {orderConfirmation?.confirmed || 0} confirmed
                </span>
              </div>
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-destructive" />
                <span className="text-sm text-muted-foreground">
                  {orderConfirmation?.rejected || 0} rejected
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Revenue Secured
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(orderConfirmation?.revenueSecured || 0)}
              </span>
            </div>

            <Link
              to="/app/campaigns/order_confirmation_campaign"
              className="block text-sm text-primary hover:underline pt-2"
            >
              View campaign details →
            </Link>
          </CardContent>
        </Card>
      </motion.div>

      {/* Cart Abandonment Campaign */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Card className="border-border/50 hover:border-border transition-colors">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-semibold">
                Cart Abandonment
              </CardTitle>
              <Badge className="bg-muted text-muted-foreground border-border">
                Disabled
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Abandoned cart recovery calls
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Carts Triggered</p>
                <p className="text-2xl font-bold text-foreground">
                  {cartAbandonment?.triggered || 0}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Recovery Rate</p>
                <p className="text-2xl font-bold text-primary">
                  {cartAbandonment?.rate || 0}%
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-success" />
                <span className="text-sm text-muted-foreground">
                  {cartAbandonment?.recovered || 0} recovered
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Revenue Recovered
                </span>
              </div>
              <span className="text-lg font-bold text-primary">
                {formatCurrency(cartAbandonment?.revenueSecured || 0)}
              </span>
            </div>

            <Link
              to="/app/campaigns/cart_abandonment_campaign"
              className="block text-sm text-primary hover:underline pt-2"
            >
              View campaign details →
            </Link>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
