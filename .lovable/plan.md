

# WhatsApp Module - Frontend + Database Plan

## Overview

Add a complete WhatsApp automation module to the Syntine platform, accessible via a **channel switcher** in the sidebar. Users toggle between "Voice" and "WhatsApp" modes, each showing its own navigation items. Both share the same login, auth, and organization context.

---

## 1. Bug Fix (Pre-requisite)

Fix the existing build error in `src/hooks/useCallQueue.ts` (line 74) where the `call_queue` table lost its foreign key relation to `commerce_orders` after the table recreation. The `order` join needs a cast through `unknown` to suppress the TS error until the FK is re-established.

---

## 2. Database Migration

Create the following new tables from the masterplan:

### New Tables

| Table | Purpose |
|---|---|
| `whatsapp_agent_configs` | One WhatsApp agent config per org (bot name, tone, language, system prompt, custom instructions) |
| `whatsapp_automations` | Pre-built automation configs per org (cod_confirmation, cart_recovery, support_chat) with delay, filters, discount settings |
| `whatsapp_conversations` | Chat sessions linking customer phone to an order/cart with trigger type and status |
| `whatsapp_messages` | All inbound/outbound messages with delivery status tracking |
| `whatsapp_templates` | WhatsApp-approved message templates |

### Organization Table Update

Add two columns to `organizations`:
- `enabled_channels TEXT[] DEFAULT '{"voice"}'` -- feature flag for voice/whatsapp
- `whatsapp_credits INT DEFAULT 0` -- message credits

### RLS Policies

All new tables will have org-scoped RLS using the existing `get_user_organization_id(auth.uid())` pattern, consistent with other tables in the project.

### Foreign Key Relationships

- `whatsapp_agent_configs.organization_id` -> `organizations.id`
- `whatsapp_automations.organization_id` -> `organizations.id`
- `whatsapp_conversations.organization_id` -> `organizations.id`
- `whatsapp_conversations.agent_config_id` -> `whatsapp_agent_configs.id`
- `whatsapp_messages.conversation_id` -> `whatsapp_conversations.id`
- `whatsapp_templates.organization_id` -> `organizations.id` (via RLS, no FK to avoid cross-org issues)

Also re-add the missing FK from `call_queue.order_id` -> `commerce_orders.id` to fix the build error properly.

---

## 3. Channel Switcher in Sidebar

### How It Works

A dropdown or toggle at the top of the sidebar (below the logo) lets users switch between **Voice** and **WhatsApp** channels. Each channel shows its own set of nav items. The selected channel is stored in a new `ChannelContext`.

**Voice nav items** (existing): Dashboard, Campaigns, Agents, Phone Numbers, Call Logs, Products, Orders, Integrations

**WhatsApp nav items** (new): Dashboard (WhatsApp metrics), Agent Config, Conversations, Templates, Products (shared), Orders (shared), Integrations (shared)

### New Context: `src/contexts/ChannelContext.tsx`

Stores the active channel (`voice` | `whatsapp`), persisted to localStorage. Reads `organization.enabled_channels` to determine which channels are available. If WhatsApp is not enabled for the org, the switcher hides the WhatsApp option.

### Sidebar Updates: `src/components/layout/SidebarNavigation.tsx`

- Add channel switcher UI element above the nav items
- Conditionally render Voice or WhatsApp nav items based on active channel
- WhatsApp items use green accent color (WhatsApp brand) vs purple for Voice

---

## 4. New Pages

### Page 1: `src/pages/WhatsAppDashboard.tsx` (Route: `/wa/dashboard`)

Summary metrics dashboard for WhatsApp:
- COD confirmation rate, Cart recovery rate, Messages sent/received, Response time
- Uses `StatCard` components with WhatsApp-themed styling
- Demo data initially, connected to `whatsapp_messages` and `whatsapp_conversations` tables

### Page 2: `src/pages/WhatsAppAgent.tsx` (Route: `/wa/agent`)

Single-page agent configuration:
- **AgentConfigPanel**: Bot name, tone selector (friendly/professional/casual), language picker, system prompt textarea, custom instructions box, on/off toggle
- **AutomationCards**: Three cards for COD Confirmation, Cart Recovery, and AI Support -- each with enable toggle and "Edit" button
- **AutomationEditModal**: Opens on edit click with delay, min value, max followups, discount settings, message template preview

### Page 3: `src/pages/WhatsAppConversations.tsx` (Route: `/wa/conversations`)

Two-panel layout:
- **Left panel**: Conversation list with search, status filter (Active/Waiting/Closed), customer name, last message preview, timestamp
- **Right panel**: Message thread view with chat bubbles (inbound left, outbound right), customer info sidebar showing linked order/cart

### Page 4: `src/pages/WhatsAppTemplates.tsx` (Route: `/wa/templates`)

Template management table:
- List of templates with name, type, status (pending/approved/rejected), language
- Create template modal with body, variables, type selection

---

## 5. New Components

| Component | Location | Purpose |
|---|---|---|
| `ChannelSwitcher` | `src/components/layout/ChannelSwitcher.tsx` | Toggle between Voice/WhatsApp in sidebar |
| `WhatsAppAgentConfigPanel` | `src/components/whatsapp/AgentConfigPanel.tsx` | Name, tone, language, prompt, instructions form |
| `AutomationCard` | `src/components/whatsapp/AutomationCard.tsx` | Toggle card for each automation type |
| `AutomationEditModal` | `src/components/whatsapp/AutomationEditModal.tsx` | Settings form for automation parameters |
| `ConversationList` | `src/components/whatsapp/ConversationList.tsx` | Filterable list of conversations |
| `ConversationThread` | `src/components/whatsapp/ConversationThread.tsx` | Chat bubble UI for message history |
| `WhatsAppMetricsCard` | `src/components/whatsapp/WhatsAppMetricsCard.tsx` | Summary stats card |

---

## 6. New Hooks & Services

| File | Purpose |
|---|---|
| `src/hooks/useWhatsAppAgent.ts` | CRUD for `whatsapp_agent_configs` |
| `src/hooks/useWhatsAppAutomations.ts` | CRUD for `whatsapp_automations` |
| `src/hooks/useWhatsAppConversations.ts` | List/filter conversations + messages |
| `src/hooks/useWhatsAppTemplates.ts` | CRUD for `whatsapp_templates` |
| `src/api/services/whatsapp.service.ts` | Supabase queries for all WhatsApp tables |

---

## 7. Routing Updates

Add WhatsApp routes inside the existing `ProtectedRoute` wrapper in `App.tsx`:

```text
/wa/dashboard      -> WhatsAppDashboard
/wa/agent          -> WhatsAppAgent
/wa/conversations  -> WhatsAppConversations
/wa/templates      -> WhatsAppTemplates
```

These routes use the same `OrgLayout` with the channel-aware sidebar.

---

## 8. Implementation Order

| Step | What | Files |
|---|---|---|
| 1 | Fix `useCallQueue.ts` build error | 1 file |
| 2 | Database migration (5 new tables + org columns + FK fix) | 1 migration |
| 3 | `ChannelContext` + `ChannelSwitcher` component | 2 files |
| 4 | Update `SidebarNavigation` with channel-aware nav | 1 file |
| 5 | WhatsApp service + hooks (4 hooks, 1 service) | 5 files |
| 6 | WhatsApp pages (4 pages) + components (7 components) | 11 files |
| 7 | Update `App.tsx` routing | 1 file |

**Total: ~21 new/modified files, 1 database migration**

---

## Technical Notes

- The channel switcher reads `enabled_channels` from the `Organization` object already fetched in `AuthContext`. The `Organization` interface will be extended to include `enabled_channels` and `whatsapp_credits`.
- All WhatsApp pages follow the same design system (dark theme, Inter font, purple/green accent, `PageContainer` wrapper, Framer Motion transitions).
- Shared pages like Products and Orders remain accessible from both channels -- no duplication.
- Demo data file `src/data/demoWhatsAppData.ts` will provide mock conversations and metrics for initial UI testing.

