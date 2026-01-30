// Mock data for Part 2 - Voice Agents & Campaigns
// This data structure is designed to match future backend API responses

export type AgentType = "Outbound" | "Inbound";

export interface MockAgent {
  id: string;
  name: string;
  type: AgentType;
  purpose: string;
  usedBy: string[];
  status: "Active" | "Inactive";
  metrics: {
    callsHandled: number;
    successRate?: string;
    resolutionRate?: string;
  };
  canToggle: boolean;
  editedBy: string;
  lastUpdated: string;
  details: {
    scenarios: string[];
    dataUsed: string[];
    complianceNote: string;
  };
}

export interface MockCampaign {
  id: string;
  name: string;
  trigger: string;
  triggerDescription: string;
  agentUsed: string;
  agentId: string;
  status: "Enabled" | "Disabled";
  metrics: {
    lastTriggered: string;
    successRate: string;
    totalCalls: number;
  };
  details: {
    whatTriggers: string;
    stepByStep: string[];
    disclaimer: string;
  };
}

export const mockAgents: MockAgent[] = [
  {
    id: "order_confirmation_agent",
    name: "Order Confirmation Agent",
    type: "Outbound",
    purpose: "Confirms COD orders via automated voice calls to reduce RTO (Return to Origin) and verify genuine orders.",
    usedBy: ["Order Confirmation Campaign"],
    status: "Active",
    metrics: {
      callsHandled: 124,
      successRate: "78%",
    },
    canToggle: true,
    editedBy: "System",
    lastUpdated: "01/28/2026, 14:30",
    details: {
      scenarios: [
        "Confirms order details with the customer",
        "Verifies delivery address and contact number",
        "Offers option to cancel or modify order",
        "Handles objections and answers common questions",
      ],
      dataUsed: ["Order details", "Customer name", "Phone number", "Delivery address", "Product information"],
      complianceNote:
        "This agent only contacts customers who have placed orders. All calls are transactional in nature and comply with telecom regulations. Calls are recorded for quality and training purposes.",
    },
  },
  {
    id: "cart_abandonment_agent",
    name: "Cart Abandonment Agent",
    type: "Outbound",
    purpose: "Recovers abandoned carts via automated voice calls to help customers complete their purchase.",
    usedBy: ["Cart Abandonment Campaign"],
    status: "Active",
    metrics: {
      callsHandled: 67,
      successRate: "42%",
    },
    canToggle: true,
    editedBy: "System",
    lastUpdated: "01/25/2026, 10:15",
    details: {
      scenarios: [
        "Reminds customer about items left in cart",
        "Offers assistance with checkout issues",
        "Answers product-related questions",
        "Provides limited-time recovery incentives (if configured)",
      ],
      dataUsed: ["Cart items", "Customer name", "Phone number", "Product details", "Cart value"],
      complianceNote:
        "This agent contacts customers who initiated checkout but didn't complete. Customers can opt-out at any time. All calls follow a transactional recovery pattern.",
    },
  },
  {
    id: "inbound_support_agent",
    name: "Inbound Support Agent",
    type: "Inbound",
    purpose: "Handles inbound customer calls and callbacks from missed outbound calls to provide 24/7 support coverage.",
    usedBy: ["Inbound calls", "Missed outbound callbacks"],
    status: "Active",
    metrics: {
      callsHandled: 29,
      resolutionRate: "90%",
    },
    canToggle: false,
    editedBy: "System",
    lastUpdated: "01/20/2026, 09:00",
    details: {
      scenarios: [
        "Answers customer queries about orders",
        "Provides order status updates",
        "Handles return and refund inquiries",
        "Escalates complex issues to human agents",
      ],
      dataUsed: ["Order history", "Customer profile", "Support ticket history", "Product catalog"],
      complianceNote:
        "This agent handles inbound calls initiated by customers. All interactions are recorded and may be reviewed for quality assurance.",
    },
  },
];

export const mockCampaigns: MockCampaign[] = [
  {
    id: "order_confirmation_campaign",
    name: "Order Confirmation",
    trigger: "COD order placed",
    triggerDescription: "Automatically calls customers when they place a Cash on Delivery order",
    agentUsed: "Order Confirmation Agent",
    agentId: "order_confirmation_agent",
    status: "Enabled",
    metrics: {
      lastTriggered: "2 minutes ago",
      successRate: "78%",
      totalCalls: 124,
    },
    details: {
      whatTriggers:
        "This campaign is triggered automatically when a customer places a COD (Cash on Delivery) order on your store. The call is made within 5-15 minutes of order placement.",
      stepByStep: [
        "Customer places a COD order on your Shopify store",
        "Order data is synced to Syntine in real-time via webhooks",
        "The system verifies the order has a valid phone number (Trigger Ready)",
        "Order Confirmation Agent initiates an outbound call",
        "Agent confirms order details and delivery address with customer",
        "Customer response is recorded and order is marked as confirmed or cancelled",
        "If cancelled, order status is updated in your store",
      ],
      disclaimer:
        "This is a transactional campaign designed for order verification. It is not intended for marketing or promotional purposes. All calls are recorded and comply with telecom regulations.",
    },
  },
  {
    id: "cart_abandonment_campaign",
    name: "Cart Abandonment",
    trigger: "Cart abandoned",
    triggerDescription: "Automatically calls customers who left items in their cart without completing checkout",
    agentUsed: "Cart Abandonment Agent",
    agentId: "cart_abandonment_agent",
    status: "Disabled",
    metrics: {
      lastTriggered: "—",
      successRate: "—",
      totalCalls: 0,
    },
    details: {
      whatTriggers:
        "This campaign is triggered when a customer adds items to their cart, initiates checkout with their phone number, but doesn't complete the purchase within 1 hour.",
      stepByStep: [
        "Customer adds items to cart and enters phone number during checkout",
        "Customer leaves without completing the purchase",
        "After 1 hour, cart is marked as abandoned",
        "System verifies cart has a valid phone number (Trigger Ready)",
        "Cart Abandonment Agent initiates an outbound call",
        "Agent reminds customer about their cart and offers assistance",
        "If customer wants to proceed, they receive a recovery link via SMS",
        "Cart recovery is tracked and reported",
      ],
      disclaimer:
        "This is a cart recovery campaign. Customers can opt-out at any time during the call. The campaign follows transactional patterns and is not used for cold marketing.",
    },
  },
];

// Helper functions
export const getAgentById = (id: string): MockAgent | undefined => {
  return mockAgents.find((agent) => agent.id === id);
};

export const getCampaignById = (id: string): MockCampaign | undefined => {
  return mockCampaigns.find((campaign) => campaign.id === id);
};

export const getAgentStats = () => ({
  total: mockAgents.length,
  active: mockAgents.filter((a) => a.status === "Active").length,
  totalCalls: mockAgents.reduce((sum, a) => sum + a.metrics.callsHandled, 0),
});

export const getCampaignStats = () => ({
  total: mockCampaigns.length,
  enabled: mockCampaigns.filter((c) => c.status === "Enabled").length,
  totalCalls: mockCampaigns.reduce((sum, c) => sum + c.metrics.totalCalls, 0),
});
