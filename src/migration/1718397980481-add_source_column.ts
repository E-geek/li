import {MigrationInterface, QueryRunner} from "typeorm";
import {JsonMap} from "@/interfaces/json";

export class AddSourceColumn1718397980481 implements MigrationInterface {
  name = 'AddSourceColumn1718397980481'

  public async up(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`ALTER TABLE "job" ADD "source" character varying(256)`);
    const rows :{ lid :number; meta :JsonMap | null }[] = await queryRunner.query(`select v.lid, v.meta
      from vacancy v
      join job j on j.lid = v.lid
      where j."createdDate" > now() - INTERVAL '1 month';`);
    const awaiter :Promise<unknown>[] = [];
    for (const row of rows) {
      if (row.meta == null) {
        continue;
      }
      let meta :Record<string, any>;
      if (typeof row.meta === 'string') {
        meta = JSON.parse(row.meta) as Record<string, any>;
      } else {
        meta = row.meta;
      }
      const source = meta.source?.sourceDomain;
      if (!source) {
        continue;
      }
      awaiter.push(queryRunner.query(`UPDATE "job" SET "source" = $1 WHERE "lid" = $2`, [
        source,
        row.lid,
      ]))
    }
    await Promise.all(awaiter);
  }

  public async down(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "source"`);
  }

}
