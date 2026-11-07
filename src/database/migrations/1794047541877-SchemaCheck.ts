import { MigrationInterface, QueryRunner } from "typeorm";

export class SchemaCheck1794047541877 implements MigrationInterface {
    name = 'SchemaCheck1794047541877'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "revoked_tokens" ("id" BIGSERIAL NOT NULL, "tokenHash" character varying(64) NOT NULL, "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5c2b3ed5a8f0e4972e358985038" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_revoked_tokens_token_hash" ON "revoked_tokens" ("tokenHash") `);
        await queryRunner.query(`CREATE INDEX "IDX_revoked_tokens_expires_at" ON "revoked_tokens" ("expiresAt") `);
        await queryRunner.query(`CREATE INDEX "IDX_user_roles_role_shop" ON "user_roles" ("role_id", "shop_id") `);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "uq_shops_id_store" UNIQUE ("id", "store_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT "uq_shops_id_store"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_user_roles_role_shop"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_revoked_tokens_expires_at"`);
        await queryRunner.query(`DROP INDEX "public"."UQ_revoked_tokens_token_hash"`);
        await queryRunner.query(`DROP TABLE "revoked_tokens"`);
    }

}
