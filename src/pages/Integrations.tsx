import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink, Loader2, Check } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { restClient } from "@/api/client/rest.client";

const SHOPIFY_CLIENT_ID = "a502466d6b57de030d9dd87ce56d660b";

const Integrations = () => {
  const { data: integrations = [], isLoading, error } = useIntegrations();

  const handleManage = (id: string) => {
    console.log("Managing integration:", id);
  };

  const handleConfigure = (id: string) => {
    console.log("Configuring integration:", id);
  };

  const shopifyIntegration = integrations.find(i => i.source === "shopify");
  const isShopifyConnected = shopifyIntegration?.status === "connected";
  const isShopifyPending = shopifyIntegration?.status === "pending";

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-foreground">Integrations</h1>
        <p className="text-muted-foreground mt-1">
          Connect your commerce platforms to sync products, orders, and abandoned carts
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center h-64">
          <p className="text-destructive">Failed to load integrations. Please try again.</p>
        </div>
      )}

      {/* Available Integrations Section */}
      {!isLoading && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Available Integrations</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <ShopifyConnectCard
              integration={shopifyIntegration}
              isConnected={isShopifyConnected}
              isPending={isShopifyPending}
            />
          </div>
        </div>
      )}

      {/* Active Integrations Grid */}
      {!isLoading && integrations.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Integrations</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {integrations
              .filter(i => i.status === "connected")
              .map((integration) => (
                <IntegrationCard key={integration.id} integration={integration} onManage={handleManage} onConfigure={handleConfigure} />
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Integrations;

// Sub-components
const IntegrationCard = ({ integration, onManage, onConfigure }: { integration: any, onManage: (id: string) => void, onConfigure: (id: string) => void }) => {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden p-2">
          {integration.source === "shopify" ? (
            <img
              src="https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg"
              alt="Shopify logo"
              className="h-full w-full object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {integration.source[0].toUpperCase()}
            </span>
          )}
        </div>
        <Badge variant="default">Connected</Badge>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">
        {integration.source.charAt(0).toUpperCase() + integration.source.slice(1)}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {integration.store_domain && `Shop: ${integration.store_domain}`}
        {integration.last_sync_at && ` • Last synced: ${new Date(integration.last_sync_at).toLocaleDateString()}`}
      </p>

      <div className="flex gap-2 mt-auto">
        <Button variant="outline" size="sm" className="flex-1" onClick={() => onManage(integration.id)}>
          <Settings className="h-4 w-4 mr-1.5" />
          Manage
        </Button>
      </div>
    </div>
  );
}

const ShopifyConnectCard = ({ integration, isConnected, isPending }: { integration?: any, isConnected: boolean, isPending: boolean }) => {
  // If pending, pre-fill handle from DB and skip to "done" step to show install link
  const initialHandle = integration?.store_domain ? integration.store_domain.replace(".myshopify.com", "") : "";
  const initialStep = isPending ? "done" : "input";

  const [shopHandle, setShopHandle] = useState(initialHandle);
  const [step, setStep] = useState<"input" | "connecting" | "done">(initialStep);
  const [error, setError] = useState("");

  const installUrl = shopHandle
    ? `https://admin.shopify.com/store/${shopHandle}/oauth/install?client_id=${SHOPIFY_CLIENT_ID}`
    : "";

  const handleInitConnection = async () => {
    if (!shopHandle) return;

    setStep("connecting");
    setError("");

    try {
      await restClient.post("/integrations/shopify/init", {
        shop_domain: shopHandle,
      });
      setStep("done");
    } catch (e: any) {
      setError(e.message || "Failed to initiate connection");
      setStep("input");
    }
  };

  if (isConnected) {
    return null; // Don't show in "Available" if already connected
  }

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-[#95BF47]/10 border border-[#95BF47]/20 flex items-center justify-center overflow-hidden p-2">
          <img src="https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg" alt="Shopify" className="h-full w-full object-contain" />
        </div>
        <Badge variant={isPending ? "secondary" : "outline"}>
          {isPending ? "Pending" : "Available"}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">Shopify</h3>
      <p className="text-sm text-muted-foreground mb-4">
        {isPending
          ? "Connection initiated. Please install the app to finish setup."
          : "Connect your Shopify store to sync orders and automate confirmations."}
      </p>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="w-full mt-auto" variant={isPending ? "secondary" : "default"}>
            {isPending ? "Continue Setup" : "Connect"}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect Shopify Store</DialogTitle>
            <DialogDescription>
              Follow these steps to link your store to Syntine.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-4">
            {/* Step 1: Enter shop handle */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">1. Enter your store handle</h4>
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="my-store"
                  value={shopHandle}
                  onChange={(e) => setShopHandle(e.target.value.trim().toLowerCase())}
                  className="flex-1"
                  disabled={step === "done" || isPending}
                />
                <span className="text-sm text-muted-foreground whitespace-nowrap">.myshopify.com</span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Step 2: Register + Install */}
            {shopHandle && step !== "done" && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">2. Register & install the app</h4>
                <Button
                  className="w-full"
                  onClick={async () => {
                    await handleInitConnection();
                  }}
                  disabled={step === "connecting"}
                >
                  {step === "connecting" ? (
                    <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Registering...</>
                  ) : (
                    "Register Connection"
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Install link */}
            {step === "done" && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600">
                  <Check className="h-4 w-4" />
                  <span className="text-sm font-medium">Connection registered!</span>
                </div>

                <h4 className="font-medium text-sm">2. Install the Syntine App on your store</h4>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(installUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Install Syntine App on Shopify
                </Button>
                <p className="text-xs text-muted-foreground">
                  After installing, open the Syntine app in your Shopify Admin. It will automatically connect.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
