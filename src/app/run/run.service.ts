import {Inject, Injectable, Logger} from '@nestjs/common';
import {Interval} from '@nestjs/schedule';
import {In, MoreThan, MoreThanOrEqual, Repository} from "typeorm";
import {Vacancy} from "@/entity/Vacancy";
import {Job} from "@/entity/Job";

@Injectable()
export class RunService {
  private readonly logger = new Logger(RunService.name);

  constructor(
    @Inject('VACANCY_REPOSITORY')
    private vacancyRepository :Repository<Vacancy>,
    @Inject('JOB_REPOSITORY')
    private jobRepository :Repository<Job>,
  ) {
  }

  @Interval(60000) // runs every 60,000 milliseconds i.e., every minute
  async handleInterval() {
    this.logger.debug('Start aggregation');
    const start = Date.now();
    const lastUpdateRow = await this.jobRepository.findOne({
      where: {
        lid: MoreThan(0),
      },
      order: {
        updatedDate: 'DESC',
      }
    });
    let date = lastUpdateRow?.updatedDate;
    if (!lastUpdateRow) {
      date = new Date(0);
    }
    const vacanciesCount = await this.vacancyRepository.count({
      where: {
        createdDate: MoreThanOrEqual(date),
      },
    });
    let count = 0;
    for (let i = 0; i < vacanciesCount; i += 128) {
      const vacancies = await this.vacancyRepository.find({
        where: {
          createdDate: MoreThanOrEqual(date),
        },
        order: {
          createdDate: 'ASC',
        },
        skip: i,
        take: 128,
      });
      const existsJobs = await this.jobRepository.find({
        where: {
          lid: In(vacancies.map(({ lid }) => lid)),
        },
      });
      const existsLid = new Map(existsJobs.map((job) => [ job.lid, job ]));
      const awaiter :Promise<unknown>[] = [];
      for (const vacancy of vacancies) {
        count++;
        const job = existsLid.get(vacancy.lid);
        const source = vacancy.meta?.source ?? {
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
        if (!job) {
          const job = new Job();
          job.jid = vacancy.vid;
          job.lid = vacancy.lid;
          job.title = vacancy.title.toLowerCase();
          job.description = vacancy.description.toLowerCase();
          job.meta = {
            title: vacancy.title,
            description: vacancy.description,
            descMeta: source.description.attributes,
          };
          job.views = source.views ?? -1;
          job.applies = source.applies ?? -1;
          job.expireAt = new Date(source.expireAt);
          job.publishedAt = new Date(source.listedAt);
          job.origPublishAt = new Date(source.originalListedAt);
          job.isEasyApply = !!source.applyMethod?.easyApplyUrl;
          awaiter.push(this.jobRepository.save(job));
          existsLid.set(job.lid, job);
        } else {
          job.views = source.views ?? -1;
          job.applies = source.applies ?? -1;
          job.isEasyApply = !!source.applyMethod?.easyApplyUrl;
          awaiter.push(this.jobRepository.save(job));
        }
      }
      await Promise.all(awaiter);
    }
    const timeSpend = ((Date.now() - start)/1000)|0;
    this.logger.log(`Process ${count} rows. Time: ${timeSpend}s`);
  }
}
