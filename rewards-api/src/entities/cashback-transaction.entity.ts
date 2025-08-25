import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'cashback_transactions' })
export class CashbackTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'bigint' })
  wildfire_commission_id!: string;

  @Column({ type: 'bigint', nullable: true })
  device_id!: string | null;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  user_id!: string | null;

  @Column({ type: 'text', default: 'PENDING' })
  status!: string;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  sale_amount!: string | null;

  @Column({ type: 'text', nullable: true })
  sale_currency!: string | null;

  @Column({ type: 'numeric', precision: 18, scale: 6, nullable: true })
  cashback_amount!: string | null;

  @Column({ type: 'text', nullable: true })
  cashback_currency!: string | null;

  @Column({ type: 'text', nullable: true })
  tracking_code!: string | null;

  @Column({ type: 'text', nullable: true })
  merchant_order_id!: string | null;

  @Column({ type: 'timestamptz', nullable: true })
  event_date!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  locking_date!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  commission_created_date!: Date | null;

  @Column({ type: 'timestamptz', nullable: true })
  commission_modified_date!: Date | null;

  @Column({ type: 'text', nullable: true })
  preferred_coin!: string | null;

  @Column({ type: 'text', nullable: true })
  wallet_address!: string | null;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at!: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}

