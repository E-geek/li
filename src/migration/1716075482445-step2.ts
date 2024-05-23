import { MigrationInterface, QueryRunner } from 'typeorm';

export class Step21716075482445 implements MigrationInterface {
  name = 'Step21716075482445';

  public async up(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancy" ADD "lid" int8`);
  }

  public async down(queryRunner :QueryRunner) :Promise<void> {
    await queryRunner.query(`ALTER TABLE "vacancy" DROP COLUMN "lid"`);
  }
}
