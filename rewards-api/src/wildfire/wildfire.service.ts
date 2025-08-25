import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface WildfireCommission {
  CommissionID: number;
  ApplicationID: number;
  MerchantID: number;
  DeviceID: number;
  DeviceXID?: string;
  SaleAmount?: { Amount: string; Currency: string };
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

@Injectable()
export class WildfireService {
  private readonly logger = new Logger(WildfireService.name);

  constructor(private readonly http: HttpService) {}

  private buildHeaders() {
    return {
      Authorization: process.env.WILDFIRE_AUTHORIZATION || '',
      'X-WF-DateTime': new Date(Date.now() + (Number(process.env.WILDFIRE_TIME_SKEW_MINUTES || 0) * 60_000)).toISOString(),
      'Content-Type': 'application/json'
    } as Record<string, string>;
  }

  async fetchCommissions(params: {
    startModifiedIso: string;
    endModifiedIso: string;
    nextCursor?: string | null;
    limit?: number;
    sortBy?: 'modified_date' | 'created_date';
    sortOrder?: 'asc' | 'desc';
  }): Promise<CommissionsResponse> {
    const base = process.env.WILDFIRE_API_BASE || 'https://api.wfi.re/v5';
    const limit = params.limit ?? Number(process.env.WILDFIRE_PAGE_LIMIT || 500);
    const url = new URL(`${base}/commission`);
    url.searchParams.set('limit', String(limit));
    url.searchParams.set('start_modified_date', params.startModifiedIso);
    url.searchParams.set('end_modified_date', params.endModifiedIso);
    url.searchParams.set('sort_by', params.sortBy || 'modified_date');
    url.searchParams.set('sort_order', params.sortOrder || 'asc');
    if (params.nextCursor) url.searchParams.set('cursor', params.nextCursor);

    const resp = await firstValueFrom(
      this.http.get<CommissionsResponse>(url.toString(), { headers: this.buildHeaders() })
    );
    return resp.data;
  }

  computeCashback(commission: WildfireCommission): { amount: number | null; currency: string | null } {
    const deviceSplits = (commission.Amounts || []).filter(a => (a.SplitPart || '').toUpperCase() === 'DEVICE');
    if (deviceSplits.length === 0) return { amount: null, currency: null };
    const currency = deviceSplits[0].Currency || null;
    const amount = deviceSplits.reduce((sum, a) => sum + Number(a.Amount || 0), 0);
    return { amount, currency };
  }
}

