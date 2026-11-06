import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCategories1762400000000 implements MigrationInterface {
  name = 'CreateCategories1762400000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" varchar(50) NOT NULL,
        "color" varchar(7) NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_categories_name" UNIQUE ("name"),
        CONSTRAINT "CHK_categories_color" CHECK ("color" IN (
          '#e5534b', '#f0883e', '#d4a72c', '#57ab5a',
          '#39c5cf', '#539bf5', '#986ee2', '#768390'
        ))
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "tasks"
        ADD COLUMN "categoryId" integer,
        ADD CONSTRAINT "FK_tasks_categoryId" FOREIGN KEY ("categoryId")
          REFERENCES "categories" ("id") ON DELETE SET NULL
    `);
    await queryRunner.query(
      `CREATE INDEX "IDX_tasks_categoryId" ON "tasks" ("categoryId")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_tasks_categoryId"`);
    await queryRunner.query(
      `ALTER TABLE "tasks" DROP CONSTRAINT "FK_tasks_categoryId", DROP COLUMN "categoryId"`,
    );
    await queryRunner.query(`DROP TABLE "categories"`);
  }
}
