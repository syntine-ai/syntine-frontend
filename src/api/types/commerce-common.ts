/**
 * Commerce Common Types
 * Shared enums and types for commerce modules
 */

// Commerce Source
export type CommerceSource = 'shopify' | 'woocommerce' | 'custom_webhook';

// Product Status
export type ProductStatus = 'active' | 'draft' | 'archived';

// Payment Type
export type PaymentType = 'cod' | 'prepaid' | 'unknown';

// Order Financial Status
export type OrderFinancialStatus =
    | 'pending'
    | 'paid'
    | 'refunded'
    | 'partially_refunded'
    | 'voided';

// Order Fulfillment Status
export type OrderFulfillmentStatus =
    | 'unfulfilled'
    | 'partial'
    | 'fulfilled'
    | 'restocked';

// Trigger Ready Status
export type TriggerReadyStatus =
    | 'ready'
    | 'missing_phone'
    | 'not_applicable';

// Cart Status
export type CartStatus = 'abandoned' | 'recovered' | 'expired';

// Integration Status
export type IntegrationStatus =
    | 'connected'
    | 'disconnected'
    | 'error'
    | 'pending';

// Webhook Status
export type WebhookStatus = 'active' | 'failed' | 'pending';
