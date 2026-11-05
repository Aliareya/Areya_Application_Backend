
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1793864006660
  implements MigrationInterface
{
  name = 'InitialSchema1793864006660';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==========================================
    // 1. Create ENUM Types
    // ==========================================

    await queryRunner.query(`
      CREATE TYPE "public"."stores_status_enum"
      AS ENUM ('active', 'inactive')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."shops_status_enum"
      AS ENUM ('active', 'inactive')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."users_system_role_enum"
      AS ENUM ('super_admin', 'owner', 'employee')
    `);

    // ==========================================
    // 2. Create USERS Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" BIGSERIAL NOT NULL,
        "full_name" VARCHAR(150) NOT NULL,
        "phone" VARCHAR(20) NOT NULL,
        "email" VARCHAR(150),
        "password" VARCHAR(255) NOT NULL,

        "system_role" "public"."users_system_role_enum"
          NOT NULL DEFAULT 'employee',

        "shop_id" BIGINT,

        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "avatar" VARCHAR(255),
        "last_login_at" TIMESTAMP WITH TIME ZONE,

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        "updated_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "UQ_users_phone"
          UNIQUE ("phone"),

        CONSTRAINT "UQ_users_email"
          UNIQUE ("email"),

        CONSTRAINT "uq_users_id_shop"
          UNIQUE ("id", "shop_id"),

        CONSTRAINT "chk_user_system_role_shop"
          CHECK (
            (
              "system_role" = 'employee'
              AND "shop_id" IS NOT NULL
            )
            OR
            (
              "system_role" IN ('owner', 'super_admin')
              AND "shop_id" IS NULL
            )
          ),

        CONSTRAINT "PK_users"
          PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // 3. Create STORES Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "stores" (
        "id" BIGSERIAL NOT NULL,
        "owner_id" BIGINT NOT NULL,

        "name" VARCHAR(150) NOT NULL,
        "phone" VARCHAR(20),
        "address" TEXT,
        "logo" VARCHAR(255),

        "status" "public"."stores_status_enum"
          NOT NULL DEFAULT 'inactive',

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        "updated_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "UQ_stores_owner"
          UNIQUE ("owner_id"),

        CONSTRAINT "PK_stores"
          PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // 4. Create SHOPS Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "shops" (
        "id" BIGSERIAL NOT NULL,
        "store_id" BIGINT NOT NULL,

        "name" VARCHAR(150) NOT NULL,
        "phone" VARCHAR(20),
        "address" TEXT,
        "logo" VARCHAR(255),

        "status" "public"."shops_status_enum"
          NOT NULL DEFAULT 'inactive',

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        "updated_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "uq_shops_store_name"
          UNIQUE ("store_id", "name"),

        CONSTRAINT "PK_shops"
          PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // 5. Create PERMISSIONS Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "permissions" (
        "id" BIGSERIAL NOT NULL,

        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(150) NOT NULL,
        "description" TEXT,

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "UQ_permissions_slug"
          UNIQUE ("slug"),

        CONSTRAINT "PK_permissions"
          PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // 6. Create ROLES Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "roles" (
        "id" BIGSERIAL NOT NULL,
        "shop_id" BIGINT NOT NULL,

        "name" VARCHAR(100) NOT NULL,
        "slug" VARCHAR(100) NOT NULL,
        "description" TEXT,

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "uq_roles_id_shop"
          UNIQUE ("id", "shop_id"),

        CONSTRAINT "uq_roles_shop_slug"
          UNIQUE ("shop_id", "slug"),

        CONSTRAINT "PK_roles"
          PRIMARY KEY ("id")
      )
    `);

    // ==========================================
    // 7. Create ROLE_PERMISSIONS Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "role_permissions" (
        "role_id" BIGINT NOT NULL,
        "permission_id" BIGINT NOT NULL,

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "PK_role_permissions"
          PRIMARY KEY ("role_id", "permission_id")
      )
    `);

    // ==========================================
    // 8. Create USER_ROLES Table
    // ==========================================

    await queryRunner.query(`
      CREATE TABLE "user_roles" (
        "user_id" BIGINT NOT NULL,
        "role_id" BIGINT NOT NULL,
        "shop_id" BIGINT NOT NULL,

        "created_at" TIMESTAMP WITH TIME ZONE
          NOT NULL DEFAULT now(),

        CONSTRAINT "PK_user_roles"
          PRIMARY KEY ("user_id")
      )
    `);

    // ==========================================
    // 9. Add Foreign Keys
    // ==========================================

    // Stores -> Users (Owner)
    await queryRunner.query(`
      ALTER TABLE "stores"
      ADD CONSTRAINT "FK_stores_owner"
      FOREIGN KEY ("owner_id")
      REFERENCES "users" ("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    // Shops -> Stores
    await queryRunner.query(`
      ALTER TABLE "shops"
      ADD CONSTRAINT "FK_shops_store"
      FOREIGN KEY ("store_id")
      REFERENCES "stores" ("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    // Roles -> Shops
    await queryRunner.query(`
      ALTER TABLE "roles"
      ADD CONSTRAINT "FK_roles_shop"
      FOREIGN KEY ("shop_id")
      REFERENCES "shops" ("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    // Role Permissions -> Roles
    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "FK_role_permissions_role"
      FOREIGN KEY ("role_id")
      REFERENCES "roles" ("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Role Permissions -> Permissions
    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      ADD CONSTRAINT "FK_role_permissions_permission"
      FOREIGN KEY ("permission_id")
      REFERENCES "permissions" ("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Users -> Shops
    await queryRunner.query(`
      ALTER TABLE "users"
      ADD CONSTRAINT "FK_users_shop"
      FOREIGN KEY ("shop_id")
      REFERENCES "shops" ("id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);

    // ==========================================
    // 10. Composite Foreign Keys
    // ==========================================

    // User and UserRole must belong to the same Shop
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD CONSTRAINT "fk_user_roles_user_shop"
      FOREIGN KEY ("user_id", "shop_id")
      REFERENCES "users" ("id", "shop_id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    // Role and UserRole must belong to the same Shop
    await queryRunner.query(`
      ALTER TABLE "user_roles"
      ADD CONSTRAINT "fk_user_roles_role_shop"
      FOREIGN KEY ("role_id", "shop_id")
      REFERENCES "roles" ("id", "shop_id")
      ON DELETE RESTRICT
      ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // ==========================================
    // 1. Drop Composite Foreign Keys
    // ==========================================

    await queryRunner.query(`
      ALTER TABLE "user_roles"
      DROP CONSTRAINT "fk_user_roles_role_shop"
    `);

    await queryRunner.query(`
      ALTER TABLE "user_roles"
      DROP CONSTRAINT "fk_user_roles_user_shop"
    `);

    // ==========================================
    // 2. Drop Other Foreign Keys
    // ==========================================

    await queryRunner.query(`
      ALTER TABLE "users"
      DROP CONSTRAINT "FK_users_shop"
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      DROP CONSTRAINT "FK_role_permissions_permission"
    `);

    await queryRunner.query(`
      ALTER TABLE "role_permissions"
      DROP CONSTRAINT "FK_role_permissions_role"
    `);

    await queryRunner.query(`
      ALTER TABLE "roles"
      DROP CONSTRAINT "FK_roles_shop"
    `);

    await queryRunner.query(`
      ALTER TABLE "shops"
      DROP CONSTRAINT "FK_shops_store"
    `);

    await queryRunner.query(`
      ALTER TABLE "stores"
      DROP CONSTRAINT "FK_stores_owner"
    `);

    // ==========================================
    // 3. Drop Tables
    // ==========================================

    await queryRunner.query(`DROP TABLE "user_roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP TABLE "shops"`);
    await queryRunner.query(`DROP TABLE "stores"`);

    // ==========================================
    // 4. Drop ENUM Types
    // ==========================================

    await queryRunner.query(`
      DROP TYPE "public"."users_system_role_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."shops_status_enum"
    `);

    await queryRunner.query(`
      DROP TYPE "public"."stores_status_enum"
    `);
  }
}
