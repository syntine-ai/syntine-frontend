import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink } from "lucide-react";

interface Integration {
  id: string;
  name: string;
  description: string;
  iconUrl: string;
  status: "connected" | "not_connected";
}

const integrations: Integration[] = [
  {
    id: "shopify",
    name: "Shopify",
    description: "Sync products, orders, and abandoned carts from your Shopify store",
    iconUrl: "https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg",
    status: "connected",
  },
];

const Integrations = () => {
  const [connectionStates, setConnectionStates] = useState<Record<string, "connected" | "not_connected">>(
    Object.fromEntries(integrations.map((i) => [i.id, i.status]))
  );

  const handleConnect = (id: string) => {
    setConnectionStates((prev) => ({ ...prev, [id]: "connected" }));
  };

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

      {/* Integration Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {integrations.map((integration) => {
          const isConnected = connectionStates[integration.id] === "connected";

          return (
            <div
              key={integration.id}
              className="bg-card rounded-xl border border-border p-5 flex flex-col"
            >
              {/* Top Row: Icon & Status */}
              <div className="flex items-start justify-between mb-4">
                <div className="h-12 w-12 rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden p-2">
                  <img
                    src={integration.iconUrl}
                    alt={`${integration.name} logo`}
                    className="h-full w-full object-contain"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML = `<span class="text-lg font-bold text-muted-foreground">${integration.name[0]}</span>`;
                    }}
                  />
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
                {integration.name}
              </h3>

              {/* Description */}
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
                {integration.description}
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
                {isConnected ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConfigure(integration.id)}
                  >
                    <ExternalLink className="h-4 w-4 mr-1.5" />
                    Configure
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleConnect(integration.id)}
                  >
                    Connect
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Integrations;
