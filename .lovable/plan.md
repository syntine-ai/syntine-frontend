
# Phone Number Management - Implementation Plan

## Overview
This plan implements a complete Phone Number Management system as a foundational feature in Syntine. The feature allows organizations to view, assign, and manage phone numbers, and link them to AI agents for future voice calling capabilities.

---

## Phase 1: Database Schema

### New Table: `phone_numbers`

```sql
CREATE TYPE phone_number_status AS ENUM ('available', 'assigned', 'reserved');

CREATE TABLE public.phone_numbers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  region TEXT,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
  agent_id UUID REFERENCES public.agents(id) ON DELETE SET NULL,
  status phone_number_status NOT NULL DEFAULT 'available',
  monthly_cost NUMERIC(10, 2) DEFAULT 0,
  provider TEXT DEFAULT 'twilio',
  capabilities JSONB DEFAULT '{"voice": true, "sms": false}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX idx_phone_numbers_org ON public.phone_numbers(organization_id);
CREATE INDEX idx_phone_numbers_agent ON public.phone_numbers(agent_id);
CREATE INDEX idx_phone_numbers_status ON public.phone_numbers(status);

-- Update trigger
CREATE TRIGGER update_phone_numbers_updated_at
  BEFORE UPDATE ON public.phone_numbers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Column Definitions

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `phone_number` | TEXT | E.164 format phone number (e.g., +14155551234) |
| `country` | TEXT | ISO country code (e.g., US, IN, GB) |
| `region` | TEXT | State/region name (optional) |
| `organization_id` | UUID | Assigned organization (NULL = available pool) |
| `agent_id` | UUID | Connected agent (NULL = not connected) |
| `status` | ENUM | available, assigned, reserved |
| `monthly_cost` | NUMERIC | Informational cost per month |
| `provider` | TEXT | Telephony provider (twilio, etc.) |
| `capabilities` | JSONB | Features like voice, SMS support |

### RLS Policies

```sql
-- Enable RLS
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;

-- View: Org members see their assigned numbers + all available numbers
CREATE POLICY "Users can view available and org numbers"
  ON public.phone_numbers FOR SELECT
  TO authenticated
  USING (
    organization_id IS NULL 
    OR organization_id = get_user_organization_id(auth.uid())
    OR has_role(auth.uid(), 'admin')
  );

-- Assign: Org admins can assign available numbers to their org
CREATE POLICY "Org admins can assign available numbers"
  ON public.phone_numbers FOR UPDATE
  TO authenticated
  USING (
    (organization_id IS NULL AND status = 'available')
    OR organization_id = get_user_organization_id(auth.uid())
  )
  WITH CHECK (
    organization_id = get_user_organization_id(auth.uid())
    OR organization_id IS NULL
  );

-- Platform admins can create/delete numbers
CREATE POLICY "Admins can manage all numbers"
  ON public.phone_numbers FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));
```

### Modify Agents Table

```sql
-- Add phone_number_id column to agents
ALTER TABLE public.agents 
  ADD COLUMN phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE SET NULL;

-- Index for lookups
CREATE INDEX idx_agents_phone_number ON public.agents(phone_number_id);
```

---

## Phase 2: Frontend Implementation

### 2.1 New Files to Create

#### File: `src/pages/PhoneNumbers.tsx`

Main page with two sections:
1. **My Phone Numbers** - Numbers assigned to organization
2. **Available Numbers** - Pool of unassigned numbers

**UI Elements:**
- Summary cards (total assigned, connected to agents, available)
- Table view with country flags, number, region, status, agent link
- Action buttons: Assign, Connect, Disconnect, Release
- Filters: Country dropdown, status filter
- Search by phone number

**Page Structure:**
```
PageContainer (title="Phone Numbers")
  ├── Summary Cards (4 cards in grid)
  │   ├── My Numbers (count)
  │   ├── Connected to Agents (count)
  │   ├── Available to Assign (count)
  │   └── Monthly Cost (sum)
  │
  ├── Tabs
  │   ├── Tab: "My Numbers"
  │   │   └── PhoneNumbersTable (org assigned)
  │   │
  │   └── Tab: "Available Numbers"
  │       ├── Filters (country, region)
  │       └── PhoneNumbersTable (available pool)
```

#### File: `src/components/phone-numbers/PhoneNumbersTable.tsx`

Reusable table component displaying phone numbers.

**Columns:**
- Phone Number (with country flag icon)
- Country / Region
- Status (Badge: Available / Assigned / Connected)
- Connected Agent (agent name or "Not connected")
- Monthly Cost
- Actions (dropdown: Connect, Disconnect, Release)

#### File: `src/components/phone-numbers/AssignNumberModal.tsx`

Modal for assigning an available number to the organization.

**Content:**
- Number display
- Country and region info
- Monthly cost (informational)
- Confirm button

#### File: `src/components/phone-numbers/ConnectAgentModal.tsx`

Modal for connecting a number to an agent.

**Content:**
- Dropdown of organization's agents (only those without a connected number)
- Selected number display
- Confirm/Cancel buttons

#### File: `src/hooks/usePhoneNumbers.ts`

Custom hook for phone number operations.

**Functions:**
- `fetchOrgNumbers()` - Get numbers assigned to org
- `fetchAvailableNumbers(filters)` - Get available pool with filters
- `assignNumber(numberId)` - Assign to organization
- `releaseNumber(numberId)` - Release back to pool
- `connectToAgent(numberId, agentId)` - Link number to agent
- `disconnectFromAgent(numberId)` - Unlink from agent

**State:**
- `orgNumbers` - Organization's assigned numbers
- `availableNumbers` - Available pool
- `isLoading`, `error`
- Filter state for country/region

### 2.2 Files to Modify

#### File: `src/components/layout/SidebarNavigation.tsx`

Add new navigation item:

```typescript
import { PhoneCall } from "lucide-react";

const orgNavItems: NavItem[] = [
  { icon: Zap, label: "Dashboard", route: "/dashboard" },
  { icon: LayoutGrid, label: "Campaigns", route: "/campaigns" },
  { icon: Bot, label: "Agents", route: "/agents" },
  { icon: PhoneCall, label: "Phone Numbers", route: "/phone-numbers" }, // NEW
  { icon: Phone, label: "Call Logs", route: "/calls" },
  // ... rest
];
```

#### File: `src/App.tsx`

Add new route:

```typescript
import PhoneNumbers from "./pages/PhoneNumbers";

// Inside protected routes:
<Route path="/phone-numbers" element={<PhoneNumbers />} />
```

#### File: `src/pages/AgentDetail.tsx`

Add phone number section to agent detail page:

**New Section (after header, before prompt):**
```
Phone Number Card
├── If connected:
│   ├── Display connected number with flag
│   ├── "Disconnect" button
│   └── Link to Phone Numbers page
│
└── If not connected:
    ├── "No phone number connected" message
    ├── "Connect Number" button (opens modal or redirects)
    └── Helper text explaining the feature
```

#### File: `src/pages/Agents.tsx`

Update agents list table to show phone number column:

**New Column:**
- "Phone Number" column after "Last Updated"
- Shows connected number or "—" if none
- Clicking number navigates to phone numbers page

#### File: `src/hooks/useAgents.ts`

Extend to include phone number data:

```typescript
// Update fetch query to join phone_numbers
const { data: agentsData } = await supabase
  .from("agents")
  .select(`
    *,
    phone_numbers(id, phone_number, country)
  `)
  .eq("organization_id", orgId)
  .is("deleted_at", null);

// Add phone_number to AgentWithCampaigns interface
export interface AgentWithCampaigns extends Agent {
  linkedCampaigns: number;
  phone_number?: {
    id: string;
    phone_number: string;
    country: string;
  } | null;
}
```

---

## Phase 3: Component Details

### 3.1 Phone Numbers Page Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Phone Numbers                                                    │
│ Manage your organization's phone numbers                        │
├─────────────────────────────────────────────────────────────────┤
│ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│ │ My       │ │ Connected│ │ Available│ │ Monthly  │            │
│ │ Numbers  │ │ to Agents│ │ Pool     │ │ Cost     │            │
│ │    4     │ │    2     │ │   12     │ │ ₹4,800   │            │
│ └──────────┘ └──────────┘ └──────────┘ └──────────┘            │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────────────┐ ┌─────────────────┐                        │
│ │ My Numbers      │ │ Available Pool  │                        │
│ └─────────────────┴─┴─────────────────┴────────────────────────┤
│                                                                  │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Search: [                    ]  Country: [All ▼]           │ │
│ └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│ ┌─────────────────────────────────────────────────────────────┐│
│ │ Number        │ Region    │ Status    │ Agent    │ Actions ││
│ ├───────────────┼───────────┼───────────┼──────────┼─────────┤│
│ │ 🇮🇳 +91 98XX │ Mumbai    │ Connected │ Order... │ ⋮       ││
│ │ 🇮🇳 +91 98XX │ Delhi     │ Assigned  │ —        │ ⋮       ││
│ │ 🇺🇸 +1 415XX │ California│ Assigned  │ —        │ ⋮       ││
│ └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Status Badges

| Status | Badge Style | Meaning |
|--------|-------------|---------|
| `available` | Gray outline | In pool, not assigned to any org |
| `assigned` | Blue bg/text | Assigned to org, not connected to agent |
| `connected` | Green bg/text | Assigned to org AND connected to agent |

### 3.3 Actions Menu

**For "My Numbers" tab:**
- Connect to Agent (if not connected)
- Disconnect from Agent (if connected)
- Release Number (returns to available pool)

**For "Available Numbers" tab:**
- Assign to My Organization

---

## Phase 4: Constraints & Business Rules

### One-to-One Relationship
- One phone number can connect to only ONE agent
- One agent can have only ONE phone number
- Enforced at database level via unique constraint on `agent_id` in phone_numbers

```sql
CREATE UNIQUE INDEX idx_phone_numbers_agent_unique 
  ON public.phone_numbers(agent_id) 
  WHERE agent_id IS NOT NULL;
```

### Release Rules
- Cannot release a number that is connected to an active agent
- Must disconnect first, then release
- UI enforces this flow

### Assignment Rules
- Only org_admin and org_owner roles can assign/release numbers
- All org members can view numbers
- Regular members cannot modify assignments

---

## Phase 5: File Structure Summary

### New Files
```
src/
├── pages/
│   └── PhoneNumbers.tsx
├── components/
│   └── phone-numbers/
│       ├── PhoneNumbersTable.tsx
│       ├── AssignNumberModal.tsx
│       ├── ConnectAgentModal.tsx
│       ├── PhoneNumberStatusBadge.tsx
│       └── ReleaseNumberDialog.tsx
└── hooks/
    └── usePhoneNumbers.ts
```

### Modified Files
```
src/
├── App.tsx                                    (add route)
├── components/layout/SidebarNavigation.tsx   (add nav item)
├── pages/Agents.tsx                          (add phone column)
├── pages/AgentDetail.tsx                     (add phone section)
└── hooks/useAgents.ts                        (join phone data)
```

---

## Phase 6: Implementation Order

### Step 1: Database Migration
1. Create `phone_number_status` enum
2. Create `phone_numbers` table with all columns
3. Add RLS policies
4. Add `phone_number_id` to `agents` table
5. Create indexes and unique constraint

### Step 2: Core Hook
1. Create `usePhoneNumbers.ts` with CRUD operations
2. Test queries against empty table

### Step 3: Phone Numbers Page
1. Create `PhoneNumbers.tsx` with layout
2. Create `PhoneNumbersTable.tsx` component
3. Add tab navigation (My Numbers / Available)
4. Add summary stat cards

### Step 4: Modals & Actions
1. Create `AssignNumberModal.tsx`
2. Create `ConnectAgentModal.tsx`
3. Create `ReleaseNumberDialog.tsx` (confirmation)
4. Wire up action handlers

### Step 5: Navigation
1. Update `SidebarNavigation.tsx`
2. Add route to `App.tsx`

### Step 6: Agent Integration
1. Update `useAgents.ts` to join phone data
2. Add phone column to `Agents.tsx` list
3. Add phone section to `AgentDetail.tsx`

### Step 7: Testing & Polish
1. Verify all flows work end-to-end
2. Test RLS policies
3. Add loading/error states
4. Add toast notifications for actions

---

## Technical Notes

### API Patterns
Following existing patterns from `useAgents.ts`:
- Direct Supabase client calls (no Edge Functions needed)
- Optimistic UI updates where appropriate
- Toast notifications for success/error
- Loading states with Loader2 spinner

### UI Components Used
- `PageContainer` for layout
- `Table`, `TableHeader`, `TableRow`, `TableCell` from shadcn
- `Badge` for status pills
- `Button` for actions
- `Dialog` for modals
- `DropdownMenu` for action menus
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Select` for filters

### Country Flag Display
Use emoji flags based on country code:
```typescript
const getCountryFlag = (countryCode: string) => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};
// getCountryFlag('IN') => '🇮🇳'
```

---

## Success Criteria Checklist

- [ ] Organizations can see all their assigned phone numbers
- [ ] Organizations can view available numbers to assign
- [ ] Org admins can assign numbers from available pool
- [ ] Org admins can release numbers back to pool
- [ ] Users can connect a number to an agent (1:1)
- [ ] Users can disconnect a number from an agent
- [ ] Agent detail page shows connected phone number
- [ ] Agent list shows phone number column
- [ ] Phone Numbers appears in sidebar navigation
- [ ] All actions show appropriate loading states
- [ ] All actions show success/error toasts
- [ ] RLS policies correctly scope data access
