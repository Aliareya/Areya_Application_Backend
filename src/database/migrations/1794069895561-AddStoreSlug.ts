import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreSlug1794069895561 implements MigrationInterface {
    name = 'AddStoreSlug1794069895561'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "slug" character varying(180) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "stores" ADD CONSTRAINT "UQ_790b2968701a6ff5ff383237765" UNIQUE ("slug")`);
        await queryRunner.query(`CREATE TYPE "public"."stores_creation_status_enum" AS ENUM('pending', 'approved', 'rejected')`);
        await queryRunner.query(`ALTER TABLE "stores" ADD "creation_status" "public"."stores_creation_status_enum" NOT NULL DEFAULT 'pending'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "creation_status"`);
        await queryRunner.query(`DROP TYPE "public"."stores_creation_status_enum"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP CONSTRAINT "UQ_790b2968701a6ff5ff383237765"`);
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "slug"`);
    }

}
