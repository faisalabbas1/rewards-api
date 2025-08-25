import { HttpService } from '@nestjs/axios';
export interface WildfireCommission {
    CommissionID: number;
    ApplicationID: number;
    MerchantID: number;
    DeviceID: number;
    DeviceXID?: string;
    SaleAmount?: {
        Amount: string;
        Currency: string;
    };
    Amounts?: Array<{
        Amount: string;
        Currency: string;
        SplitPart?: string;
        BaseCommissionAmount?: string;
        BoostedCommissionAmount?: string;
    }>;
    Status: string;
    TrackingCode?: string;
    EventDate?: string;
    LockingDate?: string;
    CreatedDate?: string;
    ModifiedDate?: string;
    MerchantOrderID?: string;
    MerchantSKU?: string;
    CouponCodes?: string;
    ShoppingTripCode?: string;
}
interface CommissionsResponse {
    Commissions: WildfireCommission[];
    PrevCursor: string | null;
    NextCursor: string | null;
}
export declare class WildfireService {
    private readonly http;
    private readonly logger;
    constructor(http: HttpService);
    private buildHeaders;
    fetchCommissions(params: {
        startModifiedIso: string;
        endModifiedIso: string;
        nextCursor?: string | null;
        limit?: number;
        sortBy?: 'modified_date' | 'created_date';
        sortOrder?: 'asc' | 'desc';
    }): Promise<CommissionsResponse>;
    computeCashback(commission: WildfireCommission): {
        amount: number | null;
        currency: string | null;
    };
}
export {};
