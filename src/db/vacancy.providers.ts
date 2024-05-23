import { DataSource } from 'typeorm';
import { Vacancy } from '@/entity/Vacancy';

export const vacancyProviders = [
  {
    provide: 'VACANCY_REPOSITORY',
    useFactory: (dataSource :DataSource) => dataSource.getRepository(Vacancy),
    inject: [ 'DATA_SOURCE' ],
  },
];
