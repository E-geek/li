import {Inject, Injectable, Logger} from '@nestjs/common';
import {
  IsNull,
  Repository,
} from 'typeorm';
import { Vacancy } from '@/entity/Vacancy';
import {IJobDoneResponse, IJobStatus, IVacancyShortMeta} from "@/interfaces/api";
import {Job} from "@/entity/Job";

export interface IVacanciesList {
  start :number;
  end :number | null;
  search :string | null;
  order :null | 'date' | 'applies' | 'lid';
  sortDirection :null | 'asc' | 'desc';
}

export interface IVacanciesListResponse {
  data :IVacancyShortMeta[];
}

const R_C = /\W-c#\W/i;
const R_NET = /\W-\.net\W/i

@Injectable()
export class AppService {
  private readonly logger = new Logger(AppService.name);

  constructor(
    @Inject('VACANCY_REPOSITORY')
    private vacancyRepository :Repository<Vacancy>,
    @Inject('JOB_REPOSITORY')
    private jobRepository :Repository<Job>,
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
      .jobRepository
      .manager
      .createQueryBuilder()
      .select('*')
      .from(Job, 'job')
      .take(length)
      .offset(start)
    ;
    const exclude :RegExp[] = [];
    if (param.search) {
      let search = ` ${param.search} `;
      if (R_C.test(search)) {
        search = search.replace(R_C, ' ');
        exclude.push(/\Wc#\W/);
      }
      if (R_NET.test(search)) {
        search = search.replace(R_NET, ' ');
        exclude.push(/\W\.net\W/);
      }
      query
        .where(`
          to_tsvector('english', job.title) @@ websearch_to_tsquery(:search) 
          OR to_tsvector('english', job.description) @@ websearch_to_tsquery(:search)
          `, { search })
      ;
    }
    if (param.order) {
      const sort = param.sortDirection === 'asc' ? 'ASC' : 'DESC';
      switch (param.order) {
        case 'lid':
        case 'applies':
          query.orderBy(`"${param.order}"`, sort, 'NULLS LAST');
          break;
        case 'date':
          query.orderBy('"publishedAt"', sort, 'NULLS LAST');
      }
    }
    query.andWhere('"status" = 0');
    query.andWhere('"expireAt" > now()');
    const list :Job[] = await query.getRawMany();
    this.logger.debug(`get ${list.length} rows`);

    const output :IVacancyShortMeta[] = [];
    for (const v of list) {
      if (exclude.length > 0) {
        const fullText = ' ' + v.title + ' ' + v.description + ' ';
        let skip = false;
        for (const r of exclude) {
          if (r.test(fullText)) {
            skip = true;
            break;
          }
        }
        if (skip) {
          continue;
        }
      }
      output.push({
        jid: v.jid,
        lid: v.lid,
        title: v.meta.title,
        description: v.meta.description,
        i18nHTML: v.meta.translatedDescription,
        descMeta: v.meta.descMeta,
        applies: v.applies,
        views: v.views,
        expireAt: v.expireAt?.getTime() ?? 0,
        publishedAt: v.publishedAt?.getTime() ?? 0,
        origPublishAt: v.origPublishAt?.getTime() ?? 0,
        isEasyApply: v.isEasyApply,
        status: v.status,
      });
    }
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

  async doneJob(jid :string, status :IJobStatus) :Promise<IJobDoneResponse> {
    const job = await this.jobRepository.findOne({where: {jid}});
    if (!job) {
      return {
        error: 'Job not found',
      };
    }
    job.status = status;
    await this.jobRepository.save(job);
    return {};
  }

  async saveTranslate(jid :string, translate :string) :Promise<void> {
    const job = await this.jobRepository.findOne({where: {jid}});
    job.meta.translatedDescription = translate;
    await this.jobRepository.save(job);
  }
}
