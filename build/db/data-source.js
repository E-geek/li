"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppDataSource = void 0;
require("reflect-metadata");
var typeorm_1 = require("typeorm");
exports.AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'evro',
    password: 'evro',
    database: 'li',
    synchronize: true,
    logging: true,
    entities: [Vacancy_1.Vacancy],
    migrations: [_1716067033782_init_1.Init1716067033782, _1716075482445_step2_1.Step21716075482445],
    subscribers: [],
});
//# sourceMappingURL=data-source.js.map