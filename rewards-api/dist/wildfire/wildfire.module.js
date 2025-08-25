var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CashbackTransaction } from '../entities/cashback-transaction.entity.js';
import { UserProfile } from '../entities/user-profile.entity.js';
import { SyncState } from '../entities/sync-state.entity.js';
import { WildfireService } from './wildfire.service.js';
import { CommissionsSyncJob } from './commissions-sync.job.js';
let WildfireModule = class WildfireModule {
};
WildfireModule = __decorate([
    Module({
        imports: [HttpModule, TypeOrmModule.forFeature([CashbackTransaction, UserProfile, SyncState])],
        providers: [WildfireService, CommissionsSyncJob]
    })
], WildfireModule);
export { WildfireModule };
