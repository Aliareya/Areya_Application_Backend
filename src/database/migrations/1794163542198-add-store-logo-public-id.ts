import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStoreLogoPublicId1794163542198 implements MigrationInterface {
    name = 'AddStoreLogoPublicId1794163542198'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" ADD "logo_public_id" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "stores" DROP COLUMN "logo_public_id"`);
    }

}
