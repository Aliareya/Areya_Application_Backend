import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createHash } from 'crypto';

import { RevokedToken } from './entities/revoked-token.entity';

@Injectable()
export class RevokedTokensService {
  constructor(
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
  ) {}

  // Hash JWT
  private hashToken(token: string): string {
    return createHash('sha256')
      .update(token)
      .digest('hex');
  }

  // Revoke JWT
  async revoke(token: string, expiresAt: Date): Promise<void> {
    const tokenHash = this.hashToken(token);

    await this.revokedTokenRepository.upsert(
      {
        tokenHash,
        expiresAt,
      },
      ['tokenHash'],
    );
  }

  // Check whether JWT is revoked
  async isRevoked(token: string): Promise<boolean> {
    const tokenHash = this.hashToken(token);

    const revokedToken = await this.revokedTokenRepository.findOne({
      where: {
        tokenHash,
      },
      select: {
        id: true,
      },
    });

    return !!revokedToken;
  }
}