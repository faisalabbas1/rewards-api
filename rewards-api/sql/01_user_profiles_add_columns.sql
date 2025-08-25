ALTER TABLE public.user_profiles
  ADD COLUMN IF NOT EXISTS wildfire_device_id bigint UNIQUE,
  ADD COLUMN IF NOT EXISTS preferred_coin text,
  ADD COLUMN IF NOT EXISTS wallet_address text;

CREATE INDEX IF NOT EXISTS idx_user_profiles_wildfire_device_id
  ON public.user_profiles (wildfire_device_id);

