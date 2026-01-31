import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink, Loader2 } from "lucide-react";
import { useIntegrations } from "@/hooks/useIntegrations";

const Integrations = () => {
  const { data: integrations = [], isLoading, error } = useIntegrations();

  const handleManage = (id: string) => {
    console.log("Managing integration:", id);
  };

  const handleConfigure = (id: string) => {
    console.log("Configuring integration:", id);
  };

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

      {/* Integration Cards Grid */}
      {!isLoading && !error && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {integrations.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No integrations configured yet.</p>
            </div>
          ) : (
            integrations.map((integration) => {
              const isConnected = integration.status === "connected";

              return (
                <div
                  key={integration.id}
                  className="bg-card rounded-xl border border-border p-5 flex flex-col"
                >
                  {/* Top Row: Icon & Status */}
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
                    <Badge
                      className={
                        isConnected
                          ? "bg-success/15 text-success border-success/40 border text-xs"
                          : "bg-warning/15 text-warning border-warning/40 border text-xs"
                      }
                    >
                      {isConnected ? "Connected" : "Not Connected"}
                    </Badge>
                  </div>

                  {/* App Name */}
                  <h3 className="text-base font-semibold text-foreground mb-1">
                    {integration.source.charAt(0).toUpperCase() + integration.source.slice(1)}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                    {integration.store_domain && `Shop: ${integration.store_domain}`}
                    {integration.last_sync_at && ` • Last synced: ${new Date(integration.last_sync_at).toLocaleDateString()}`}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleManage(integration.id)}
                    >
                      <Settings className="h-4 w-4 mr-1.5" />
                      Manage
                    </Button>
                    {isConnected && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="flex-1"
                        onClick={() => handleConfigure(integration.id)}
                      >
                        <ExternalLink className="h-4 w-4 mr-1.5" />
                        Configure
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default Integrations;

