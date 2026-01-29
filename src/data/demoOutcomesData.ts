// Demo data for Part 3 - Outcomes & Analytics Layer
// Structure matches future backend API response shape

export interface OutcomeMetrics {
  revenueRecovered: number;
  codOrdersConfirmed: number;
  abandonedCartsRecovered: number;
  estimatedRtoPrevented: number;
  callsConnectedRate: number;
  totalCallsMade: number;
  noResponseRate: number;
  inboundCallsHandled: number;
}

export interface CampaignPerformance {
  campaignId: string;
  campaignName: string;
  triggered: number;
  confirmed: number;
  rejected: number;
  recovered?: number;
  rate: number;
  revenueSecured: number;
}

export interface OutcomesByDay {
  date: string;
  ordersConfirmed: number;
  cartsRecovered: number;
}

export interface DemoCallLog {
  id: string;
  createdAt: string;
  callType: "inbound" | "outbound";
  fromNumber: string;
  toNumber: string;
  relatedTo: "order" | "cart" | "inbound";
  relatedId: string | null;
  outcome: "confirmed" | "rejected" | "no_response" | "recovered" | "not_recovered" | "handled";
  campaign: "Order Confirmation" | "Cart Abandonment" | null;
  agent: string;
  duration: number;
  sentiment: "positive" | "neutral" | "negative" | null;
  customerName: string;
  customerPhone: string;
  orderValue?: number;
  cartValue?: number;
  paymentType?: "cod" | "prepaid";
  items?: { title: string; quantity: number; price: number }[];
}

// Primary KPIs
export const demoOutcomeMetrics: OutcomeMetrics = {
  revenueRecovered: 124500,
  codOrdersConfirmed: 38,
  abandonedCartsRecovered: 14,
  estimatedRtoPrevented: 98000,
  callsConnectedRate: 61,
  totalCallsMade: 156,
  noResponseRate: 24,
  inboundCallsHandled: 12,
};

// Campaign Performance
export const demoCampaignPerformance: CampaignPerformance[] = [
  {
    campaignId: "order_confirmation_campaign",
    campaignName: "Order Confirmation",
    triggered: 52,
    confirmed: 38,
    rejected: 6,
    rate: 73,
    revenueSecured: 89400,
  },
  {
    campaignId: "cart_abandonment_campaign",
    campaignName: "Cart Abandonment",
    triggered: 41,
    recovered: 14,
    confirmed: 0,
    rejected: 0,
    rate: 34,
    revenueSecured: 35100,
  },
];

// Outcomes per day chart data
export const demoOutcomesByDay: OutcomesByDay[] = [
  { date: "Jan 22", ordersConfirmed: 5, cartsRecovered: 2 },
  { date: "Jan 23", ordersConfirmed: 7, cartsRecovered: 3 },
  { date: "Jan 24", ordersConfirmed: 4, cartsRecovered: 1 },
  { date: "Jan 25", ordersConfirmed: 8, cartsRecovered: 4 },
  { date: "Jan 26", ordersConfirmed: 6, cartsRecovered: 2 },
  { date: "Jan 27", ordersConfirmed: 5, cartsRecovered: 1 },
  { date: "Jan 28", ordersConfirmed: 3, cartsRecovered: 1 },
];

// Call Logs with business context
export const demoCallLogs: DemoCallLog[] = [
  {
    id: "call-001",
    createdAt: "2026-01-28T14:32:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9123456789",
    relatedTo: "order",
    relatedId: "ORD-10234",
    outcome: "confirmed",
    campaign: "Order Confirmation",
    agent: "Order Confirmation Agent",
    duration: 124,
    sentiment: "positive",
    customerName: "Priya Sharma",
    customerPhone: "+91-9123456789",
    orderValue: 2450,
    paymentType: "cod",
    items: [
      { title: "Wireless Earbuds Pro", quantity: 1, price: 1999 },
      { title: "Phone Case", quantity: 1, price: 451 },
    ],
  },
  {
    id: "call-002",
    createdAt: "2026-01-28T13:45:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9234567890",
    relatedTo: "cart",
    relatedId: "CART-5678",
    outcome: "recovered",
    campaign: "Cart Abandonment",
    agent: "Cart Abandonment Agent",
    duration: 186,
    sentiment: "positive",
    customerName: "Rahul Verma",
    customerPhone: "+91-9234567890",
    cartValue: 3200,
    items: [
      { title: "Premium Headphones", quantity: 1, price: 2899 },
      { title: "USB-C Cable", quantity: 1, price: 301 },
    ],
  },
  {
    id: "call-003",
    createdAt: "2026-01-28T12:15:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9345678901",
    relatedTo: "order",
    relatedId: "ORD-10235",
    outcome: "rejected",
    campaign: "Order Confirmation",
    agent: "Order Confirmation Agent",
    duration: 98,
    sentiment: "negative",
    customerName: "Amit Kumar",
    customerPhone: "+91-9345678901",
    orderValue: 1800,
    paymentType: "cod",
    items: [
      { title: "Laptop Stand", quantity: 1, price: 1800 },
    ],
  },
  {
    id: "call-004",
    createdAt: "2026-01-28T11:30:00Z",
    callType: "inbound",
    fromNumber: "+91-9456789012",
    toNumber: "+91-9876543210",
    relatedTo: "inbound",
    relatedId: null,
    outcome: "handled",
    campaign: null,
    agent: "Inbound Support Agent",
    duration: 245,
    sentiment: "neutral",
    customerName: "Sneha Patel",
    customerPhone: "+91-9456789012",
  },
  {
    id: "call-005",
    createdAt: "2026-01-28T10:20:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9567890123",
    relatedTo: "order",
    relatedId: "ORD-10236",
    outcome: "no_response",
    campaign: "Order Confirmation",
    agent: "Order Confirmation Agent",
    duration: 0,
    sentiment: null,
    customerName: "Vikram Singh",
    customerPhone: "+91-9567890123",
    orderValue: 4500,
    paymentType: "cod",
    items: [
      { title: "Smart Watch", quantity: 1, price: 4500 },
    ],
  },
  {
    id: "call-006",
    createdAt: "2026-01-28T09:45:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9678901234",
    relatedTo: "cart",
    relatedId: "CART-5679",
    outcome: "not_recovered",
    campaign: "Cart Abandonment",
    agent: "Cart Abandonment Agent",
    duration: 156,
    sentiment: "neutral",
    customerName: "Ananya Reddy",
    customerPhone: "+91-9678901234",
    cartValue: 1850,
    items: [
      { title: "Yoga Mat", quantity: 1, price: 1200 },
      { title: "Resistance Bands", quantity: 1, price: 650 },
    ],
  },
  {
    id: "call-007",
    createdAt: "2026-01-27T16:30:00Z",
    callType: "outbound",
    fromNumber: "+91-9876543210",
    toNumber: "+91-9789012345",
    relatedTo: "order",
    relatedId: "ORD-10230",
    outcome: "confirmed",
    campaign: "Order Confirmation",
    agent: "Order Confirmation Agent",
    duration: 110,
    sentiment: "positive",
    customerName: "Deepak Joshi",
    customerPhone: "+91-9789012345",
    orderValue: 3200,
    paymentType: "cod",
    items: [
      { title: "Bluetooth Speaker", quantity: 1, price: 2400 },
      { title: "AUX Cable", quantity: 2, price: 400 },
    ],
  },
  {
    id: "call-008",
    createdAt: "2026-01-27T15:15:00Z",
    callType: "inbound",
    fromNumber: "+91-9890123456",
    toNumber: "+91-9876543210",
    relatedTo: "inbound",
    relatedId: null,
    outcome: "handled",
    campaign: null,
    agent: "Inbound Support Agent",
    duration: 320,
    sentiment: "positive",
    customerName: "Kavita Nair",
    customerPhone: "+91-9890123456",
  },
];

// Summary stats for Call Logs page
export const demoCallLogStats = {
  callsLinkedToOrders: 52,
  callsLinkedToCarts: 41,
  inboundCallsHandled: 12,
  noResponseCalls: 37,
};

// Helper to format currency
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

// Helper to get call by ID
export const getCallById = (id: string): DemoCallLog | undefined => {
  return demoCallLogs.find((call) => call.id === id);
};
