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
