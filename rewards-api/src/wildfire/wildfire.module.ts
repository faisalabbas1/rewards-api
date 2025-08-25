import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CashbackTransaction } from '../entities/cashback-transaction.entity.js';
import { UserProfile } from '../entities/user-profile.entity.js';
import { SyncState } from '../entities/sync-state.entity.js';
import { WildfireService } from './wildfire.service.js';
import { CommissionsSyncJob } from './commissions-sync.job.js';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([CashbackTransaction, UserProfile, SyncState])],
  providers: [WildfireService, CommissionsSyncJob]
})
export class WildfireModule {}

