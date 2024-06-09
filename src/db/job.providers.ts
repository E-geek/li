import { DataSource } from 'typeorm';
import { Job } from "@/entity/Job";

export const jobProviders = [
  {
    provide: 'JOB_REPOSITORY',
    useFactory: (dataSource :DataSource) => dataSource.getRepository(Job),
    inject: [ 'DATA_SOURCE' ],
  },
];
