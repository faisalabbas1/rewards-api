var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var WildfireService_1;
import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
let WildfireService = WildfireService_1 = class WildfireService {
    constructor(http) {
        this.http = http;
        this.logger = new Logger(WildfireService_1.name);
    }
    buildHeaders() {
        return {
            Authorization: process.env.WILDFIRE_AUTHORIZATION || '',
            'X-WF-DateTime': new Date(Date.now() + (Number(process.env.WILDFIRE_TIME_SKEW_MINUTES || 0) * 60_000)).toISOString(),
            'Content-Type': 'application/json'
        };
    }
    async fetchCommissions(params) {
        const base = process.env.WILDFIRE_API_BASE || 'https://api.wfi.re/v5';
        const limit = params.limit ?? Number(process.env.WILDFIRE_PAGE_LIMIT || 500);
        const url = new URL(`${base}/commission`);
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('start_modified_date', params.startModifiedIso);
        url.searchParams.set('end_modified_date', params.endModifiedIso);
        url.searchParams.set('sort_by', params.sortBy || 'modified_date');
        url.searchParams.set('sort_order', params.sortOrder || 'asc');
        if (params.nextCursor)
            url.searchParams.set('cursor', params.nextCursor);
        const resp = await firstValueFrom(this.http.get(url.toString(), { headers: this.buildHeaders() }));
        return resp.data;
    }
    computeCashback(commission) {
        const deviceSplits = (commission.Amounts || []).filter(a => (a.SplitPart || '').toUpperCase() === 'DEVICE');
        if (deviceSplits.length === 0)
            return { amount: null, currency: null };
        const currency = deviceSplits[0].Currency || null;
        const amount = deviceSplits.reduce((sum, a) => sum + Number(a.Amount || 0), 0);
        return { amount, currency };
    }
};
WildfireService = WildfireService_1 = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [HttpService])
], WildfireService);
export { WildfireService };
