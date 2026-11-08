import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('revoked_tokens')
export class RevokedToken {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id!: string;

  @Index('UQ_revoked_tokens_token_hash', { unique: true })
  @Column({ type: 'varchar', length: 64 })
  tokenHash!: string;

  @Index('IDX_revoked_tokens_expires_at')
  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date;
}