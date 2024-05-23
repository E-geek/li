import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1716067033782 implements MigrationInterface {
  name = 'Init1716067033782';

  public async up(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "vacancy" ("vid" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "meta" jsonb, "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_0e3adc8c5c4b23c6a33bdfd9a8f" PRIMARY KEY ("vid"))`,
    );
  }

  public async down(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`DROP TABLE "vacancy"`);
  }
}
