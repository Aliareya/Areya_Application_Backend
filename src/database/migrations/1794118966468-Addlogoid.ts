
import { MigrationInterface, QueryRunner } from 'typeorm';

export class Addlogoid1794118966468 implements MigrationInterface {
  name = 'Addlogoid1794118966468';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP CONSTRAINT "uq_shops_store_name"
    `);

    // Add nullable columns first.
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD "normalized_name" character varying(150)
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD "slug" character varying(180)
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD "logo_public_id" character varying(255)
    `);

    // Update existing records.
    await queryRunner.query(`
      UPDATE "shops"
      SET
        "normalized_name" = LOWER(
          REGEXP_REPLACE(BTRIM("name"), '\\s+', ' ', 'g')
        ),
        "slug" = 'shop-' || "id"::text
    `);

    // Make columns required.
    await queryRunner.query(`
      ALTER TABLE "shops"
      ALTER COLUMN "normalized_name" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ALTER COLUMN "slug" SET NOT NULL
    `);

    // Add unique constraints.
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD CONSTRAINT "uq_shops_store_slug"
      UNIQUE ("store_id", "slug")
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD CONSTRAINT "uq_shops_store_normalized_name"
      UNIQUE ("store_id", "normalized_name")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP CONSTRAINT "uq_shops_store_normalized_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP CONSTRAINT "uq_shops_store_slug"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN "logo_public_id"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN "slug"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP COLUMN "normalized_name"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD CONSTRAINT "uq_shops_store_name"
      UNIQUE ("store_id", "name")
    `);
  }
}
