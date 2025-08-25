var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
let CashbackTransaction = class CashbackTransaction {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], CashbackTransaction.prototype, "id", void 0);
__decorate([
    Index({ unique: true }),
    Column({ type: 'bigint' }),
    __metadata("design:type", String)
], CashbackTransaction.prototype, "wildfire_commission_id", void 0);
__decorate([
    Column({ type: 'bigint', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "device_id", void 0);
__decorate([
    Index(),
    Column({ type: 'uuid', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "user_id", void 0);
__decorate([
    Column({ type: 'text', default: 'PENDING' }),
    __metadata("design:type", String)
], CashbackTransaction.prototype, "status", void 0);
__decorate([
    Column({ type: 'numeric', precision: 18, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "sale_amount", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "sale_currency", void 0);
__decorate([
    Column({ type: 'numeric', precision: 18, scale: 6, nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "cashback_amount", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "cashback_currency", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "tracking_code", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "merchant_order_id", void 0);
__decorate([
    Column({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "event_date", void 0);
__decorate([
    Column({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "locking_date", void 0);
__decorate([
    Column({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "commission_created_date", void 0);
__decorate([
    Column({ type: 'timestamptz', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "commission_modified_date", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "preferred_coin", void 0);
__decorate([
    Column({ type: 'text', nullable: true }),
    __metadata("design:type", Object)
], CashbackTransaction.prototype, "wallet_address", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CashbackTransaction.prototype, "created_at", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamptz' }),
    __metadata("design:type", Date)
], CashbackTransaction.prototype, "updated_at", void 0);
CashbackTransaction = __decorate([
    Entity({ name: 'cashback_transactions' })
], CashbackTransaction);
export { CashbackTransaction };
