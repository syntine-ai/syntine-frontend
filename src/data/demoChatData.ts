export const demoChatMetrics = {
  codConfirmationRate: 78,
  cartRecoveryRate: 32,
  messagesSent: 1247,
  messagesReceived: 892,
  avgResponseTime: "2.3s",
  activeConversations: 14,
  templatesSent: 456,
  creditsRemaining: 8500,
};

export type ConversationStatus = "active_ai" | "needs_human" | "human_active" | "closed";

export const demoChatConversations = [
  {
    id: "conv-1",
    customer_phone: "+91 98765 43210",
    customer_name: "Rahul Sharma",
    trigger_type: "cod_confirmation",
    status: "active",
    conversation_status: "active_ai" as ConversationStatus,
    assigned_to: null as string | null,
    last_message_at: new Date(Date.now() - 5 * 60000).toISOString(),
    last_message: "Yes, I confirm my order #1042",
    order_number: "#1042",
    unread: 2,
  },
  {
    id: "conv-2",
    customer_phone: "+91 87654 32109",
    customer_name: "Priya Patel",
    trigger_type: "cart_recovery",
    status: "active",
    conversation_status: "needs_human" as ConversationStatus,
    assigned_to: null as string | null,
    last_message_at: new Date(Date.now() - 15 * 60000).toISOString(),
    last_message: "What discount can you offer?",
    order_number: null,
    unread: 1,
  },
  {
    id: "conv-3",
    customer_phone: "+91 76543 21098",
    customer_name: "Amit Kumar",
    trigger_type: "support_chat",
    status: "active",
    conversation_status: "human_active" as ConversationStatus,
    assigned_to: "Ravi M.",
    last_message_at: new Date(Date.now() - 45 * 60000).toISOString(),
    last_message: "Where is my order?",
    order_number: "#1038",
    unread: 0,
  },
  {
    id: "conv-4",
    customer_phone: "+91 65432 10987",
    customer_name: "Sneha Reddy",
    trigger_type: "cod_confirmation",
    status: "closed",
    conversation_status: "closed" as ConversationStatus,
    assigned_to: null as string | null,
    last_message_at: new Date(Date.now() - 120 * 60000).toISOString(),
    last_message: "Order confirmed. Thank you!",
    order_number: "#1039",
    unread: 0,
  },
  {
    id: "conv-5",
    customer_phone: "+91 54321 09876",
    customer_name: "Vikram Singh",
    trigger_type: "cart_recovery",
    status: "closed",
    conversation_status: "closed" as ConversationStatus,
    assigned_to: null as string | null,
    last_message_at: new Date(Date.now() - 180 * 60000).toISOString(),
    last_message: "I'll complete the purchase now",
    order_number: null,
    unread: 0,
  },
];

export type MessageType = "text" | "template" | "media";
export type MessageSender = "ai" | "human" | "customer";

export const demoChatMessages: Record<string, Array<{
  id: string;
  direction: "inbound" | "outbound";
  content: string;
  status: string;
  created_at: string;
  message_type: MessageType;
  sender: MessageSender;
  template_name?: string;
  media_url?: string;
  media_type?: "image" | "video";
}>> = {
  "conv-1": [
    { id: "m1", direction: "outbound", content: "Hi Rahul! 👋 Your COD order #1042 worth ₹2,499 is ready to ship. Please confirm by replying YES.", status: "delivered", created_at: new Date(Date.now() - 30 * 60000).toISOString(), message_type: "template", sender: "ai", template_name: "cod_confirm_v1" },
    { id: "m2", direction: "inbound", content: "Yes, I confirm my order #1042", status: "read", created_at: new Date(Date.now() - 5 * 60000).toISOString(), message_type: "text", sender: "customer" },
  ],
  "conv-2": [
    { id: "m3", direction: "outbound", content: "Hi Priya! You left some items in your cart. Complete your purchase and get 10% off! 🎉", status: "delivered", created_at: new Date(Date.now() - 60 * 60000).toISOString(), message_type: "template", sender: "ai", template_name: "cart_recovery_v1" },
    { id: "m4", direction: "inbound", content: "What discount can you offer?", status: "read", created_at: new Date(Date.now() - 15 * 60000).toISOString(), message_type: "text", sender: "customer" },
  ],
  "conv-3": [
    { id: "m5", direction: "inbound", content: "Where is my order?", status: "read", created_at: new Date(Date.now() - 45 * 60000).toISOString(), message_type: "text", sender: "customer" },
    { id: "m6", direction: "outbound", content: "Hi Amit! Your order #1038 is out for delivery. Expected today by 6 PM. 📦", status: "sent", created_at: new Date(Date.now() - 40 * 60000).toISOString(), message_type: "text", sender: "ai" },
    { id: "m7", direction: "outbound", content: "I've checked with the courier — your package is currently with the delivery partner. Let me know if you need anything else.", status: "delivered", created_at: new Date(Date.now() - 35 * 60000).toISOString(), message_type: "text", sender: "human" },
  ],
};

export const demoChatInternalNotes: Record<string, Array<{
  id: string;
  author: string;
  content: string;
  created_at: string;
}>> = {
  "conv-2": [
    { id: "n1", author: "Ravi M.", content: "Customer seems price-sensitive. Approved up to 15% discount.", created_at: new Date(Date.now() - 10 * 60000).toISOString() },
  ],
  "conv-3": [
    { id: "n2", author: "Ravi M.", content: "Took over from AI. Customer frustrated about delay.", created_at: new Date(Date.now() - 36 * 60000).toISOString() },
  ],
};

export const demoChatTemplates = [
  { id: "t1", name: "cod_confirm_v1", category: "utility", language: "en", body: "Hi {{1}}! Your COD order {{2}} worth {{3}} is ready. Reply YES to confirm.", status: "approved", variables: ["customer_name", "order_number", "amount"] },
  { id: "t2", name: "cart_recovery_v1", category: "marketing", language: "en", body: "Hi {{1}}! You left items in your cart. Complete your purchase and get {{2}}% off!", status: "approved", variables: ["customer_name", "discount"] },
  { id: "t3", name: "order_status_v1", category: "utility", language: "en", body: "Hi {{1}}! Your order {{2}} is {{3}}. Track: {{4}}", status: "approved", variables: ["customer_name", "order_number", "status", "tracking_url"] },
  { id: "t4", name: "support_greeting", category: "utility", language: "en", body: "Hi {{1}}! How can we help you today?", status: "pending", variables: ["customer_name"] },
];
