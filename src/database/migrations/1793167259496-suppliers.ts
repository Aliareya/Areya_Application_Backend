import { MigrationInterface, QueryRunner } from "typeorm";

export class Suppliers1793167259496 implements MigrationInterface {
    name = 'Suppliers1793167259496'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" ALTER COLUMN "phone" SET NOT NULL`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_13e52162cba2dd65faf7c1ce31" ON "suppliers" ("workshop_id", "phone") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_13e52162cba2dd65faf7c1ce31"`);
        await queryRunner.query(`ALTER TABLE "suppliers" ALTER COLUMN "phone" DROP NOT NULL`);
    }

}
