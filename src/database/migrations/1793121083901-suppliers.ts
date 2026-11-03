import { MigrationInterface, QueryRunner } from "typeorm";

export class Suppliers1793121083901 implements MigrationInterface {
    name = 'Suppliers1793121083901'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "suppliers" ("id" SERIAL NOT NULL, "name" character varying(150) NOT NULL, "supplier_shop_name" character varying(150), "workshop_id" integer NOT NULL, "phone" character varying(30), "address" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b70ac51766a9e3144f778cfe81e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5593f5c1a2b914458c0a46460e" ON "suppliers" ("workshop_id") `);
        await queryRunner.query(`ALTER TABLE "suppliers" ADD CONSTRAINT "FK_5593f5c1a2b914458c0a46460ee" FOREIGN KEY ("workshop_id") REFERENCES "workshops"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "suppliers" DROP CONSTRAINT "FK_5593f5c1a2b914458c0a46460ee"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5593f5c1a2b914458c0a46460e"`);
        await queryRunner.query(`DROP TABLE "suppliers"`);
    }

}
