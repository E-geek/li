import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Vacancy } from '@/entity/Vacancy';
import { Init1716067033782 } from '@/migration/1716067033782-init';
import { Step21716075482445 } from '@/migration/1716075482445-step2';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'evro',
  password: 'evro',
  database: 'li',
  synchronize: true,
  logging: true,
  entities: [ Vacancy ],
  migrations: [ Init1716067033782, Step21716075482445 ],
  subscribers: [],
});
