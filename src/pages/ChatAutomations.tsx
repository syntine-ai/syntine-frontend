import { useState } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AutomationCard } from "@/components/chat/AutomationCard";
import { AutomationEditModal } from "@/components/chat/AutomationEditModal";

interface AutomationConfig {
  type: string;
  label: string;
  description: string;
  isEnabled: boolean;
  delay_minutes: number;
  min_order_value: number;
  max_followups: number;
  discount_enabled: boolean;
  discount_percent: number;
}

const defaultAutomations: AutomationConfig[] = [
  {
    type: "cod_confirmation",
    label: "COD Confirmation",
    description: "Auto-confirm cash on delivery orders via chat",
    isEnabled: true,
    delay_minutes: 5,
    min_order_value: 500,
    max_followups: 2,
    discount_enabled: false,
    discount_percent: 0,
  },
  {
    type: "cart_recovery",
    label: "Cart Recovery",
    description: "Send recovery messages for abandoned carts",
    isEnabled: false,
    delay_minutes: 30,
    min_order_value: 300,
    max_followups: 3,
    discount_enabled: true,
    discount_percent: 10,
  },
  {
    type: "support_chat",
    label: "AI Support Chat",
    description: "AI-powered customer support conversations",
    isEnabled: false,
    delay_minutes: 0,
    min_order_value: 0,
    max_followups: 5,
    discount_enabled: false,
    discount_percent: 0,
  },
];

export default function ChatAutomations() {
  const [automations, setAutomations] = useState(defaultAutomations);
  const [editingAutomation, setEditingAutomation] = useState<AutomationConfig | null>(null);

  const handleToggle = (type: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.type === type ? { ...a, isEnabled: !a.isEnabled } : a))
    );
  };

  const handleSaveAutomation = (updated: AutomationConfig) => {
    setAutomations((prev) =>
      prev.map((a) => (a.type === updated.type ? updated : a))
    );
    setEditingAutomation(null);
  };

  return (
    <PageContainer
      title="Automations"
      subtitle="Configure automated chat workflows and triggers"
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {automations.map((automation) => (
          <AutomationCard
            key={automation.type}
            label={automation.label}
            description={automation.description}
            isEnabled={automation.isEnabled}
            onToggle={() => handleToggle(automation.type)}
            onEdit={() => setEditingAutomation(automation)}
          />
        ))}
      </div>

      {editingAutomation && (
        <AutomationEditModal
          automation={editingAutomation}
          open={!!editingAutomation}
          onOpenChange={(open) => !open && setEditingAutomation(null)}
          onSave={handleSaveAutomation}
        />
      )}
    </PageContainer>
  );
}
