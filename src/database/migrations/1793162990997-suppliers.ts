import { MigrationInterface, QueryRunner } from "typeorm";

export class Suppliers1793162990997 implements MigrationInterface {
    name = 'Suppliers1793162990997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."suppliers_kind_enum" AS ENUM('fabric_seller', 'machine_seller', 'material_seller')`);
        await queryRunner.query(`ALTER TABLE "suppliers" ADD "kind" "public"."suppliers_kind_enum" NOT NULL`);
        await queryRunner.query(`CREATE TYPE "public"."suppliers_status_enum" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "suppliers" ADD "status" "public"."suppliers_status_enum" NOT NULL DEFAULT 'active'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."suppliers_status_enum"`);
        await queryRunner.query(`ALTER TABLE "suppliers" DROP COLUMN "kind"`);
        await queryRunner.query(`DROP TYPE "public"."suppliers_kind_enum"`);
    }

}
