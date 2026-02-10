# 📱 Syntine WhatsApp MVP Masterplan

**Target**: AI-powered WhatsApp automation for Shopify stores  
**Architecture**: Integrated with existing Voice platform (1 backend, 1 frontend, 1 DB)  
**Core Principle**: One agent, pre-built automations, zero flow building  
**Status**: Planning Phase 🟡

---

## 🎯 Problem Statement

Indian Shopify stores face 4 costly problems:

| Problem | Impact | How Syntine Solves It |
|---------|--------|----------------------|
| **Fake COD Orders** | 30-40% COD orders are fake/impulse → ₹100-300 RTO loss per order | AI confirms via WhatsApp before shipping |
| **Cart Abandonment** | 70%+ carts abandoned → direct revenue loss | AI recovers carts with personalized messages + discount offers |
| **Support Overload** | "Where is my order?" = 60% of queries → ₹15-25K/month per support hire | AI handles 24/7, auto-escalates if stuck |
| **No Re-engagement** | Customers buy once, never return | AI follows up post-purchase (Phase 2) |

**Our differentiator vs competitors (Interakt, Wati, AiSensy)**:

> Competitors require flow builders, template setup, keyword mapping — needs training or a hired person to manage.  
> **Syntine**: Connect Shopify → Enable WhatsApp → Done. AI handles everything. No flows, no hiring.

---

## 📊 Platform Context

Syntine already has a voice calling platform with:

- ✅ Multi-tenant dashboard (React + TypeScript + FastAPI + Supabase)
- ✅ AI Voice Agent (LiveKit + OpenAI)
- ✅ Campaigns, Contacts, Orders, Abandoned Carts, Products
- ✅ Shopify integration structure
- ✅ Redis queue & dispatcher
- ✅ Auth, org isolation, user roles

WhatsApp module integrates into the same platform. Clients can enable Voice, WhatsApp, or both via **feature flags** on their organization.

---

## 🏗️ Architecture: One Agent + Pre-Built Automations

### Core Concept

```
Store owner setup (one time, 5 minutes):
  1. Connect Shopify store
  2. Configure WhatsApp agent (name, tone, language)
  3. Toggle automations ON/OFF

Then autopilot runs:
  Shopify event → System checks automation rules → Sends WhatsApp → AI handles replies
```

### Why NOT Flow Builder / Multi-Agent?

| Approach | Verdict | Reason |
|----------|---------|--------|
| Flow Builder | ❌ Skip | Every competitor has it — it's the complexity we're eliminating |
| Multi-Agent Orchestrator | ❌ Skip | Overkill for e-commerce; adds latency and config overhead |
| Single Smart Agent + Tools | ✅ Build | AI auto-detects context, uses function calling for actions |

### How It Works

One AI agent per organization with **tools** (function calling):

| Tool | What It Does | When AI Uses It |
|------|-------------|-----------------|
| `lookup_order` | Fetches order details from Shopify/DB | Customer asks about order |
| `lookup_product` | Fetches product info/pricing | Customer asks about products |
| `confirm_cod_order` | Marks order as confirmed | Customer confirms COD |
| `cancel_order` | Initiates cancellation | Customer wants to cancel |
| `get_cart_recovery_link` | Gets checkout URL | Cart recovery conversation |
| `check_availability` | Checks stock | Customer asks "is X in stock?" |
| `escalate_to_human` | Tags for human review | Bot can't handle query |

The AI decides which tool to use based on conversation context — **no flows needed**.

---

## 📋 MVP Feature Modules

### Module 1: WhatsApp Agent Configuration

One agent per org — configured in a simple panel.

| Feature | Priority | Description |
|---------|----------|-------------|
| Agent Name & Tone | 🔴 Critical | Set bot name, tone (friendly/professional), language |
| System Prompt | 🔴 Critical | Auto-generated from store data + custom instructions |
| Custom Instructions | 🟡 High | Plain English box: "Always mention free delivery above ₹499" |
| Agent On/Off Toggle | 🔴 Critical | Enable/disable entire WhatsApp agent |
| Test Message | 🟡 High | Send a test message to verify integration |

**Store owner configures**: Name, tone, language, custom instructions. That's it.

---

### Module 2: Pre-Built Automations

Three automations that come built-in — just toggle ON and customize settings.

#### 2a. COD Order Confirmation

| Feature | Priority | Description |
|---------|----------|-------------|
| Auto-trigger on COD order | 🔴 Critical | Fires when Shopify sends new COD order |
| Configurable delay | 🔴 Critical | Wait X minutes before sending (default: 5 min) |
| Filter by min order value | 🟡 High | Skip orders below ₹X |
| COD-only filter | 🔴 Critical | Only trigger for COD, not prepaid |
| Interactive buttons | 🔴 Critical | [✅ Confirm] [❌ Cancel] quick reply buttons |
| Auto-confirm on button click | 🔴 Critical | Update order status in Shopify on confirm |
| Follow-up reminders | 🟡 High | Resend after X hours if no reply (max N times) |
| AI handles free-text replies | 🔴 Critical | Customer asks questions → AI responds naturally |

**Conversation flow**:
```
Template message with order details + buttons
  ├─ Customer clicks Confirm → Mark confirmed, send thank you
  ├─ Customer clicks Cancel → Cancel order, ask reason
  ├─ Customer types question → AI handles (address change, delivery date, etc.)
  └─ No reply → Reminder after 2h → Close after 24h
```

#### 2b. Cart Abandonment Recovery

| Feature | Priority | Description |
|---------|----------|-------------|
| Auto-trigger on cart abandon | 🔴 Critical | Fires when Shopify cart is abandoned |
| Configurable delay | 🔴 Critical | Wait X minutes/hours (default: 1 hour) |
| Filter by min cart value | 🟡 High | Skip carts below ₹X |
| Checkout link button | 🔴 Critical | [🛒 Complete Purchase → checkout_url] CTA button |
| Optional discount offer | 🟡 High | "Get 10% off!" after follow-up delay |
| Follow-up with discount | 🟡 High | No reply → send reminder with discount code |
| AI handles questions | 🔴 Critical | Customer asks about product → AI responds |

**Conversation flow**:
```
Template message with cart items + checkout button
  ├─ Customer clicks checkout → Track as recovered
  ├─ Customer asks questions → AI handles (product details, sizing, etc.)
  ├─ No reply after 4h → Send discount offer
  └─ No reply after 48h → Mark expired
```

#### 2c. AI Customer Support (24/7)

| Feature | Priority | Description |
|---------|----------|-------------|
| Always active | 🔴 Critical | Responds to any incoming WhatsApp message |
| Order status lookup | 🔴 Critical | "Where is my order?" → AI fetches from Shopify |
| Product queries | 🟡 High | "Do you have X in size L?" → AI checks catalog |
| Auto-escalation | 🟡 High | If bot fails 3 times → tag for human review |
| Context from Shopify | 🔴 Critical | AI knows customer's order history, cart, etc. |

---

### Module 3: WhatsApp Business API Integration

| Feature | Priority | Description |
|---------|----------|-------------|
| BSP Integration | 🔴 Critical | Twilio/360Dialog API for send/receive |
| Webhook receiver | 🔴 Critical | Receive incoming messages |
| Message sending | 🔴 Critical | Send text + interactive messages |
| Webhook signature verification | 🔴 Critical | Security — verify message authenticity |
| Template message management | 🔴 Critical | Create/submit/track WhatsApp-approved templates |
| Delivery status tracking | 🟡 High | Track sent → delivered → read |

---

### Module 4: Conversation Management

| Feature | Priority | Description |
|---------|----------|-------------|
| Conversation list | 🔴 Critical | All conversations with search + status filter |
| Message thread view | 🔴 Critical | Full chat history per customer |
| Customer info panel | 🟡 High | Show linked order, contact, history alongside chat |
| Conversation status | 🟡 High | Active / Waiting / Closed |
| Manual admin reply | 🟢 Medium | Admin override — type and send as human |

---

### Module 5: Analytics

| Feature | Priority | Description |
|---------|----------|-------------|
| COD confirmation rate | 🔴 Critical | % of COD orders confirmed via WhatsApp |
| Cart recovery rate | 🔴 Critical | % of abandoned carts recovered |
| Message volume | 🟡 High | Messages sent/received per day |
| Response time | 🟡 High | Average bot response time |
| Credits/usage tracking | 🟡 High | Messages consumed vs remaining |
| Dashboard widget | 🟡 High | WhatsApp summary card on main dashboard |

---

### Module 6: Platform Updates (Shared)

| Feature | Priority | Description |
|---------|----------|-------------|
| Channel feature flag | 🔴 Critical | `enabled_channels: ["voice", "whatsapp"]` per org |
| Sidebar navigation | 🔴 Critical | Add WhatsApp section to sidebar |
| Campaign channel field | 🟢 Medium | Extend campaigns to support `voice` or `whatsapp` (Phase 2) |

---

## 🗄️ Database Schema

### New Tables

**`whatsapp_agent_configs`** — One agent per org
```sql
id UUID PRIMARY KEY,
organization_id UUID REFERENCES organizations(id),
bot_name TEXT NOT NULL,
system_prompt TEXT,
tone TEXT DEFAULT 'friendly',          -- friendly / professional / casual
language TEXT DEFAULT 'en',            -- en / hi / hi-en (bilingual)
custom_instructions TEXT,              -- plain English customization
status TEXT DEFAULT 'active',          -- active / inactive
settings JSONB DEFAULT '{}',
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(organization_id)               -- one agent per org
```

**`whatsapp_automations`** — Pre-built automation configs
```sql
id UUID PRIMARY KEY,
organization_id UUID REFERENCES organizations(id),
automation_type TEXT NOT NULL,          -- cod_confirmation / cart_recovery / support_chat
enabled BOOLEAN DEFAULT false,
delay_minutes INT DEFAULT 5,
min_value DECIMAL DEFAULT 0,
cod_only BOOLEAN DEFAULT true,
max_followups INT DEFAULT 2,
followup_delay_hours INT DEFAULT 2,
offer_discount BOOLEAN DEFAULT false,
discount_percent INT DEFAULT 10,
message_template TEXT,                 -- customizable first message
settings JSONB DEFAULT '{}',
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW(),
UNIQUE(organization_id, automation_type)
```

**`whatsapp_conversations`** — Chat sessions
```sql
id UUID PRIMARY KEY,
organization_id UUID REFERENCES organizations(id),
agent_config_id UUID REFERENCES whatsapp_agent_configs(id),
customer_phone TEXT NOT NULL,
customer_name TEXT,
contact_id UUID REFERENCES contacts(id),
order_id UUID,                          -- linked order (if triggered by order event)
cart_id UUID,                           -- linked cart (if triggered by cart event)
trigger_type TEXT,                      -- cod_confirmation / cart_recovery / support / manual
status TEXT DEFAULT 'active',           -- active / waiting / closed
context JSONB DEFAULT '{}',            -- conversation metadata
started_at TIMESTAMPTZ DEFAULT NOW(),
last_message_at TIMESTAMPTZ,
closed_at TIMESTAMPTZ,
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`whatsapp_messages`** — All messages
```sql
id UUID PRIMARY KEY,
conversation_id UUID REFERENCES whatsapp_conversations(id),
organization_id UUID NOT NULL,
direction TEXT NOT NULL,                -- inbound / outbound
content TEXT NOT NULL,
message_type TEXT DEFAULT 'text',       -- text / interactive / template / image
whatsapp_message_id TEXT,              -- external WhatsApp msg ID
status TEXT DEFAULT 'sent',            -- sent / delivered / read / failed
is_bot_response BOOLEAN DEFAULT false,
credits_used INT DEFAULT 0,
metadata JSONB DEFAULT '{}',
created_at TIMESTAMPTZ DEFAULT NOW()
```

**`whatsapp_templates`** — WhatsApp-approved templates
```sql
id UUID PRIMARY KEY,
organization_id UUID NOT NULL,
template_name TEXT NOT NULL,
template_body TEXT NOT NULL,
template_type TEXT,                     -- order_confirm / cart_recovery / reminder / custom
whatsapp_status TEXT DEFAULT 'pending', -- pending / approved / rejected
variables JSONB DEFAULT '[]',
language TEXT DEFAULT 'en',
created_at TIMESTAMPTZ DEFAULT NOW(),
updated_at TIMESTAMPTZ DEFAULT NOW()
```

### Existing Table Modifications

```sql
-- Feature flag on organizations
ALTER TABLE organizations ADD COLUMN enabled_channels TEXT[] DEFAULT '{"voice"}';

-- WhatsApp credits
ALTER TABLE organizations ADD COLUMN whatsapp_credits INT DEFAULT 0;
```

---

## 🧩 File Structure

### Backend (New Files)

```
syntine_backend/
├── routers/
│   ├── whatsapp.py                       # Agent config + automations + conversations API
│   └── webhooks/
│       └── whatsapp_webhook.py           # Incoming message webhook handler
│
├── services/
│   └── whatsapp/
│       ├── __init__.py
│       ├── whatsapp_provider.py          # WhatsApp BSP API client (send/receive)
│       ├── chatbot_engine.py             # OpenAI chat logic + tool calling
│       ├── whatsapp_service.py           # Orchestration (event → AI → reply)
│       ├── automation_handler.py         # Process Shopify events → trigger automations
│       └── template_service.py           # Template message management
│
├── database/
│   ├── whatsapp_models.py                # Pydantic models
│   └── migrations/
│       └── 20260210_whatsapp_schema.sql  # All new tables
```

### Frontend (New Files)

```
syntine-frontend/src/
├── pages/
│   ├── WhatsAppAgent.tsx                 # Agent config + automations (main page)
│   └── WhatsAppConversations.tsx         # Conversation list + thread viewer
│
├── api/
│   └── whatsapp.ts                       # API client
│
├── components/
│   └── whatsapp/
│       ├── AgentConfigPanel.tsx           # Name, tone, language, instructions
│       ├── AutomationCard.tsx             # Toggle + settings per automation
│       ├── AutomationEditModal.tsx        # Edit delay, filters, message, followups
│       ├── ConversationThread.tsx         # Chat bubble UI with customer info
│       ├── WhatsAppPreview.tsx            # Phone mockup preview of messages
│       └── WhatsAppMetricsCard.tsx        # Dashboard widget
```

**Total: 2 new pages, 6 new components, 6 new backend files, 1 migration**

---

## 📅 Sprint Plan (12 Days)

### Phase 1: Backend Foundation (Days 1-3)

| Task | Description |
|------|-------------|
| DB migration | Create all WhatsApp tables + org modifications |
| WhatsApp provider service | Twilio/360Dialog API client (send/receive messages) |
| Webhook receiver | `/webhooks/whatsapp` with signature verification |
| Chatbot engine | OpenAI GPT integration with conversation context + tool calling |
| Agent config API | CRUD for WhatsApp agent config per org |
| End-to-end test | Send WhatsApp msg → get AI reply back |

**Deliverable**: Bot receives and responds to WhatsApp messages with AI

---

### Phase 2: Shopify Automations (Days 4-6)

| Task | Description |
|------|-------------|
| Automation configs API | CRUD for automation settings (cod_confirmation, cart_recovery, support) |
| Automation handler | Listen to Shopify order/cart webhooks → trigger WhatsApp automations |
| Template messages | Create and manage WhatsApp-approved templates |
| Interactive buttons | Confirm/Cancel quick reply buttons for COD |
| Cart recovery flow | Abandoned cart → delayed message → discount follow-up |
| Order actions | Confirm/cancel order in Shopify from button clicks |

**Deliverable**: Automated WhatsApp messages triggered from Shopify events with interactive buttons

---

### Phase 3: Frontend (Days 7-9)

| Task | Description |
|------|-------------|
| Feature flag UI | Show/hide WhatsApp based on org's `enabled_channels` |
| Sidebar + routing | Add WhatsApp navigation to sidebar |
| WhatsApp Agent page | Agent config panel + automation cards with toggles |
| Automation edit modal | Settings form with WhatsApp preview |
| Conversations page | Conversation list + message thread viewer |
| Dashboard widget | WhatsApp metrics card on main dashboard |

**Deliverable**: Full WhatsApp UI integrated into existing dashboard

---

### Phase 4: Testing & Polish (Days 10-12)

| Task | Description |
|------|-------------|
| Integration testing | Shopify order → WhatsApp → confirm → Shopify update |
| Template submission | Submit templates for WhatsApp approval (24-48h) |
| Error handling | Retry failed messages, handle API rate limits |
| Credit system | Deduct credits per message, usage tracking |
| Analytics | COD confirmation rate, cart recovery rate metrics |
| Production deploy | Deploy updated backend + frontend |

**Deliverable**: WhatsApp MVP live and ready for beta

---

## ⚠️ WhatsApp Requirements (Mandatory from Meta)

| Requirement | Details |
|-------------|---------|
| **Business Verification** | Meta must verify your business before production access |
| **Dedicated Phone Number** | Separate from personal WhatsApp; can't be shared |
| **Template Approval** | Business-initiated messages need pre-approved templates (24-48h) |
| **24-Hour Window** | After customer's last message, 24h for free replies; after that templates only |
| **Customer Opt-in** | Customers must opt-in to receive messages |
| **Rate Limits** | Start at 250 business-initiated conversations/day, scales with quality |
| **BSP Account** | Account with Twilio/360Dialog/MSG91 required |

---

## 💰 Cost Estimation

| Item | Estimated Cost |
|------|---------------|
| Twilio WhatsApp | ₹0.08/msg (utility), ₹0.35/conversation (marketing) |
| Meta Conversation Fee (India) | ₹0.15/utility, ₹0.25/service, ₹0.30/marketing |
| OpenAI GPT-4o-mini | ~$0.00015/message |
| Infrastructure | Already shared (Supabase + FastAPI) |

---

## ✅ MVP Success Criteria

- [ ] WhatsApp agent receives and responds to messages with AI
- [ ] COD order confirmation sent automatically with interactive buttons
- [ ] Customer can confirm/cancel order via button click → updates Shopify
- [ ] Cart recovery message sent with checkout link
- [ ] Automations configurable with toggles + simple settings
- [ ] All conversations viewable in dashboard
- [ ] WhatsApp analytics showing confirmation & recovery rates
- [ ] Feature flag controls WhatsApp visibility per org
- [ ] Credits tracking per organization

---

## 🔮 Post-MVP Roadmap

- WhatsApp broadcast campaigns (bulk sends to contact lists)
- Human agent handoff (transfer bot → real person)
- Rich media support (images, PDFs, WhatsApp catalog cards)
- Voice + WhatsApp combo (call failed → auto fallback to WhatsApp)
- Multi-language auto-detection
- Post-purchase engagement (review requests, upsell)
- WhatsApp Pay integration (UPI payments in chat)
- WooCommerce integration

---

**Last Updated**: February 10, 2026  
**Document Owner**: Product Team  
**Status**: Ready for team review 📋
