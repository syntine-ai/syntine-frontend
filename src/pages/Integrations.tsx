import { useState } from "react";
import { OrgAppShell } from "@/components/layout/OrgAppShell";
import { PageContainer } from "@/components/layout/PageContainer";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingBag,
  Store,
  Webhook,
  RefreshCw,
  CheckCircle2,
  Clock,
  ExternalLink,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { demoShopifyIntegration } from "@/data/demoCommerceData";

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: typeof ShoppingBag;
  status: "connected" | "coming_soon" | "not_configured" | "error";
}

const staticIntegrations: Integration[] = [
  {
    id: "woocommerce",
    name: "WooCommerce",
    description: "Connect your WordPress-based WooCommerce store",
    icon: Store,
    status: "coming_soon",
  },
  {
    id: "custom_webhook",
    name: "Custom Webhook",
    description: "Integrate any platform via custom webhooks",
    icon: Webhook,
    status: "coming_soon",
  },
];

const Integrations = () => {
  const { toast } = useToast();
  const [syncingProducts, setSyncingProducts] = useState(false);
  const [syncingOrders, setSyncingOrders] = useState(false);

  const shopifyIntegration = demoShopifyIntegration;

  const handleSyncProducts = async () => {
    setSyncingProducts(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Products synced",
      description: "Your product catalog has been updated.",
    });
    setSyncingProducts(false);
  };

  const handleSyncOrders = async () => {
    setSyncingOrders(true);
    await new Promise((resolve) => setTimeout(resolve, 2000));
    toast({
      title: "Orders synced",
      description: "Your orders have been updated.",
    });
    setSyncingOrders(false);
  };

  const getStatusBadge = (status: Integration["status"]) => {
    switch (status) {
      case "connected":
        return (
          <Badge className="bg-success/15 text-success border-success/40 border">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Connected
          </Badge>
        );
      case "coming_soon":
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            <Clock className="h-3 w-3 mr-1" />
            Coming Soon
          </Badge>
        );
      default:
        return (
          <Badge className="bg-muted text-muted-foreground border-border border">
            Not Configured
          </Badge>
        );
    }
  };

  const getWebhookStatus = (status: "active" | "failed" | "pending") => {
    switch (status) {
      case "active":
        return (
          <span className="flex items-center gap-1.5 text-success text-sm">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            Webhooks Active
          </span>
        );
      case "failed":
        return (
          <span className="flex items-center gap-1.5 text-destructive text-sm">
            <span className="h-2 w-2 rounded-full bg-destructive" />
            Webhooks Failed
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1.5 text-warning text-sm">
            <span className="h-2 w-2 rounded-full bg-warning" />
            Webhooks Pending
          </span>
        );
    }
  };

  return (
    <OrgAppShell>
      <PageContainer
        title="Integrations"
        subtitle="Connect your commerce platforms to sync products, orders, and abandoned carts"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Shopify Integration Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.3 }}
            className="bg-card rounded-xl border border-border/50 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-12 w-12 rounded-lg bg-[#96bf48]/15 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-[#96bf48]" />
              </div>
              {getStatusBadge("connected")}
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-1">
              Shopify
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Sync products, orders, and abandoned carts from your Shopify store
            </p>

            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Store</span>
                  <span className="text-sm font-medium text-foreground">
                    {shopifyIntegration.store_name}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Domain</span>
                  <a
                    href={`https://${shopifyIntegration.store_domain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                  >
                    {shopifyIntegration.store_domain}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Last Sync</span>
                  <span className="text-sm text-foreground">
                    {format(new Date(shopifyIntegration.last_sync_at), "MMM d, h:mm a")}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Webhooks</span>
                  {getWebhookStatus(shopifyIntegration.webhook_status)}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleSyncProducts}
                  disabled={syncingProducts}
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${syncingProducts ? "animate-spin" : ""}`} />
                  {syncingProducts ? "Syncing..." : "Sync Products"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={handleSyncOrders}
                  disabled={syncingOrders}
                >
                  <RefreshCw className={`h-4 w-4 mr-1.5 ${syncingOrders ? "animate-spin" : ""}`} />
                  {syncingOrders ? "Syncing..." : "Sync Orders"}
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Other Integrations (Coming Soon) */}
          {staticIntegrations.map((integration, index) => (
            <motion.div
              key={integration.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: (index + 1) * 0.1, duration: 0.3 }}
              className="bg-card rounded-xl border border-border/50 p-6 shadow-sm opacity-60"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center">
                  <integration.icon className="h-6 w-6 text-muted-foreground" />
                </div>
                {getStatusBadge(integration.status)}
              </div>

              <h3 className="text-lg font-semibold text-foreground mb-1">
                {integration.name}
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {integration.description}
              </p>

              <Button className="w-full" variant="secondary" disabled>
                Coming Soon
              </Button>
            </motion.div>
          ))}
        </div>
      </PageContainer>
    </OrgAppShell>
  );
};

export default Integrations;
