export declare class CashbackTransaction {
    id: string;
    wildfire_commission_id: string;
    device_id: string | null;
    user_id: string | null;
    status: string;
    sale_amount: string | null;
    sale_currency: string | null;
    cashback_amount: string | null;
    cashback_currency: string | null;
    tracking_code: string | null;
    merchant_order_id: string | null;
    event_date: Date | null;
    locking_date: Date | null;
    commission_created_date: Date | null;
    commission_modified_date: Date | null;
    preferred_coin: string | null;
    wallet_address: string | null;
    created_at: Date;
    updated_at: Date;
}
