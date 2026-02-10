import { PageContainer } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/shared/StatCard";
import { demoWAMetrics } from "@/data/demoWhatsAppData";
import { MessageCircle, CheckCircle, ShoppingCart, Clock, Send, Inbox, CreditCard, Zap } from "lucide-react";

export default function WhatsAppDashboard() {
  const m = demoWAMetrics;

  return (
    <PageContainer
      title="WhatsApp Dashboard"
      subtitle="Automation performance and messaging metrics"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="COD Confirmation Rate"
          value={`${m.codConfirmationRate}%`}
          icon={CheckCircle}
          iconColor="success"
          trend={{ value: 5.2, isPositive: true }}
        />
        <StatCard
          title="Cart Recovery Rate"
          value={`${m.cartRecoveryRate}%`}
          icon={ShoppingCart}
          iconColor="warning"
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Messages Sent"
          value={m.messagesSent.toLocaleString()}
          icon={Send}
          iconColor="primary"
        />
        <StatCard
          title="Messages Received"
          value={m.messagesReceived.toLocaleString()}
          icon={Inbox}
          iconColor="primary"
        />
        <StatCard
          title="Avg Response Time"
          value={m.avgResponseTime}
          icon={Clock}
          iconColor="success"
        />
        <StatCard
          title="Active Conversations"
          value={m.activeConversations}
          icon={MessageCircle}
          iconColor="success"
        />
        <StatCard
          title="Templates Sent"
          value={m.templatesSent.toLocaleString()}
          icon={Zap}
          iconColor="primary"
        />
        <StatCard
          title="Credits Remaining"
          value={m.creditsRemaining.toLocaleString()}
          icon={CreditCard}
          iconColor="warning"
        />
      </div>
    </PageContainer>
  );
}
