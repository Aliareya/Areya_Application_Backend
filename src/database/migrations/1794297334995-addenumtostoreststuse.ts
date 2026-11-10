import { MigrationInterface, QueryRunner } from "typeorm";

export class Addenumtostoreststuse1794297334995 implements MigrationInterface {
    name = 'Addenumtostoreststuse1794297334995'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."stores_status_enum" RENAME TO "stores_status_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."stores_status_enum" AS ENUM('active', 'inactive', 'pending')`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" TYPE "public"."stores_status_enum" USING "status"::"text"::"public"."stores_status_enum"`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'pending'`);
        await queryRunner.query(`DROP TYPE "public"."stores_status_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."stores_status_enum_old" AS ENUM('active', 'inactive')`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" TYPE "public"."stores_status_enum_old" USING "status"::"text"::"public"."stores_status_enum_old"`);
        await queryRunner.query(`ALTER TABLE "stores" ALTER COLUMN "status" SET DEFAULT 'inactive'`);
        await queryRunner.query(`DROP TYPE "public"."stores_status_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."stores_status_enum_old" RENAME TO "stores_status_enum"`);
    }

}
