import {MigrationInterface, QueryRunner} from "typeorm";

export class Such1717847993733 implements MigrationInterface {
  name = 'Such1717847993733'

  public async up(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`CREATE TABLE "job" ("jid" uuid NOT NULL DEFAULT uuid_generate_v4(), "lid" bigint, "applies" integer, "views" integer, "title" text NOT NULL, "description" text NOT NULL, "isEasyApply" boolean NOT NULL DEFAULT false, "expireAt" TIMESTAMP, "publishedAt" TIMESTAMP, "origPublishAt" TIMESTAMP, "meta" jsonb, "createdDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_515c5f5ac6a889464f96e0e5143" PRIMARY KEY ("jid")); COMMENT ON COLUMN "job"."title" IS 'lower case title for search'; COMMENT ON COLUMN "job"."description" IS 'lower case description for search'`);
    await queryRunner.query(`CREATE INDEX "IDX_26364cb3361c751d6597d58abc" ON "job" ("updatedDate") `);
    await queryRunner.query(`CREATE INDEX "IDX_c1844a907c9f6347667f1faff8" ON "job" ("publishedAt", "expireAt") `);
    await queryRunner.query(`CREATE INDEX "title_ftx_idx" ON "job" USING gin (to_tsvector('english'::regconfig, "title"))`);
    await queryRunner.query(`CREATE INDEX "title_ftx_idx_desc" ON "job" USING gin (to_tsvector('english'::regconfig, "description"))`);
    await queryRunner.query(`CREATE INDEX "IDX_ed1b60b5eb507ba9d947695489" ON "vacancy" USING btree ("updatedDate", "lid")`);
  }

  public async down(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_c1844a907c9f6347667f1faff8"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_26364cb3361c751d6597d58abc"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ed1b60b5eb507ba9d947695489"`);
    await queryRunner.query(`DROP INDEX "public"."title_ftx_idx"`);
    await queryRunner.query(`DROP INDEX "public"."title_ftx_idx_desc"`);
    await queryRunner.query(`DROP TABLE "job"`);
  }

}
