import { MigrationInterface, QueryRunner } from "typeorm";

export class Syste1792428665590 implements MigrationInterface {
    name = 'Syste1792428665590'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workshops" ADD "owner_id" integer`);
        await queryRunner.query(`ALTER TYPE "public"."users_system_role_enum" RENAME TO "users_system_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_system_role_enum" AS ENUM('admin', 'customer', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" TYPE "public"."users_system_role_enum" USING "system_role"::"text"::"public"."users_system_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_system_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "workshops" ADD CONSTRAINT "FK_3e94341f90044e2494038b4e281" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "workshops" DROP CONSTRAINT "FK_3e94341f90044e2494038b4e281"`);
        await queryRunner.query(`CREATE TYPE "public"."users_system_role_enum_old" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" TYPE "public"."users_system_role_enum_old" USING "system_role"::"text"::"public"."users_system_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_system_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_system_role_enum_old" RENAME TO "users_system_role_enum"`);
        await queryRunner.query(`ALTER TABLE "workshops" DROP COLUMN "owner_id"`);
    }

}
