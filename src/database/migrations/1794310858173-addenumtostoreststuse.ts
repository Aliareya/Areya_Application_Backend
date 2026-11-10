
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addenumtostoreststuse1794310858173
  implements MigrationInterface
{
  name = 'Addenumtostoreststuse1794310858173';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."users_system_role_enum"
      ADD VALUE IF NOT EXISTS 'student' AFTER 'employee'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support removing enum values directly.
  }
}
