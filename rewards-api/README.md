# rewards-api

A NestJS service that syncs Wildfire commissions into Postgres/Supabase, upserting `cashback_transactions` and linking to `user_profiles` by `wildfire_device_id`. Runs every 10 minutes by default.

## Prerequisites
- Node 18+
- Postgres/Supabase database
- Wildfire API credentials/authorization header value

## Setup
1. Copy env file:
```bash
cp .env.example .env
```
2. Edit `.env` with your values:
- `DATABASE_URL` (e.g., Supabase connection string)
- `WILDFIRE_AUTHORIZATION` (e.g., `Bearer <token>`)
- Optional: `WILDFIRE_SYNC_LOOKBACK_MINUTES`, `WILDFIRE_PAGE_LIMIT`, `PORT`

3. Install dependencies:
```bash
npm install
```

4. Apply SQL to your DB (Supabase SQL editor or psql). In `sql/` apply in order:
- `01_user_profiles_add_columns.sql`
- `02_cashback_transactions.sql`
- `03_sync_state.sql`

## Run
- Dev:
```bash
npm run start:dev
```
- Prod build and run:
```bash
npm run build
npm start
```

The cron job runs every 10 minutes and will:
- Load last sync window from `sync_state` key `wildfire.commissions`
- Query Wildfire `/v5/commission` by modified date window with pagination
- Upsert to `cashback_transactions` by `wildfire_commission_id`
- Map `DeviceID -> user_profiles.wildfire_device_id`
- Snapshot `preferred_coin` and `wallet_address`
- Update status when commissions change (e.g., pending -> completed)

## Backfill / One-off
To backfill a timeframe, temporarily set a larger `WILDFIRE_SYNC_LOOKBACK_MINUTES` or add a small script/endpoint that calls `CommissionsSyncJob.runOnce()` with custom dates.

## cURL parity check
```bash
curl --location 'https://api.wfi.re/v5/commission?limit=2&start_modified_date=2022-09-28T12%3A00%3A00Z&end_modified_date=2022-09-29T12%3A00%3A00Z&sort_by=modified_date&sort_order=asc' \
  --header "Authorization: $WILDFIRE_AUTHORIZATION" \
  --header "X-WF-DateTime: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  --header 'Content-Type: application/json' | jq .
```

## Notes
- Dedupe key: `cashback_transactions.wildfire_commission_id` unique index
- Status mapping: `LOCKED|APPROVED|PAID -> COMPLETED`, `DECLINED|REJECTED -> DECLINED`, else `PENDING`
- Cron cadence is every 10 minutes; adjust in code if needed