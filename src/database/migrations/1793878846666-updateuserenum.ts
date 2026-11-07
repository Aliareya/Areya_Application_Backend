import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updateuserenum1793878846666
  implements MigrationInterface
{
  name = 'Updateuserenum1793878846666';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."users_system_role_enum"
      ADD VALUE IF NOT EXISTS 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL does not support directly removing enum values.
  }
}