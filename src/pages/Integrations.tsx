import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Settings, ExternalLink, Loader2, Check, RefreshCw, Unplug,
  AlertTriangle, Wrench, RotateCcw, Store, Clock, Wifi, WifiOff,
} from "lucide-react";
import {
  useIntegrations,
  useDisconnectIntegration,
  useReconnectIntegration,
  useTriggerSync,
} from "@/hooks/useIntegrations";
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
import type { Integration } from "@/api/types/integrations";

const SHOPIFY_CLIENT_ID = "a502466d6b57de030d9dd87ce56d660b";

// ─── Status Helpers ──────────────────────────────────────────────────

const statusConfig: Record<string, {
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
  icon: React.ElementType;
}> = {
  connected: {
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10",
    borderColor: "border-emerald-500/20",
    label: "Connected",
    icon: Wifi,
  },
  pending: {
    color: "text-blue-400",
    bgColor: "bg-blue-500/10",
    borderColor: "border-blue-500/20",
    label: "Pending",
    icon: Clock,
  },
  disconnected: {
    color: "text-red-400",
    bgColor: "bg-red-500/10",
    borderColor: "border-red-500/20",
    label: "Disconnected",
    icon: WifiOff,
  },
  error: {
    color: "text-orange-400",
    bgColor: "bg-orange-500/10",
    borderColor: "border-orange-500/20",
    label: "Error",
    icon: AlertTriangle,
  },
};

function getStatusConfig(status: string) {
  return statusConfig[status] || statusConfig.disconnected;
}

function formatDate(dateStr?: string) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getErrorLabel(reason?: string) {
  switch (reason) {
    case "token_invalid": return "Access token expired";
    case "missing_scope": return "Missing API permissions";
    case "store_not_found": return "Store not found";
    default: return reason || "Unknown error";
  }
}

// ─── Main Page ───────────────────────────────────────────────────────

const Integrations = () => {
  const { data: integrations = [], isLoading, error } = useIntegrations();
  const [manageIntegration, setManageIntegration] = useState<Integration | null>(null);

  const shopifyIntegration = integrations.find(i => i.source === "shopify");

  const activeIntegrations = integrations.filter(i => i.status === "connected");
  const errorIntegrations = integrations.filter(i => i.status === "error");
  const disconnectedIntegrations = integrations.filter(i => i.status === "disconnected");
  const pendingIntegrations = integrations.filter(i => i.status === "pending");

  // Show Shopify connect card if no shopify integration exists, or it's pending
  const showShopifyConnect = !shopifyIntegration || shopifyIntegration.status === "pending";

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
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

      {!isLoading && (
        <div className="space-y-8">
          {/* 🟢 Active Integrations */}
          {activeIntegrations.length > 0 && (
            <IntegrationSection
              title="Active Integrations"
              icon={<Wifi className="h-5 w-5 text-emerald-400" />}
              integrations={activeIntegrations}
              onManage={setManageIntegration}
            />
          )}

          {/* 🟠 Needs Attention */}
          {errorIntegrations.length > 0 && (
            <IntegrationSection
              title="Needs Attention"
              icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
              integrations={errorIntegrations}
              onManage={setManageIntegration}
            />
          )}

          {/* 🔴 Disconnected */}
          {disconnectedIntegrations.length > 0 && (
            <IntegrationSection
              title="Disconnected"
              icon={<WifiOff className="h-5 w-5 text-red-400" />}
              integrations={disconnectedIntegrations}
              onManage={setManageIntegration}
            />
          )}

          {/* ⚪ Available / Pending */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-muted-foreground" />
              {pendingIntegrations.length > 0 ? "Available & Pending" : "Available Integrations"}
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {showShopifyConnect && (
                <ShopifyConnectCard
                  integration={shopifyIntegration}
                  isPending={shopifyIntegration?.status === "pending"}
                />
              )}
              {/* Placeholder for future integrations */}
              <div className="border border-dashed border-border rounded-xl p-5 flex flex-col items-center justify-center min-h-[180px] opacity-50">
                <span className="text-sm text-muted-foreground">More integrations coming soon</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Manage Dialog */}
      {manageIntegration && (
        <ManageDialog
          integration={manageIntegration}
          onClose={() => setManageIntegration(null)}
        />
      )}
    </div>
  );
};

export default Integrations;

// ─── Section Component ───────────────────────────────────────────────

const IntegrationSection = ({
  title,
  icon,
  integrations,
  onManage,
}: {
  title: string;
  icon: React.ReactNode;
  integrations: Integration[];
  onManage: (i: Integration) => void;
}) => (
  <div>
    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
      {icon}
      {title}
      <span className="text-sm font-normal text-muted-foreground">({integrations.length})</span>
    </h2>
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {integrations.map((integration) => (
        <IntegrationCard
          key={integration.id}
          integration={integration}
          onManage={() => onManage(integration)}
        />
      ))}
    </div>
  </div>
);

// ─── Integration Card ────────────────────────────────────────────────

const IntegrationCard = ({
  integration,
  onManage,
}: {
  integration: Integration;
  onManage: () => void;
}) => {
  const reconnect = useReconnectIntegration();
  const cfg = getStatusConfig(integration.status);
  const StatusIcon = cfg.icon;

  const handleReconnect = () => {
    reconnect.mutate(integration.id);
  };

  const primaryAction = () => {
    switch (integration.status) {
      case "connected":
        return (
          <Button variant="outline" size="sm" className="flex-1" onClick={onManage}>
            <Settings className="h-4 w-4 mr-1.5" />
            Manage
          </Button>
        );
      case "error":
        return (
          <Button
            size="sm"
            className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            onClick={handleReconnect}
            disabled={reconnect.isPending}
          >
            {reconnect.isPending ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Fixing...</>
            ) : (
              <><Wrench className="h-4 w-4 mr-1.5" />Fix Connection</>
            )}
          </Button>
        );
      case "disconnected":
        return (
          <Button
            size="sm"
            className="flex-1"
            onClick={handleReconnect}
            disabled={reconnect.isPending}
          >
            {reconnect.isPending ? (
              <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Reconnecting...</>
            ) : (
              <><RotateCcw className="h-4 w-4 mr-1.5" />Reconnect</>
            )}
          </Button>
        );
      default:
        return null;
    }
  };

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
        <Badge className={`${cfg.bgColor} ${cfg.color} ${cfg.borderColor} border`}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {cfg.label}
        </Badge>
      </div>

      <h3 className="text-base font-semibold text-foreground mb-1">
        {integration.store_name || integration.source.charAt(0).toUpperCase() + integration.source.slice(1)}
      </h3>

      <p className="text-sm text-muted-foreground mb-4 line-clamp-2 flex-1">
        {integration.store_domain && <span>{integration.store_domain}</span>}
        {integration.status === "error" && integration.last_error_reason && (
          <span className="block text-orange-400 text-xs mt-1">
            ⚠ {getErrorLabel(integration.last_error_reason)}
            {integration.last_error_at && ` • ${formatDate(integration.last_error_at)}`}
          </span>
        )}
        {integration.status === "disconnected" && integration.last_disconnected_at && (
          <span className="block text-red-400 text-xs mt-1">
            Disconnected {formatDate(integration.last_disconnected_at)}
          </span>
        )}
        {integration.status === "connected" && integration.last_sync_at && (
          <span className="block text-xs mt-1">
            Last synced: {formatDate(integration.last_sync_at)}
          </span>
        )}
      </p>

      <div className="flex gap-2 mt-auto">
        {primaryAction()}
        {integration.status === "connected" && (
          <Button variant="ghost" size="sm" onClick={onManage}>
            <ExternalLink className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

// ─── Manage Dialog ───────────────────────────────────────────────────

const ManageDialog = ({
  integration,
  onClose,
}: {
  integration: Integration;
  onClose: () => void;
}) => {
  const disconnect = useDisconnectIntegration();
  const sync = useTriggerSync();
  const [confirmDisconnect, setConfirmDisconnect] = useState(false);

  const cfg = getStatusConfig(integration.status);
  const StatusIcon = cfg.icon;

  const handleDisconnect = () => {
    disconnect.mutate(integration.id, {
      onSuccess: () => {
        onClose();
      },
    });
  };

  const handleSync = () => {
    sync.mutate(integration.id);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Manage Integration
          </DialogTitle>
          <DialogDescription>
            {integration.store_name || integration.store_domain || integration.source}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Status</span>
            <Badge className={`${cfg.bgColor} ${cfg.color} ${cfg.borderColor} border`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {cfg.label}
            </Badge>
          </div>

          {/* Store Info */}
          <div className="space-y-3 border-t border-border pt-4">
            <InfoRow label="Store Domain" value={integration.store_domain || "—"} />
            <InfoRow label="Connected Since" value={formatDate(integration.created_at)} />
            <InfoRow label="Last Sync" value={formatDate(integration.last_sync_at)} />
            <InfoRow label="Products Synced" value={formatDate(integration.last_products_sync_at)} />
            <InfoRow label="Orders Synced" value={formatDate(integration.last_orders_sync_at)} />
            {integration.last_error_reason && (
              <InfoRow
                label="Last Error"
                value={getErrorLabel(integration.last_error_reason)}
                valueClassName="text-orange-400"
              />
            )}
            {integration.last_disconnected_at && (
              <InfoRow
                label="Last Disconnected"
                value={formatDate(integration.last_disconnected_at)}
                valueClassName="text-red-400"
              />
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3 border-t border-border pt-4">
            {/* Sync Button */}
            {integration.status === "connected" && (
              <Button
                className="w-full"
                variant="outline"
                onClick={handleSync}
                disabled={sync.isPending}
              >
                {sync.isPending ? (
                  <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Syncing...</>
                ) : (
                  <><RefreshCw className="h-4 w-4 mr-1.5" />Sync Products Now</>
                )}
              </Button>
            )}

            {sync.isSuccess && (
              <p className="text-sm text-emerald-400 flex items-center gap-1">
                <Check className="h-4 w-4" /> Sync completed successfully
              </p>
            )}

            {sync.isError && (
              <p className="text-sm text-destructive">
                {(sync.error as any)?.message || "Sync failed. Please try again."}
              </p>
            )}

            {/* Disconnect Button */}
            {!confirmDisconnect ? (
              <Button
                className="w-full"
                variant="destructive"
                onClick={() => setConfirmDisconnect(true)}
              >
                <Unplug className="h-4 w-4 mr-1.5" />
                Disconnect Integration
              </Button>
            ) : (
              <div className="space-y-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <p className="text-sm text-destructive font-medium">
                  Are you sure? This will stop all syncing and webhook processing.
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    className="flex-1"
                    onClick={handleDisconnect}
                    disabled={disconnect.isPending}
                  >
                    {disconnect.isPending ? (
                      <><Loader2 className="h-4 w-4 mr-1.5 animate-spin" />Disconnecting...</>
                    ) : (
                      "Yes, Disconnect"
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setConfirmDisconnect(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Info Row  ────────────────────────────────────────────────────────

const InfoRow = ({
  label,
  value,
  valueClassName = "",
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) => (
  <div className="flex items-center justify-between">
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`text-sm font-medium ${valueClassName}`}>{value}</span>
  </div>
);

// ─── Shopify Connect Card ────────────────────────────────────────────

const ShopifyConnectCard = ({
  integration,
  isPending,
}: {
  integration?: Integration;
  isPending: boolean;
}) => {
  const initialHandle = integration?.store_domain
    ? integration.store_domain.replace(".myshopify.com", "")
    : "";
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

  return (
    <div className="bg-card rounded-xl border border-border p-5 flex flex-col relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="h-12 w-12 rounded-lg bg-[#95BF47]/10 border border-[#95BF47]/20 flex items-center justify-center overflow-hidden p-2">
          <img
            src="https://cdn.shopify.com/shopifycloud/brochure/assets/brand-assets/shopify-logo-primary-logo-456baa801ee66a0a435671082365958316831c9960c480451dd0330bcdae304f.svg"
            alt="Shopify"
            className="h-full w-full object-contain"
          />
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
            {isPending ? "Complete Setup" : "Connect"}
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
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                  .myshopify.com
                </span>
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>

            {/* Step 2: Register + Install */}
            {shopHandle && step !== "done" && (
              <div className="space-y-3">
                <h4 className="font-medium text-sm">2. Register & install the app</h4>
                <Button
                  className="w-full"
                  onClick={handleInitConnection}
                  disabled={step === "connecting"}
                >
                  {step === "connecting" ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> Registering...
                    </>
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

                <h4 className="font-medium text-sm">
                  2. Install the Syntine App on your store
                </h4>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(installUrl, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 mr-1.5" />
                  Install Syntine App on Shopify
                </Button>
                <p className="text-xs text-muted-foreground">
                  After installing, open the Syntine app in your Shopify Admin. It will
                  automatically connect.
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
