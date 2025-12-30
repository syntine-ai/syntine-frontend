-- Create call_type enum
CREATE TYPE public.call_type AS ENUM ('inbound', 'outbound', 'webcall');

-- Add new columns to calls table
ALTER TABLE public.calls 
ADD COLUMN call_type public.call_type,
ADD COLUMN from_number text,
ADD COLUMN to_number text;

-- Migrate existing data: set call_type based on existing direction field
UPDATE public.calls 
SET call_type = CASE 
  WHEN direction = 'inbound' THEN 'inbound'::public.call_type
  WHEN direction = 'outbound' THEN 'outbound'::public.call_type
  ELSE 'outbound'::public.call_type
END;

-- For existing calls, populate from_number/to_number based on direction
-- For outbound: from_number is org's number (null for now), to_number is phone_number
-- For inbound: from_number is phone_number, to_number is org's number (null for now)
UPDATE public.calls
SET 
  from_number = CASE WHEN direction = 'inbound' THEN phone_number ELSE NULL END,
  to_number = CASE WHEN direction = 'outbound' THEN phone_number ELSE NULL END;

-- Add comment for clarity
COMMENT ON COLUMN public.calls.call_type IS 'Type of call: inbound, outbound, or webcall';
COMMENT ON COLUMN public.calls.from_number IS 'The originating phone number';
COMMENT ON COLUMN public.calls.to_number IS 'The destination phone number';