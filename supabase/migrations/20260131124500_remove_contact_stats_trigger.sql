-- Drop the trigger that references the missing contact_id column
DROP TRIGGER IF EXISTS tr_calls_update_contact_stats ON public.calls;

-- Drop the function that the trigger used
DROP FUNCTION IF EXISTS public.update_contact_call_stats();

-- Drop the contact_call_stats table as it depends on contacts which are removed
DROP TABLE IF EXISTS public.contact_call_stats;
