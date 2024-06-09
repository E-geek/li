import 'reflect-metadata';
import { DataSource } from 'typeorm';
export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'evro',
  password: 'evro',
  database: 'li',
  synchronize: false,
  logging: true,
  entities: [
    `${__dirname}/../entity/*.ts`,
    `${__dirname}/../entity/*.js`,
  ],
  migrations: [
    `${__dirname}/../migration/*.ts`,
    `${__dirname}/../migration/*.js`,
  ],
  subscribers: [
    `${__dirname}/../subscribers/*.ts`,
    `${__dirname}/../subscribers/*.js`,
  ],
});
