
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSuppliers1795344600000 implements MigrationInterface {
  name = 'CreateSuppliers1795344600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create supplier category enum
    await queryRunner.query(`
      CREATE TYPE "public"."supplier_category_enum"
      AS ENUM ('fabric', 'kharjkar', 'other')
    `);

    // 2. Create suppliers table
    await queryRunner.query(`
      CREATE TABLE "suppliers" (
        "id" BIGSERIAL NOT NULL,
        "shop_id" BIGINT NOT NULL,
        "name" VARCHAR(150) NOT NULL,
        "code" VARCHAR(50) NOT NULL,
        "category" "public"."supplier_category_enum" NOT NULL,
        "phone" VARCHAR(30),
        "address" TEXT,
        "description" TEXT,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),

        CONSTRAINT "PK_suppliers"
          PRIMARY KEY ("id"),

        CONSTRAINT "UQ_suppliers_shop_code"
          UNIQUE ("shop_id", "code")
      )
    `);

    // 3. Create foreign key to shops
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      ADD CONSTRAINT "FK_suppliers_shop"
      FOREIGN KEY ("shop_id")
      REFERENCES "shops"("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Remove foreign key
    await queryRunner.query(`
      ALTER TABLE "suppliers"
      DROP CONSTRAINT "FK_suppliers_shop"
    `);

    // 2. Drop suppliers table
    await queryRunner.query(`
      DROP TABLE "suppliers"
    `);

    // 3. Drop enum
    await queryRunner.query(`
      DROP TYPE "public"."supplier_category_enum"
    `);
  }
}
