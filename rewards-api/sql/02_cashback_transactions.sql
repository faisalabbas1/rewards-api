CREATE TABLE IF NOT EXISTS public.cashback_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  wildfire_commission_id bigint NOT NULL,
  device_id bigint,
  user_id uuid NULL,
  status text NOT NULL DEFAULT 'PENDING',
  sale_amount numeric(18,6) NULL,
  sale_currency text NULL,
  cashback_amount numeric(18,6) NULL,
  cashback_currency text NULL,
  tracking_code text NULL,
  merchant_order_id text NULL,
  event_date timestamptz NULL,
  locking_date timestamptz NULL,
  commission_created_date timestamptz NULL,
  commission_modified_date timestamptz NULL,
  preferred_coin text NULL,
  wallet_address text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS ux_cashback_transactions_wildfire_commission_id
  ON public.cashback_transactions (wildfire_commission_id);

CREATE INDEX IF NOT EXISTS idx_cashback_user_id
  ON public.cashback_transactions (user_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_updated_at_cashback ON public.cashback_transactions;
CREATE TRIGGER set_updated_at_cashback
BEFORE UPDATE ON public.cashback_transactions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

