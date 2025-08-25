import { Column, Entity, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity({ name: 'sync_state' })
export class SyncState {
  @PrimaryColumn({ type: 'text' })
  key!: string;

  @Column({ type: 'jsonb' })
  value!: Record<string, any>;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at!: Date;
}

