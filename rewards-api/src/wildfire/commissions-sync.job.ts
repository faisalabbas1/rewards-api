import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WildfireService, WildfireCommission } from './wildfire.service.js';
import { CashbackTransaction } from '../entities/cashback-transaction.entity.js';
import { UserProfile } from '../entities/user-profile.entity.js';
import { SyncState } from '../entities/sync-state.entity.js';

@Injectable()
export class CommissionsSyncJob {
  private readonly logger = new Logger(CommissionsSyncJob.name);

  constructor(
    private readonly wildfire: WildfireService,
    @InjectRepository(CashbackTransaction) private readonly trxRepo: Repository<CashbackTransaction>,
    @InjectRepository(UserProfile) private readonly userRepo: Repository<UserProfile>,
    @InjectRepository(SyncState) private readonly syncRepo: Repository<SyncState>
  ) {}

  @Cron(CronExpression.EVERY_10_MINUTES, { name: 'wildfire.commissions' })
  async handleCron() {
    await this.runOnce();
  }

  async runOnce(now = new Date()): Promise<void> {
    const stateKey = 'wildfire.commissions';
    const lookbackMinutes = Number(process.env.WILDFIRE_SYNC_LOOKBACK_MINUTES || 1440);
    const endIso = now.toISOString();

    const existingState = await this.syncRepo.findOne({ where: { key: stateKey } });
    const startIso = existingState?.value?.last_modified_iso
      || new Date(now.getTime() - lookbackMinutes * 60_000).toISOString();
    let nextCursor: string | null = existingState?.value?.next_cursor || null;

    let total = 0;
    let created = 0;
    let updated = 0;
    let maxModifiedIsoProcessed = startIso;

    do {
      const page = await this.wildfire.fetchCommissions({
        startModifiedIso: startIso,
        endModifiedIso: endIso,
        nextCursor
      });

      for (const c of page.Commissions) {
        const { createdOne, updatedOne, modifiedIso } = await this.upsertCommission(c);
        created += createdOne ? 1 : 0;
        updated += updatedOne ? 1 : 0;
        total += 1;
        if (modifiedIso && modifiedIso > maxModifiedIsoProcessed) {
          maxModifiedIsoProcessed = modifiedIso;
        }
      }

      nextCursor = page.NextCursor;
      await this.syncRepo.save({
        key: stateKey,
        value: { last_modified_iso: maxModifiedIsoProcessed, next_cursor: nextCursor ?? null }
      });
    } while (nextCursor);

    this.logger.log(`Wildfire sync completed: total=${total} created=${created} updated=${updated} window=[${startIso}..${endIso}]`);
  }

  private mapStatus(status: string): string {
    const s = (status || '').toUpperCase();
    if (s === 'LOCKED' || s === 'APPROVED' || s === 'PAID') return 'COMPLETED';
    if (s === 'DECLINED' || s === 'REJECTED') return 'DECLINED';
    return 'PENDING';
  }

  private async upsertCommission(c: WildfireCommission): Promise<{ createdOne: boolean; updatedOne: boolean; modifiedIso: string | null }> {
    const wildfireId = String(c.CommissionID);
    const deviceId = c.DeviceID != null ? String(c.DeviceID) : null;
    const saleAmount = c.SaleAmount?.Amount ? Number(c.SaleAmount.Amount) : null;
    const saleCurrency = c.SaleAmount?.Currency || null;
    const { amount: cashbackAmount, currency: cashbackCurrency } = this.wildfire.computeCashback(c);
    const mappedStatus = this.mapStatus(c.Status);
    const userProfile = deviceId ? await this.userRepo.findOne({ where: { wildfire_device_id: deviceId } }) : null;

    const existing = await this.trxRepo.findOne({ where: { wildfire_commission_id: wildfireId } });

    if (!existing) {
      await this.trxRepo.save({
        wildfire_commission_id: wildfireId,
        device_id: deviceId,
        user_id: userProfile?.id || null,
        status: mappedStatus,
        sale_amount: saleAmount != null ? String(saleAmount) : null,
        sale_currency: saleCurrency,
        cashback_amount: cashbackAmount != null ? String(cashbackAmount) : null,
        cashback_currency: cashbackCurrency,
        tracking_code: c.TrackingCode || null,
        merchant_order_id: c.MerchantOrderID || null,
        event_date: c.EventDate ? new Date(c.EventDate) : null,
        locking_date: c.LockingDate ? new Date(c.LockingDate) : null,
        commission_created_date: c.CreatedDate ? new Date(c.CreatedDate) : null,
        commission_modified_date: c.ModifiedDate ? new Date(c.ModifiedDate) : null,
        preferred_coin: userProfile?.preferred_coin || null,
        wallet_address: userProfile?.wallet_address || null
      });
      return { createdOne: true, updatedOne: false, modifiedIso: c.ModifiedDate || null };
    }

    const nextStatus = mappedStatus;
    const hasChange =
      existing.status !== nextStatus ||
      existing.cashback_amount !== (cashbackAmount != null ? String(cashbackAmount) : null) ||
      existing.sale_amount !== (saleAmount != null ? String(saleAmount) : null) ||
      existing.commission_modified_date?.toISOString() !== (c.ModifiedDate || null);

    if (hasChange) {
      existing.status = nextStatus;
      existing.sale_amount = saleAmount != null ? String(saleAmount) : null;
      existing.sale_currency = saleCurrency;
      existing.cashback_amount = cashbackAmount != null ? String(cashbackAmount) : null;
      existing.cashback_currency = cashbackCurrency;
      existing.tracking_code = c.TrackingCode || null;
      existing.merchant_order_id = c.MerchantOrderID || null;
      existing.event_date = c.EventDate ? new Date(c.EventDate) : null;
      existing.locking_date = c.LockingDate ? new Date(c.LockingDate) : null;
      existing.commission_created_date = c.CreatedDate ? new Date(c.CreatedDate) : null;
      existing.commission_modified_date = c.ModifiedDate ? new Date(c.ModifiedDate) : null;

      if (!existing.user_id && userProfile?.id) {
        existing.user_id = userProfile.id;
        existing.preferred_coin = userProfile.preferred_coin || existing.preferred_coin;
        existing.wallet_address = userProfile.wallet_address || existing.wallet_address;
      }

      await this.trxRepo.save(existing);
      return { createdOne: false, updatedOne: true, modifiedIso: c.ModifiedDate || null };
    }

    return { createdOne: false, updatedOne: false, modifiedIso: c.ModifiedDate || null };
  }
}

