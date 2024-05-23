"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppService = void 0;
var common_1 = require("@nestjs/common");
var typeorm_1 = require("typeorm");
var AppService = /** @class */ (function () {
    function AppService(vacancyRepository) {
        this.vacancyRepository = vacancyRepository;
    }
    AppService.prototype.getHello = function () {
        return 'Hello World!';
    };
    AppService.prototype.listVacancies = function (param) {
        var _a, _b, _c;
        return __awaiter(this, void 0, void 0, function () {
            var start, length, query, order, dir, list, output;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        start = (_a = param.start) !== null && _a !== void 0 ? _a : 0;
                        length = ((_b = param.end) !== null && _b !== void 0 ? _b : 50) - start;
                        if (length < 0) {
                            return [2 /*return*/, null];
                        }
                        query = this
                            .vacancyRepository
                            .manager
                            .createQueryBuilder()
                            .select('*')
                            .from(function (subQuery) {
                            return subQuery
                                .select('*')
                                .addSelect('ROW_NUMBER() OVER (PARTITION BY lid ORDER BY "createdDate")', 'rn')
                                .from('vacancy', 'vacancy');
                        }, 'uv')
                            .where('rn = 1')
                            .take(length)
                            .offset(start);
                        if (param.search) {
                            query.andWhere('(title ILIKE :search OR description ILIKE :search)', { search: "%".concat(param.search, "%") });
                        }
                        if (param.order) {
                            order = null;
                            switch (param.order) {
                                case 'date':
                                    order = '`updatedDate`';
                                    break;
                                case 'applies':
                                    order = "`meta`->'source'->'applies'";
                                    break;
                                case 'lid':
                                    order = '`lid`';
                                    break;
                            }
                            if (order) {
                                dir = ((_c = param.sortDirection) !== null && _c !== void 0 ? _c : 'asc').toUpperCase();
                                query.addOrderBy(order, dir, 'NULLS LAST');
                            }
                        }
                        return [4 /*yield*/, query.getRawMany()];
                    case 1:
                        list = _d.sent();
                        output = list.map(function (v) {
                            var _a, _b, _c;
                            return {
                                vid: v.vid,
                                title: v.title,
                                lid: v.lid,
                                applies: (_c = (_b = (_a = v.meta) === null || _a === void 0 ? void 0 : _a.source) === null || _b === void 0 ? void 0 : _b.applies) !== null && _c !== void 0 ? _c : -1,
                            };
                        });
                        return [2 /*return*/, { data: output }];
                }
            });
        });
    };
    AppService.prototype.addVacancy = function (data) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var vacancy, link, m;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        vacancy = new Vacancy_1.Vacancy();
                        vacancy.title = data.title;
                        vacancy.description = data.description.text;
                        link = (_a = data.jobPostingUrl) !== null && _a !== void 0 ? _a : null;
                        if (link) {
                            m = link.match(/jobs\/view\/(\d+)\//);
                            if (m) {
                                vacancy.lid = parseInt(m[1], 10);
                            }
                        }
                        vacancy.meta = {
                            source: data,
                            link: link,
                            applies: data.applies,
                        };
                        return [4 /*yield*/, this.vacancyRepository.insert(vacancy)];
                    case 1:
                        _b.sent();
                        return [2 /*return*/, vacancy.vid];
                }
            });
        });
    };
    AppService.prototype.fixVacancy = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var allBroken, transaction, _i, allBroken_1, v, link, m;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.vacancyRepository.find({
                            where: {
                                lid: (0, typeorm_1.IsNull)(),
                            },
                        })];
                    case 1:
                        allBroken = _b.sent();
                        transaction = [];
                        for (_i = 0, allBroken_1 = allBroken; _i < allBroken_1.length; _i++) {
                            v = allBroken_1[_i];
                            link = (_a = v.meta) === null || _a === void 0 ? void 0 : _a.link;
                            if (link) {
                                m = link.match(/jobs\/view\/(\d+)\//);
                                if (m) {
                                    v.lid = parseInt(m[1], 10);
                                    transaction.push(this.vacancyRepository.save(v));
                                }
                            }
                        }
                        return [4 /*yield*/, Promise.all(transaction)];
                    case 2:
                        _b.sent();
                        return [2 /*return*/, { status: 'ok', fixed: allBroken.length }];
                }
            });
        });
    };
    AppService = __decorate([
        (0, common_1.Injectable)(),
        __param(0, (0, common_1.Inject)('VACANCY_REPOSITORY')),
        __metadata("design:paramtypes", [typeorm_1.Repository])
    ], AppService);
    return AppService;
}());
exports.AppService = AppService;
//# sourceMappingURL=app.service.js.map