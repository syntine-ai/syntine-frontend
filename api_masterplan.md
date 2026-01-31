# API Master Plan

> **Version**: 1.0  
> **Last Updated**: 2026-01-31  
> **Status**: Implementation Ready

## Executive Summary

This document defines the complete REST API specification for replacing all frontend demo/mock data with real Supabase backend integration. The APIs are designed for a multi-tenant SaaS application with organization-scoped data access enforced via Row Level Security (RLS).

### Scope
- 6 core modules: Campaigns, Agents, Call Logs, Products, Orders, Integrations
- All APIs are organization-scoped
- JWT-based authentication via Supabase Auth
- Direct Supabase client SDK calls (no separate Edge Functions required for most operations)

### Out of Scope (MVP v1)
- Campaign/Agent creation and deletion (read + toggle only)
- File uploads for knowledge base (separate feature)
- Webhook management endpoints
- Billing/subscription APIs

---

## Global Conventions

### Authentication

All API requests require a valid JWT token obtained via Supabase Auth.

```
Authorization: Bearer <supabase_access_token>
```

The token is automatically included when using `supabase.from()` with an authenticated client.

### Organization Scoping

Every table has an `organization_id` column. RLS policies automatically filter data:

```sql
-- Example RLS pattern (already implemented)
organization_id = get_user_organization_id(auth.uid())
```

**Frontend requirement**: No need to pass `organization_id` in requests—RLS handles scoping automatically.

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": {}
  }
}
```

| HTTP Status | Use Case |
|-------------|----------|
| 200 | Success (GET, PATCH) |
| 201 | Created (POST) |
| 204 | No Content (DELETE) |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden (RLS denied) |
| 404 | Resource not found |
| 500 | Server error |

### Pagination Pattern

For list endpoints returning many records:

**Request Parameters**:
| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-indexed) |
| `limit` | integer | 20 | Items per page (max 100) |
| `sort` | string | `created_at` | Sort column |
| `order` | string | `desc` | Sort direction (asc/desc) |

**Response Shape**:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**Supabase Implementation**:
```typescript
const { data, count } = await supabase
  .from('table')
  .select('*', { count: 'exact' })
  .range((page - 1) * limit, page * limit - 1)
  .order(sort, { ascending: order === 'asc' });
```

---

## Module: Campaigns

### Purpose

Campaigns represent automated voice calling workflows triggered by commerce events (e.g., Order Confirmation, Cart Abandonment). In MVP v1, campaigns are **pre-seeded** and users can only enable/disable them.

### Database Mapping

**Primary Table**: `campaigns`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `name` | text | Campaign display name |
| `description` | text | Optional description |
| `status` | campaign_status | draft, scheduled, running, paused, completed, cancelled |
| `concurrency` | integer | Max concurrent calls (default: 1) |
| `schedule` | jsonb | Calling hours configuration |
| `settings` | jsonb | max_attempts, call_recording, retry_delay_minutes |
| `started_at` | timestamptz | When campaign started |
| `completed_at` | timestamptz | When campaign completed |
| `deleted_at` | timestamptz | Soft delete timestamp |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

**Related Table**: `campaign_agents`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `campaign_id` | uuid | FK → campaigns.id |
| `agent_id` | uuid | FK → agents.id |
| `is_primary` | boolean | Primary agent flag |

### API Endpoints

#### GET /campaigns

**Purpose**: List all campaigns for the organization

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('campaigns')
  .select(`
    id, name, description, status, concurrency, 
    schedule, settings, started_at, updated_at,
    campaign_agents(
      agent_id,
      is_primary,
      agents(id, name, status)
    )
  `)
  .is('deleted_at', null)
  .order('updated_at', { ascending: false });
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Order Confirmation",
      "description": "Confirm COD orders via voice call",
      "status": "running",
      "concurrency": 5,
      "schedule": {
        "days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "start_time": "09:00",
        "end_time": "17:00",
        "timezone": "UTC"
      },
      "settings": {
        "max_attempts": 3,
        "call_recording": true,
        "retry_delay_minutes": 60
      },
      "agents": [
        {
          "id": "uuid",
          "name": "Order Confirmation Agent",
          "is_primary": true
        }
      ],
      "updated_at": "2026-01-28T14:30:00Z"
    }
  ]
}
```

**Tables**: campaigns, campaign_agents, agents  
**Access**: Read-only  
**Pagination**: Not required (expected <10 campaigns per org)

---

#### GET /campaigns/:id

**Purpose**: Get single campaign with full details

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('campaigns')
  .select(`
    *,
    campaign_agents(
      agent_id,
      is_primary,
      agents(*)
    )
  `)
  .eq('id', campaignId)
  .is('deleted_at', null)
  .single();
```

**Tables**: campaigns, campaign_agents, agents  
**Access**: Read-only

---

#### PATCH /campaigns/:id/status

**Purpose**: Enable or disable a campaign (toggle status between `running` and `paused`)

**Request Body**:
```json
{
  "status": "running" | "paused"
}
```

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('campaigns')
  .update({ 
    status: newStatus,
    started_at: newStatus === 'running' ? new Date().toISOString() : undefined
  })
  .eq('id', campaignId)
  .select()
  .single();
```

**Tables**: campaigns  
**Access**: Write (org members)  
**Constraints**:
- Only `running` ↔ `paused` transitions allowed in v1
- Cannot toggle campaigns in `draft`, `completed`, or `cancelled` status

---

#### PATCH /campaigns/:id/settings

**Purpose**: Update campaign settings (concurrency, schedule)

**Request Body**:
```json
{
  "concurrency": 10,
  "schedule": {
    "days": ["monday", "friday"],
    "start_time": "10:00",
    "end_time": "18:00"
  }
}
```

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('campaigns')
  .update({ concurrency, schedule })
  .eq('id', campaignId)
  .select()
  .single();
```

**Tables**: campaigns  
**Access**: Write (org members)

---

#### POST /campaigns/:id/agents

**Purpose**: Link an agent to a campaign

**Request Body**:
```json
{
  "agent_id": "uuid",
  "is_primary": true
}
```

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('campaign_agents')
  .insert({ campaign_id: campaignId, agent_id, is_primary });
```

**Tables**: campaign_agents  
**Access**: Write (org members)

---

#### DELETE /campaigns/:id/agents/:agentId

**Purpose**: Unlink an agent from a campaign

**Supabase Query**:
```typescript
const { error } = await supabase
  .from('campaign_agents')
  .delete()
  .eq('campaign_id', campaignId)
  .eq('agent_id', agentId);
```

**Tables**: campaign_agents  
**Access**: Write (org members)

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/campaigns` | GET /campaigns | Hardcoded `campaigns` array in Campaigns.tsx |
| `/campaigns/:id` | GET /campaigns/:id | `demoAgentCampaignData.ts` |
| `/campaigns/:id` (Controls tab) | PATCH /campaigns/:id/settings | Local state only |
| `/campaigns/:id` (Controls tab) | POST/DELETE agents | Local state only |

---

## Module: Agents

### Purpose

Agents are AI voice personas that handle calls. Each agent has configurable voice settings, tone, and sentiment rules. In MVP v1, agents are **pre-seeded** per campaign type.

### Database Mapping

**Primary Table**: `agents`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `name` | text | Agent display name |
| `language` | text | Primary language (default: English) |
| `tone` | agent_tone | professional, friendly, casual, formal, empathetic |
| `status` | agent_status | active, inactive, draft |
| `system_prompt` | text | AI system instructions |
| `sentiment_rules` | jsonb | Rules for positive/neutral/negative sentiment |
| `voice_settings` | jsonb | Voice provider config (speed, pitch, etc.) |
| `deleted_at` | timestamptz | Soft delete timestamp |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update timestamp |

### API Endpoints

#### GET /agents

**Purpose**: List all agents for the organization

**Supabase Query**:
```typescript
const { data: agents, error } = await supabase
  .from('agents')
  .select('*')
  .eq('organization_id', orgId)
  .is('deleted_at', null)
  .order('updated_at', { ascending: false });

// Get campaign counts
const { data: campaignAgents } = await supabase
  .from('campaign_agents')
  .select('agent_id, campaign_id');

// Merge counts into agents
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Order Confirmation Agent",
      "language": "English",
      "tone": "professional",
      "status": "active",
      "linkedCampaigns": 2,
      "updated_at": "2026-01-28T14:30:00Z"
    }
  ]
}
```

**Tables**: agents, campaign_agents  
**Access**: Read-only  
**Pagination**: Optional (expected <20 agents per org)

---

#### GET /agents/:id

**Purpose**: Get single agent with full configuration

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('agents')
  .select('*')
  .eq('id', agentId)
  .is('deleted_at', null)
  .single();
```

**Tables**: agents  
**Access**: Read-only

---

#### PATCH /agents/:id

**Purpose**: Update agent configuration

**Request Body**:
```json
{
  "name": "Updated Name",
  "tone": "friendly",
  "system_prompt": "New prompt...",
  "sentiment_rules": {...},
  "voice_settings": {...}
}
```

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('agents')
  .update({ ...updateData, updated_at: new Date().toISOString() })
  .eq('id', agentId)
  .select()
  .single();
```

**Tables**: agents  
**Access**: Write (org members)

---

#### PATCH /agents/:id/status

**Purpose**: Change agent status (activate/deactivate)

**Request Body**:
```json
{
  "status": "active" | "inactive"
}
```

**Tables**: agents  
**Access**: Write (org members)  
**Constraints**:
- Cannot deactivate if agent is linked to a running campaign

---

#### POST /agents

**Purpose**: Create a new agent

**Request Body**:
```json
{
  "name": "My New Agent",
  "language": "English",
  "tone": "professional",
  "system_prompt": "Optional initial prompt"
}
```

**Tables**: agents  
**Access**: Write (org members)  
**Note**: MVP v1 may restrict this to admins only

---

#### POST /agents/:id/duplicate

**Purpose**: Clone an existing agent

**Supabase Query**:
```typescript
const { data: original } = await supabase
  .from('agents')
  .select('*')
  .eq('id', agentId)
  .single();

const { data: clone } = await supabase
  .from('agents')
  .insert({
    ...original,
    id: undefined,
    name: `${original.name} (Copy)`,
    status: 'draft',
    created_at: undefined,
    updated_at: undefined
  })
  .select()
  .single();
```

**Tables**: agents  
**Access**: Write (org members)

---

#### DELETE /agents/:id

**Purpose**: Soft-delete an agent

**Supabase Query**:
```typescript
const { error } = await supabase
  .from('agents')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', agentId);
```

**Tables**: agents  
**Access**: Write (org admins only)  
**Constraints**:
- Cannot delete if linked to any campaign (remove links first)

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/agents` | GET /agents | `demoAgentCampaignData.ts` → `demoAgents` |
| `/agents/:id` | GET /agents/:id | `demoAgentCampaignData.ts` |
| `/agents/:id` | PATCH /agents/:id | Local state |
| New Agent Modal | POST /agents | N/A |

---

## Module: Call Logs

### Purpose

Call logs represent completed or in-progress voice calls. Each call is linked to a campaign, agent, and optionally to a commerce context (order or cart). This is the core module for analytics and outcome tracking.

### Database Mapping

**Primary Table**: `calls`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `campaign_id` | uuid | FK → campaigns.id |
| `agent_id` | uuid | FK → agents.id |
| `contact_id` | uuid | FK → contacts.id (optional) |
| `call_type` | call_type | inbound, outbound, webcall |
| `from_number` | text | Caller number |
| `to_number` | text | Recipient number |
| `status` | call_status | queued, ringing, in_progress, ended |
| `outcome` | call_outcome | answered, no_answer, busy, failed, voicemail |
| `duration_seconds` | integer | Call duration |
| `sentiment` | call_sentiment | positive, neutral, negative |
| `sentiment_score` | integer | Numeric sentiment (-100 to 100) |
| `summary` | text | AI-generated call summary |
| `attempt_number` | integer | Retry attempt number |
| `error_message` | text | Error details (if failed) |
| `tags` | jsonb | Custom tags array |
| `metadata` | jsonb | Flexible metadata (order_id, cart_id, etc.) |
| `external_call_id` | text | External provider call ID |
| `started_at` | timestamptz | Call start time |
| `ended_at` | timestamptz | Call end time |
| `created_at` | timestamptz | Record creation |

**Related Tables**:

`call_transcripts`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `call_id` | uuid | FK → calls.id |
| `speaker` | transcript_speaker | agent, caller, system |
| `content` | text | Transcript text |
| `sequence` | integer | Order in conversation |
| `confidence` | numeric | Speech recognition confidence |
| `timestamp` | timestamptz | When spoken |

`call_recordings`
| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `call_id` | uuid | FK → calls.id (one-to-one) |
| `storage_path` | text | Supabase Storage path |
| `duration_seconds` | integer | Recording duration |
| `file_size_bytes` | bigint | File size |

### API Endpoints

#### GET /calls

**Purpose**: List call logs with filtering and pagination

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `campaign_id` | uuid | Filter by campaign |
| `agent_id` | uuid | Filter by agent |
| `outcome` | string | Filter by outcome |
| `sentiment` | string | Filter by sentiment |
| `date_from` | date | Start date filter |
| `date_to` | date | End date filter |
| `search` | string | Search phone numbers |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Supabase Query**:
```typescript
let query = supabase
  .from('calls')
  .select(`
    id, organization_id, campaign_id, agent_id, contact_id,
    call_type, from_number, to_number, status, outcome,
    duration_seconds, sentiment, sentiment_score,
    attempt_number, error_message, summary, tags, metadata,
    started_at, ended_at, created_at, external_call_id,
    agents:agent_id(name),
    campaigns:campaign_id(name),
    contacts:contact_id(first_name, last_name)
  `, { count: 'exact' })
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });

// Apply filters
if (campaignId) query = query.eq('campaign_id', campaignId);
if (outcome) query = query.eq('outcome', outcome);
if (sentiment) query = query.eq('sentiment', sentiment);
if (dateFrom) query = query.gte('created_at', dateFrom);
if (dateTo) query = query.lte('created_at', dateTo);

// Pagination
query = query.range((page - 1) * limit, page * limit - 1);
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "campaign_name": "Order Confirmation",
      "agent_name": "Confirmation Agent",
      "contact_name": "John Doe",
      "to_number": "+919876543210",
      "outcome": "answered",
      "sentiment": "positive",
      "duration_seconds": 145,
      "summary": "Customer confirmed the order...",
      "started_at": "2026-01-28T10:30:00Z",
      "metadata": {
        "order_id": "uuid",
        "order_number": "#1001"
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "total_pages": 8
  }
}
```

**Tables**: calls, agents, campaigns, contacts  
**Access**: Read-only  
**Pagination**: Required (can be thousands of records)

---

#### GET /calls/:id

**Purpose**: Get single call with full details including transcript

**Supabase Query**:
```typescript
const { data: call } = await supabase
  .from('calls')
  .select(`
    *,
    agents:agent_id(*),
    campaigns:campaign_id(*),
    contacts:contact_id(*),
    call_recordings(*)
  `)
  .eq('id', callId)
  .single();

const { data: transcripts } = await supabase
  .from('call_transcripts')
  .select('*')
  .eq('call_id', callId)
  .order('sequence', { ascending: true });
```

**Tables**: calls, agents, campaigns, contacts, call_transcripts, call_recordings  
**Access**: Read-only

---

#### GET /calls/:id/transcript

**Purpose**: Get call transcript only

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('call_transcripts')
  .select('*')
  .eq('call_id', callId)
  .order('sequence', { ascending: true });
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "speaker": "agent",
      "content": "Hello, this is a confirmation call for your order...",
      "sequence": 1,
      "timestamp": "2026-01-28T10:30:05Z"
    },
    {
      "id": "uuid",
      "speaker": "caller",
      "content": "Yes, I placed the order yesterday.",
      "sequence": 2,
      "timestamp": "2026-01-28T10:30:12Z"
    }
  ]
}
```

**Tables**: call_transcripts  
**Access**: Read-only

---

#### GET /calls/:id/recording

**Purpose**: Get signed URL for call recording

**Supabase Query**:
```typescript
const { data: recording } = await supabase
  .from('call_recordings')
  .select('storage_path, duration_seconds')
  .eq('call_id', callId)
  .single();

const { data: signedUrl } = await supabase.storage
  .from('call-recordings')
  .createSignedUrl(recording.storage_path, 3600); // 1 hour expiry
```

**Response Shape**:
```json
{
  "url": "https://...signed-url...",
  "duration_seconds": 145,
  "expires_at": "2026-01-28T11:30:00Z"
}
```

**Tables**: call_recordings + Supabase Storage  
**Access**: Read-only

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/call-logs` | GET /calls | `demoOutcomesData.ts` → `demoCallLogs` |
| `/call-logs/:id` | GET /calls/:id | Inline demo data |
| `/call-logs/:id` | GET /calls/:id/transcript | Inline demo data |
| `/call-logs/:id` | GET /calls/:id/recording | N/A (new feature) |
| `/dashboard` | GET /calls (aggregated) | `demoOutcomesData.ts` |

---

## Module: Products

### Purpose

Products are read-only catalog items synced from Shopify. They provide context for voice campaigns (e.g., confirming which product was ordered).

### Database Mapping

**Primary Table**: `commerce_products`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `integration_id` | uuid | FK → commerce_integrations.id |
| `external_product_id` | text | Shopify product ID |
| `source` | commerce_source | shopify, woocommerce, custom_webhook |
| `title` | text | Product name |
| `description` | text | Product description |
| `vendor` | text | Manufacturer/vendor |
| `product_type` | text | Product category |
| `status` | product_status | active, draft, archived |
| `images` | jsonb | Array of image URLs |
| `tags` | jsonb | Product tags array |
| `synced_at` | timestamptz | Last sync from source |
| `created_at` | timestamptz | Creation timestamp |
| `updated_at` | timestamptz | Last update |

**Related Table**: `commerce_product_variants`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `product_id` | uuid | FK → commerce_products.id |
| `external_variant_id` | text | Shopify variant ID |
| `title` | text | Variant name (e.g., "Large / Blue") |
| `sku` | text | Stock keeping unit |
| `price` | numeric | Variant price |
| `compare_at_price` | numeric | Original price (for discounts) |
| `inventory_quantity` | integer | Stock count |
| `requires_shipping` | boolean | Physical product flag |
| `weight` | numeric | Product weight |
| `weight_unit` | text | kg, lb, etc. |

### API Endpoints

#### GET /products

**Purpose**: List products with filtering and pagination

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | Filter by status |
| `product_type` | string | Filter by category |
| `search` | string | Search title/vendor |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Supabase Query**:
```typescript
let query = supabase
  .from('commerce_products')
  .select(`
    *,
    commerce_product_variants(
      id, title, sku, price, inventory_quantity
    )
  `, { count: 'exact' })
  .eq('organization_id', orgId)
  .order('updated_at', { ascending: false });

if (status) query = query.eq('status', status);
if (productType) query = query.eq('product_type', productType);
if (search) query = query.ilike('title', `%${search}%`);

query = query.range((page - 1) * limit, page * limit - 1);
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "title": "Premium Wireless Headphones",
      "vendor": "TechBrand",
      "product_type": "Electronics",
      "status": "active",
      "images": ["https://..."],
      "variants": [
        {
          "id": "uuid",
          "title": "Black",
          "sku": "WH-001-BLK",
          "price": 2999.00,
          "inventory_quantity": 45
        }
      ],
      "synced_at": "2026-01-28T10:00:00Z"
    }
  ],
  "pagination": {...}
}
```

**Tables**: commerce_products, commerce_product_variants  
**Access**: Read-only  
**Pagination**: Required

---

#### GET /products/:id

**Purpose**: Get single product with all variants

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('commerce_products')
  .select(`
    *,
    commerce_product_variants(*),
    commerce_integrations:integration_id(store_name, source)
  `)
  .eq('id', productId)
  .single();
```

**Tables**: commerce_products, commerce_product_variants, commerce_integrations  
**Access**: Read-only

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/products` | GET /products | `demoCommerceData.ts` → `demoProducts` |
| Product Detail Drawer | GET /products/:id | `demoCommerceData.ts` |

---

## Module: Orders

### Purpose

Orders represent completed or pending purchases from the connected commerce platform. Orders with `payment_type: 'cod'` and `trigger_ready: 'ready'` are eligible for confirmation voice calls.

### Database Mapping

**Primary Table**: `commerce_orders`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `integration_id` | uuid | FK → commerce_integrations.id |
| `external_order_id` | text | Shopify order ID |
| `order_number` | text | Human-readable order # |
| `source` | commerce_source | shopify, woocommerce, custom_webhook |
| `customer_id` | uuid | FK → commerce_customers.id |
| `customer_name` | text | Denormalized customer name |
| `customer_email` | text | Denormalized email |
| `customer_phone` | text | Denormalized phone |
| `total_amount` | numeric | Order total |
| `subtotal` | numeric | Before tax/shipping |
| `total_tax` | numeric | Tax amount |
| `total_discounts` | numeric | Discount amount |
| `currency` | text | INR, USD, etc. |
| `payment_type` | payment_type | cod, prepaid, unknown |
| `financial_status` | order_financial_status | pending, paid, refunded, etc. |
| `fulfillment_status` | order_fulfillment_status | unfulfilled, partial, fulfilled |
| `trigger_ready` | trigger_ready_status | ready, missing_phone, not_applicable |
| `shipping_address` | jsonb | Delivery address |
| `billing_address` | jsonb | Billing address |
| `notes` | text | Order notes |
| `tags` | jsonb | Order tags |
| `order_created_at` | timestamptz | When order was placed |
| `synced_at` | timestamptz | Last sync from source |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last update |

**Related Table**: `commerce_order_items`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `order_id` | uuid | FK → commerce_orders.id |
| `product_id` | uuid | FK → commerce_products.id |
| `variant_id` | uuid | FK → commerce_product_variants.id |
| `title` | text | Line item title |
| `variant_title` | text | Variant name |
| `sku` | text | SKU |
| `quantity` | integer | Quantity ordered |
| `price` | numeric | Unit price |
| `total` | numeric | Line total |

### API Endpoints

#### GET /orders

**Purpose**: List orders with filtering and pagination

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `payment_type` | string | cod, prepaid |
| `trigger_ready` | string | ready, missing_phone |
| `financial_status` | string | pending, paid, etc. |
| `fulfillment_status` | string | unfulfilled, fulfilled |
| `date_from` | date | Order date filter |
| `date_to` | date | Order date filter |
| `search` | string | Search order #, customer |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Supabase Query**:
```typescript
let query = supabase
  .from('commerce_orders')
  .select(`
    id, order_number, customer_name, customer_phone, customer_email,
    total_amount, currency, payment_type, financial_status,
    fulfillment_status, trigger_ready, order_created_at,
    commerce_order_items(
      id, title, quantity, price, total
    )
  `, { count: 'exact' })
  .eq('organization_id', orgId)
  .order('order_created_at', { ascending: false });

if (paymentType) query = query.eq('payment_type', paymentType);
if (triggerReady) query = query.eq('trigger_ready', triggerReady);
// ... more filters

query = query.range((page - 1) * limit, page * limit - 1);
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "#1001",
      "customer_name": "Rahul Sharma",
      "customer_phone": "+919876543210",
      "total_amount": 4999.00,
      "currency": "INR",
      "payment_type": "cod",
      "financial_status": "pending",
      "fulfillment_status": "unfulfilled",
      "trigger_ready": "ready",
      "items": [
        {
          "title": "Premium Headphones",
          "quantity": 1,
          "price": 4999.00
        }
      ],
      "order_created_at": "2026-01-28T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

**Tables**: commerce_orders, commerce_order_items  
**Access**: Read-only  
**Pagination**: Required

---

#### GET /orders/:id

**Purpose**: Get single order with full details

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('commerce_orders')
  .select(`
    *,
    commerce_order_items(
      *,
      commerce_products:product_id(title, images),
      commerce_product_variants:variant_id(title, sku)
    ),
    commerce_integrations:integration_id(store_name, source)
  `)
  .eq('id', orderId)
  .single();
```

**Tables**: commerce_orders, commerce_order_items, commerce_products, commerce_integrations  
**Access**: Read-only

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/orders` | GET /orders | `demoCommerceData.ts` → `demoOrders` |
| Order Detail Drawer | GET /orders/:id | `demoCommerceData.ts` |

---

## Module: Abandoned Carts

### Purpose

Abandoned carts represent incomplete checkout sessions. Carts with `trigger_ready: 'ready'` are eligible for recovery voice calls.

### Database Mapping

**Primary Table**: `commerce_abandoned_carts`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `integration_id` | uuid | FK → commerce_integrations.id |
| `external_cart_id` | text | Shopify checkout ID |
| `source` | commerce_source | shopify, woocommerce, custom_webhook |
| `customer_id` | uuid | FK → commerce_customers.id |
| `customer_name` | text | Denormalized customer name |
| `customer_email` | text | Denormalized email |
| `customer_phone` | text | Denormalized phone |
| `total_value` | numeric | Cart total |
| `currency` | text | INR, USD, etc. |
| `items_count` | integer | Number of items |
| `status` | cart_status | abandoned, recovered, expired |
| `trigger_ready` | trigger_ready_status | ready, missing_phone, not_applicable |
| `recovery_url` | text | Cart recovery link |
| `abandoned_at` | timestamptz | When cart was abandoned |
| `synced_at` | timestamptz | Last sync |
| `created_at` | timestamptz | Record creation |
| `updated_at` | timestamptz | Last update |

**Related Table**: `commerce_cart_items`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `cart_id` | uuid | FK → commerce_abandoned_carts.id |
| `product_id` | uuid | FK → commerce_products.id |
| `variant_id` | uuid | FK → commerce_product_variants.id |
| `title` | text | Item title |
| `variant_title` | text | Variant name |
| `quantity` | integer | Quantity |
| `price` | numeric | Unit price |
| `total` | numeric | Line total |
| `image_url` | text | Product image |

### API Endpoints

#### GET /carts

**Purpose**: List abandoned carts with filtering and pagination

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `status` | string | abandoned, recovered |
| `trigger_ready` | string | ready, missing_phone |
| `date_from` | date | Abandoned date filter |
| `date_to` | date | Abandoned date filter |
| `min_value` | number | Minimum cart value |
| `search` | string | Search customer |
| `page` | integer | Page number |
| `limit` | integer | Items per page |

**Supabase Query**:
```typescript
let query = supabase
  .from('commerce_abandoned_carts')
  .select(`
    id, customer_name, customer_phone, customer_email,
    total_value, currency, items_count, status,
    trigger_ready, abandoned_at, recovery_url,
    commerce_cart_items(
      id, title, quantity, price, image_url
    )
  `, { count: 'exact' })
  .eq('organization_id', orgId)
  .order('abandoned_at', { ascending: false });

if (status) query = query.eq('status', status);
if (triggerReady) query = query.eq('trigger_ready', triggerReady);

query = query.range((page - 1) * limit, page * limit - 1);
```

**Tables**: commerce_abandoned_carts, commerce_cart_items  
**Access**: Read-only  
**Pagination**: Required

---

#### GET /carts/:id

**Purpose**: Get single cart with full details

**Tables**: commerce_abandoned_carts, commerce_cart_items, commerce_integrations  
**Access**: Read-only

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/abandoned-carts` | GET /carts | `demoCommerceData.ts` → `demoAbandonedCarts` |
| Cart Detail Drawer | GET /carts/:id | `demoCommerceData.ts` |

---

## Module: Integrations

### Purpose

Integrations manage the connection between the platform and external commerce sources (Shopify, WooCommerce, etc.). Currently only Shopify is supported.

### Database Mapping

**Primary Table**: `commerce_integrations`

| Column | Type | Description |
|--------|------|-------------|
| `id` | uuid | Primary key |
| `organization_id` | uuid | Tenant scope |
| `source` | commerce_source | shopify, woocommerce, custom_webhook |
| `status` | integration_status | connected, disconnected, error, pending |
| `store_name` | text | Store display name |
| `store_domain` | text | Shopify domain |
| `external_store_id` | text | Shopify shop ID |
| `access_token_encrypted` | text | Encrypted OAuth token |
| `webhook_status` | webhook_status | active, failed, pending |
| `settings` | jsonb | Integration-specific config |
| `last_sync_at` | timestamptz | Last full sync |
| `last_products_sync_at` | timestamptz | Last products sync |
| `last_orders_sync_at` | timestamptz | Last orders sync |
| `created_at` | timestamptz | Connection created |
| `updated_at` | timestamptz | Last update |

### API Endpoints

#### GET /integrations

**Purpose**: List all integrations for the organization

**Supabase Query**:
```typescript
const { data, error } = await supabase
  .from('commerce_integrations')
  .select('*')
  .eq('organization_id', orgId)
  .order('created_at', { ascending: false });
```

**Response Shape**:
```json
{
  "data": [
    {
      "id": "uuid",
      "source": "shopify",
      "status": "connected",
      "store_name": "My Store",
      "store_domain": "my-store.myshopify.com",
      "webhook_status": "active",
      "last_sync_at": "2026-01-28T10:00:00Z"
    }
  ]
}
```

**Tables**: commerce_integrations  
**Access**: Read-only (for display)  
**Note**: `access_token_encrypted` is NEVER returned to frontend

---

#### GET /integrations/:id

**Purpose**: Get single integration details

**Tables**: commerce_integrations  
**Access**: Read-only

---

#### POST /integrations/shopify/connect

**Purpose**: Initiate Shopify OAuth flow

**Note**: This requires an Edge Function to:
1. Generate OAuth URL
2. Handle callback
3. Exchange code for access token
4. Store encrypted token

**Access**: Write (org admins only)

---

#### DELETE /integrations/:id

**Purpose**: Disconnect an integration

**Supabase Query**:
```typescript
const { error } = await supabase
  .from('commerce_integrations')
  .update({ status: 'disconnected', access_token_encrypted: null })
  .eq('id', integrationId);
```

**Tables**: commerce_integrations  
**Access**: Write (org admins only)

---

#### POST /integrations/:id/sync

**Purpose**: Trigger manual data sync

**Note**: This requires an Edge Function to:
1. Fetch products/orders from Shopify API
2. Upsert into commerce_* tables
3. Update last_sync_at timestamps

**Access**: Write (org admins only)

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/integrations` | GET /integrations | Hardcoded integration cards |
| Connect Shopify Flow | POST /integrations/shopify/connect | N/A |
| Disconnect Button | DELETE /integrations/:id | N/A |

---

## Module: Dashboard & Analytics

### Purpose

Aggregation APIs for the dashboard outcomes display and analytics charts.

### API Endpoints

#### GET /analytics/outcomes

**Purpose**: Get outcome summary metrics

**Metrics Returned**:
- `revenue_recovered`: Sum of recovered cart values (carts with status = 'recovered')
- `cod_confirmed`: Count of answered calls for COD orders
- `carts_recovered`: Count of carts with status = 'recovered'
- `rto_prevented`: Count of orders where voice confirmation prevented RTO

**Supabase Query**:
```typescript
// Revenue recovered (recovered carts)
const { data: recoveredCarts } = await supabase
  .from('commerce_abandoned_carts')
  .select('total_value')
  .eq('organization_id', orgId)
  .eq('status', 'recovered');

const revenueRecovered = recoveredCarts?.reduce((sum, c) => sum + c.total_value, 0) || 0;

// COD confirmed (calls with answered outcome for COD orders)
const { count: codConfirmed } = await supabase
  .from('calls')
  .select('*', { count: 'exact', head: true })
  .eq('organization_id', orgId)
  .eq('outcome', 'answered')
  .contains('metadata', { payment_type: 'cod' });

// Carts recovered
const { count: cartsRecovered } = await supabase
  .from('commerce_abandoned_carts')
  .select('*', { count: 'exact', head: true })
  .eq('organization_id', orgId)
  .eq('status', 'recovered');
```

**Response Shape**:
```json
{
  "revenue_recovered": 125000.00,
  "cod_confirmed": 342,
  "carts_recovered": 45,
  "rto_prevented": 89,
  "period": "last_30_days"
}
```

**Tables**: commerce_abandoned_carts, calls, commerce_orders  
**Access**: Read-only

---

#### GET /analytics/calls

**Purpose**: Get call analytics for charts

**Query Parameters**:
| Parameter | Type | Description |
|-----------|------|-------------|
| `period` | string | today, week, month, custom |
| `date_from` | date | Custom period start |
| `date_to` | date | Custom period end |
| `group_by` | string | day, week, campaign |

**Response Shape**:
```json
{
  "data": [
    {
      "date": "2026-01-28",
      "total_calls": 150,
      "answered": 120,
      "no_answer": 20,
      "failed": 10,
      "avg_duration": 145
    }
  ]
}
```

**Tables**: calls (aggregated)  
**Access**: Read-only

---

### Frontend Usage

| Page | API | Replaces Demo Data |
|------|-----|-------------------|
| `/dashboard` | GET /analytics/outcomes | `demoOutcomesData.ts` |
| `/dashboard` | GET /analytics/calls | `demoOutcomesData.ts` |
| `/call-analytics` | GET /analytics/calls | `demoOutcomesData.ts` |

---

## Appendix: Database Schema Reference

### Enum Types

```sql
-- Campaign status
CREATE TYPE campaign_status AS ENUM (
  'draft', 'scheduled', 'running', 'paused', 'completed', 'cancelled'
);

-- Agent status
CREATE TYPE agent_status AS ENUM ('active', 'inactive', 'draft');

-- Agent tone
CREATE TYPE agent_tone AS ENUM (
  'professional', 'friendly', 'casual', 'formal', 'empathetic'
);

-- Call type
CREATE TYPE call_type AS ENUM ('inbound', 'outbound', 'webcall');

-- Call status (technical state)
CREATE TYPE call_status AS ENUM ('queued', 'ringing', 'in_progress', 'ended');

-- Call outcome (business result)
CREATE TYPE call_outcome AS ENUM (
  'answered', 'no_answer', 'busy', 'failed', 'voicemail'
);

-- Call sentiment
CREATE TYPE call_sentiment AS ENUM ('positive', 'neutral', 'negative');

-- Payment type
CREATE TYPE payment_type AS ENUM ('cod', 'prepaid', 'unknown');

-- Trigger ready status
CREATE TYPE trigger_ready_status AS ENUM (
  'ready', 'missing_phone', 'not_applicable'
);

-- Order financial status
CREATE TYPE order_financial_status AS ENUM (
  'pending', 'paid', 'refunded', 'partially_refunded', 'voided'
);

-- Order fulfillment status
CREATE TYPE order_fulfillment_status AS ENUM (
  'unfulfilled', 'partial', 'fulfilled', 'restocked'
);

-- Cart status
CREATE TYPE cart_status AS ENUM ('abandoned', 'recovered', 'expired');

-- Commerce source
CREATE TYPE commerce_source AS ENUM (
  'shopify', 'woocommerce', 'custom_webhook'
);

-- Integration status
CREATE TYPE integration_status AS ENUM (
  'connected', 'disconnected', 'error', 'pending'
);
```

### Foreign Key Relationships

```
campaigns.organization_id → organizations.id
agents.organization_id → organizations.id
campaign_agents.campaign_id → campaigns.id
campaign_agents.agent_id → agents.id
calls.organization_id → organizations.id
calls.campaign_id → campaigns.id
calls.agent_id → agents.id
call_transcripts.call_id → calls.id
call_recordings.call_id → calls.id
commerce_products.organization_id → organizations.id
commerce_products.integration_id → commerce_integrations.id
commerce_product_variants.product_id → commerce_products.id
commerce_orders.organization_id → organizations.id
commerce_orders.integration_id → commerce_integrations.id
commerce_order_items.order_id → commerce_orders.id
commerce_abandoned_carts.organization_id → organizations.id
commerce_abandoned_carts.integration_id → commerce_integrations.id
commerce_cart_items.cart_id → commerce_abandoned_carts.id
commerce_integrations.organization_id → organizations.id
```

### RLS Policy Pattern

All tables follow this RLS pattern:

```sql
-- SELECT: User can view records in their organization
CREATE POLICY "Users can view org [table]"
ON public.[table]
FOR SELECT
USING (
  organization_id = get_user_organization_id(auth.uid())
  OR has_role(auth.uid(), 'admin')
);

-- INSERT: User can create records in their organization
CREATE POLICY "Users can create org [table]"
ON public.[table]
FOR INSERT
WITH CHECK (
  organization_id = get_user_organization_id(auth.uid())
);

-- UPDATE: User can update records in their organization
CREATE POLICY "Users can update org [table]"
ON public.[table]
FOR UPDATE
USING (organization_id = get_user_organization_id(auth.uid()))
WITH CHECK (organization_id = get_user_organization_id(auth.uid()));
```

---

## Implementation Priority

### Phase 1: Core Data (Week 1)
1. GET /campaigns
2. GET /agents
3. GET /calls (with pagination)
4. GET /calls/:id/transcript

### Phase 2: Commerce (Week 2)
5. GET /orders
6. GET /products
7. GET /carts
8. GET /integrations

### Phase 3: Mutations (Week 3)
9. PATCH /campaigns/:id/status
10. PATCH /agents/:id
11. POST/DELETE campaign agent links

### Phase 4: Analytics (Week 4)
12. GET /analytics/outcomes
13. GET /analytics/calls

---

## Notes for Developers

1. **All queries use Supabase client SDK** - No separate API layer needed
2. **RLS handles authorization** - No need to manually check organization_id
3. **Existing hooks can be adapted** - `useAgents`, `useCampaigns`, `useCallLogs` already have the patterns
4. **Demo data files map 1:1** - Response shapes match `src/data/demo*.ts` structures
5. **Pagination is mandatory** for calls, orders, products, carts
6. **Never expose encrypted tokens** - `access_token_encrypted` stays server-side only
