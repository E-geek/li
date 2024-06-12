import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJobStatus1718213144759 implements MigrationInterface {
    name = 'AddJobStatus1718213144759'

    public async up(queryRunner :QueryRunner) :Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" ADD "status" int2 NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner :QueryRunner) :Promise<void> {
        await queryRunner.query(`ALTER TABLE "job" DROP COLUMN "status"`);
    }

}
