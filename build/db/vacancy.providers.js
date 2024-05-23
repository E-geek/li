"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vacancyProviders = void 0;
exports.vacancyProviders = [
    {
        provide: 'VACANCY_REPOSITORY',
        useFactory: function (dataSource) { return dataSource.getRepository(Vacancy_1.Vacancy); },
        inject: ['DATA_SOURCE'],
    },
];
//# sourceMappingURL=vacancy.providers.js.map