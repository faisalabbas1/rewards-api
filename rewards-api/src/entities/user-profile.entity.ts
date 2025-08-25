import { Column, Entity, Index, PrimaryColumn } from 'typeorm';

@Entity({ name: 'user_profiles' })
export class UserProfile {
  @PrimaryColumn({ type: 'uuid' })
  id!: string;

  @Index({ unique: true })
  @Column({ type: 'bigint', nullable: true })
  wildfire_device_id!: string | null;

  @Column({ type: 'text', nullable: true })
  preferred_coin!: string | null;

  @Column({ type: 'text', nullable: true })
  wallet_address!: string | null;
}

