import { Repository } from 'typeorm';
import { WildfireService } from './wildfire.service.js';
import { CashbackTransaction } from '../entities/cashback-transaction.entity.js';
import { UserProfile } from '../entities/user-profile.entity.js';
import { SyncState } from '../entities/sync-state.entity.js';
export declare class CommissionsSyncJob {
    private readonly wildfire;
    private readonly trxRepo;
    private readonly userRepo;
    private readonly syncRepo;
    private readonly logger;
    constructor(wildfire: WildfireService, trxRepo: Repository<CashbackTransaction>, userRepo: Repository<UserProfile>, syncRepo: Repository<SyncState>);
    handleCron(): Promise<void>;
    runOnce(now?: Date): Promise<void>;
    private mapStatus;
    private upsertCommission;
}
