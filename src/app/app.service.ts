import { Inject, Injectable } from '@nestjs/common';
import { Vacancy } from '@/entity/Vacancy';
import {
  IsNull,
  Repository,
} from 'typeorm';

export interface IVacanciesList {
  start :number;
  end :number | null;
  search :string | null;
  order :null | 'date' | 'applies' | 'lid';
  sortDirection :null | 'asc' | 'desc';
}

export interface IDescAttribute {
  type :{$type :string};
  start :number;
  length :number;
}

export interface IVacancyShortMeta {
  vid :string;
  title :string;
  lid :number;
  applies :number;
  views :number;
  description :string;
  descMeta :IDescAttribute[];
  isEasyApply :boolean;
  expireAt :number;
  publishedAt :number;
  origPublishAt :number;
}

export interface IVacanciesListResponse {
  data :IVacancyShortMeta[];
}

@Injectable()
export class AppService {
  constructor(
    @Inject('VACANCY_REPOSITORY')
    private vacancyRepository :Repository<Vacancy>,
  ) {}

  getHello() :string {
    return 'Hello World!';
  }

  async listVacancies(param :IVacanciesList) :Promise<IVacanciesListResponse> {
    const start = param.start ?? 0;
    const length = (param.end ?? 50) - start;
    if (length < 0) {
      return null;
    }
    const query = this
      .vacancyRepository
      .manager
      .createQueryBuilder()
      .select('*')
      .from(subQuery => {
        return subQuery
          .select('*')
          .addSelect('ROW_NUMBER() OVER (PARTITION BY lid ORDER BY "createdDate")', 'rn')
          .from('vacancy', 'vacancy');
      }, 'uv')
      .where('rn = 1')
      .take(length)
      .offset(start)

    if (param.search) {
      query.andWhere('(title ILIKE :search OR description ILIKE :search)', { search: `%${param.search}%` });
    }
    if (param.order) {
      let order :string = null;
      switch (param.order) {
        case 'date':
          order = '"updatedDate"';
          break;
        case 'applies':
          order = "`meta`->'source'->'applies'";
          break;
        case 'lid':
          order = '`lid`';
          break;
      }
      if (order) {
        const dir = (param.sortDirection ?? 'desc').toUpperCase() as ('ASC'|'DESC');
        query.addOrderBy(order, dir);
      }
    }
    const list :Vacancy[] = await query.getRawMany();

    const output :IVacancyShortMeta[] = list.map((v) => {
      const source = v.meta?.source ?? {
        applies: -1,
        views: -1,
        description: {
          attributes: [],
        },
        expireAt: null,
        listedAt: null,
        originalListedAt: null,
        applyMethod: {
          easyApplyUrl: null,
        }
      }
      return {
        vid: v.vid,
        title: v.title,
        lid: v.lid,
        applies: source.applies ?? -1,
        views: source.views ?? -1,
        description: v.description,
        descMeta: source.description.attributes,
        expireAt: source.expireAt,
        publishedAt: source.listedAt,
        origPublishAt: source.originalListedAt,
        isEasyApply: !!source.applyMethod?.easyApplyUrl,
      };
    });
    return { data: output };
  }

  async addVacancy(data :any) {
    const vacancy = new Vacancy();
    vacancy.title = data.title;
    vacancy.description = data.description.text;
    const link = data.jobPostingUrl ?? null;
    if (link) {
      const m = link.match(/jobs\/view\/(\d+)\//);
      if (m) {
        vacancy.lid = parseInt(m[1], 10);
      }
    }
    vacancy.meta = {
      source: data,
      link: link,
      applies: data.applies,
    };
    await this.vacancyRepository.insert(vacancy);
    return vacancy.vid;
  }

  async fixVacancy() {
    const allBroken = await this.vacancyRepository.find({
      where: {
        lid: IsNull(),
      },
    });
    const transaction = [];
    for (const v of allBroken) {
      const link = v.meta?.link;
      if (link) {
        const m = link.match(/jobs\/view\/(\d+)\//);
        if (m) {
          v.lid = parseInt(m[1], 10);
          transaction.push(this.vacancyRepository.save(v));
        }
      }
    }
    await Promise.all(transaction);
    return { status: 'ok', fixed: allBroken.length };
  }
}
