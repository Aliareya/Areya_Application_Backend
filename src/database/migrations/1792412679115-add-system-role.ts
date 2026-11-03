import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSystemRole1792412679115 implements MigrationInterface {
    name = 'AddSystemRole1792412679115'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "role" TO "system_role"`);
        await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_system_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_system_role_enum" RENAME TO "users_system_role_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."users_system_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" TYPE "public"."users_system_role_enum" USING "system_role"::"text"::"public"."users_system_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_system_role_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_system_role_enum_old" AS ENUM('admin', 'owner', 'manager', 'tailor', 'user')`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" TYPE "public"."users_system_role_enum_old" USING "system_role"::"text"::"public"."users_system_role_enum_old"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "system_role" SET DEFAULT 'user'`);
        await queryRunner.query(`DROP TYPE "public"."users_system_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_system_role_enum_old" RENAME TO "users_system_role_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."users_system_role_enum" RENAME TO "users_role_enum"`);
        await queryRunner.query(`ALTER TABLE "users" RENAME COLUMN "system_role" TO "role"`);
    }

}
