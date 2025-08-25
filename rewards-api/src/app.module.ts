import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { CashbackTransaction } from './entities/cashback-transaction.entity.js';
import { UserProfile } from './entities/user-profile.entity.js';
import { SyncState } from './entities/sync-state.entity.js';
import { WildfireModule } from './wildfire/wildfire.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    HttpModule.register({ timeout: 15000 }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'postgres',
        url: process.env.DATABASE_URL,
        autoLoadEntities: true,
        synchronize: false
      })
    }),
    TypeOrmModule.forFeature([CashbackTransaction, UserProfile, SyncState]),
    WildfireModule
  ]
})
export class AppModule {}

