import { MigrationInterface, QueryRunner } from 'typeorm';

export class Updateuserscheck1793879067004
  implements MigrationInterface
{
  name = 'Updateuserscheck1793879067004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove old check constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "chk_user_system_role_shop"
    `);

    // 2. Create updated check constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "chk_user_system_role_shop"
      CHECK (
        (
          "system_role" = 'employee'
          AND "shop_id" IS NOT NULL
        )
        OR
        (
          "system_role" IN ('user', 'owner', 'super_admin')
          AND "shop_id" IS NULL
        )
      )
    `);

    // 3. Change default system role
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "system_role"
      SET DEFAULT 'user'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove updated check constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "chk_user_system_role_shop"
    `);

    // 2. Restore old check constraint
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "chk_user_system_role_shop"
      CHECK (
        (
          "system_role" = 'employee'
          AND "shop_id" IS NOT NULL
        )
        OR
        (
          "system_role" IN ('owner', 'super_admin')
          AND "shop_id" IS NULL
        )
      )
    `);

    // 3. Restore old default
    await queryRunner.query(`
      ALTER TABLE "users"
      ALTER COLUMN "system_role"
      SET DEFAULT 'employee'
    `);
  }
}