CREATE TABLE IF NOT EXISTS public.sync_state (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

INSERT INTO public.sync_state (key, value)
VALUES ('wildfire.commissions', jsonb_build_object('last_modified_iso', NULL, 'next_cursor', NULL))
ON CONFLICT (key) DO NOTHING;

