
# API Master Plan Implementation

## Summary
Create a comprehensive backend API master plan document (`api_masterplan.md`) that will serve as the definitive guide for implementing REST APIs to replace all frontend demo/mock data with real Supabase backend integration.

## What I'll Create

A markdown file named `api_masterplan.md` containing:

### 1. Document Structure
- Executive summary and scope
- Global conventions (authentication, organization scoping, error handling, pagination)
- Six complete module specifications:
  1. **Campaigns Module** - Fixed transactional campaigns (Order Confirmation, Cart Abandonment)
  2. **Agents Module** - Pre-built AI voice agents
  3. **Call Logs Module** - Business-context calls linked to orders/carts
  4. **Products Module** - Read-only synced product catalog
  5. **Orders Module** - Commerce orders with trigger readiness
  6. **Integrations Module** - Shopify integration management

### 2. Per-Module Content

Each module will include:

**Database Mapping**
- Exact table names: `campaigns`, `agents`, `calls`, `commerce_products`, `commerce_orders`, `commerce_integrations`
- Key columns used by APIs
- Foreign key relationships

**API Endpoints**
| Endpoint | Method | Purpose | Tables | Read/Write |
|----------|--------|---------|--------|------------|
| `/api/campaigns` | GET | List campaigns | campaigns, campaign_agents | Read |
| `/api/campaigns/:id/toggle` | PATCH | Enable/disable | campaigns | Write |
| etc. | | | | |

**Frontend Usage**
- Pages consuming each API
- Demo data files being replaced
- Filtering/pagination requirements

**Access Control**
- Organization scoping via RLS
- Role restrictions where applicable

### 3. Key Technical Decisions

**Campaigns & Agents (MVP v1)**
- Read-only list + status toggle only
- No creation/deletion in v1
- Maps to existing `campaigns` and `agents` tables

**Call Logs**
- Enhanced query joining `calls` with `commerce_orders`/`commerce_abandoned_carts`
- Business context (order/cart items, values) embedded in response
- Replaces `demoCallLogs` from `demoOutcomesData.ts`

**Commerce (Products/Orders/Carts)**
- Read-only APIs synced from Shopify
- Uses `commerce_products`, `commerce_orders`, `commerce_abandoned_carts`
- `trigger_ready` status included for voice campaign eligibility

**Dashboard Outcomes**
- Aggregation API computing:
  - Revenue recovered
  - COD orders confirmed
  - Carts recovered
  - RTO prevented
- Derived from `calls` + commerce tables

### 4. File Output

```
api_masterplan.md
├── Executive Summary
├── Global Conventions
│   ├── Authentication (JWT via Supabase)
│   ├── Organization Scoping
│   ├── Error Response Format
│   └── Pagination Pattern
├── Module: Campaigns
├── Module: Agents
├── Module: Call Logs
├── Module: Products
├── Module: Orders
├── Module: Integrations
└── Appendix: Database Schema Reference
```

## Technical Details

### Database Tables Covered

| Module | Primary Table(s) | Related Tables |
|--------|------------------|----------------|
| Campaigns | `campaigns` | `campaign_agents`, `agents` |
| Agents | `agents` | `campaign_agents` |
| Call Logs | `calls` | `call_transcripts`, `call_recordings`, `commerce_orders`, `commerce_abandoned_carts` |
| Products | `commerce_products` | `commerce_product_variants`, `commerce_integrations` |
| Orders | `commerce_orders` | `commerce_order_items`, `commerce_integrations` |
| Carts | `commerce_abandoned_carts` | `commerce_cart_items` |
| Integrations | `commerce_integrations` | All commerce tables |

### Key Enums Used
- `campaign_status`: draft, scheduled, running, paused, completed, cancelled
- `agent_status`: active, inactive, draft
- `call_outcome`: answered, no_answer, busy, failed, voicemail
- `trigger_ready_status`: ready, missing_phone, not_applicable
- `payment_type`: cod, prepaid, unknown

### API Implementation Notes
- All endpoints will be Supabase Edge Functions or direct client SDK calls
- RLS policies already exist for organization scoping
- No new tables required - using existing schema
- Demo data structures in `src/data/` match planned API response shapes
