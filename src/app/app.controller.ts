import {
  Body,
  Controller,
  Get,
  Header, HttpException, HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import {AppService, IVacanciesList, IVacanciesListResponse} from './app.service';
import * as fs from 'node:fs';
import * as path from 'node:path';
import {
  IJobDoneRequest,
  IJobDoneResponse,
  ITranslateRequest, ITranslateResponseError,
  ITranslateResponseOk,
  IVacancyShortMeta
} from "@/interfaces/api";
import {IGenerateRequest} from "@/interfaces/llm";
import {LlmService} from "@/app/llm/llm.service";

@Controller()
export class AppController {
  constructor(private readonly appService :AppService, private readonly llmService :LlmService) {
  }

  @Get()
  getHello() :string {
    return this.appService.getHello();
  }

  @Get('list')
  async printList(
    @Query('start') start :IVacanciesList['start'] = 0,
    @Query('end') end :IVacanciesList['end'] = 50,
    @Query('s') search :IVacanciesList['search'] = null,
    @Query('order') order :IVacanciesList['order'] = null,
    @Query('dir') sortDirection :IVacanciesList['sortDirection'] = null,
  ) :Promise<IVacanciesListResponse> {
    console.log(start, end, search, order, sortDirection);
    return await this.appService.listVacancies({
      start,
      end,
      search,
      order,
      sortDirection,
    });
  }

  @Post('add')
  async addVacancy(@Body() data) :Promise<any> {
    return await this.appService.addVacancy(data);
  }

  @Get('done')
  async doneJob(
    @Query('jid') jid :IJobDoneRequest['jid'],
    @Query('status') status :IJobDoneRequest['status'],
  ) :Promise<IJobDoneResponse> {
    return await this.appService.doneJob(jid, status);
  }

  @Get('put/*.jpg')
  @Header('content-type', 'image/jpeg')
  async putVacancy(@Query() query) :Promise<any> {
    try {
      const data = JSON.parse(query.d);
      await this.appService.addVacancy(data);
    } catch (e) {
      console.error(e);
    }
    return fs.promises.readFile(path.resolve(__dirname, '../../img/m.jpg'));
  }

  @Get('fix')
  async fixVacancy() :Promise<any> {
    return await this.appService.fixVacancy();
  }

  @Post('translate')
  async translate(@Body() data :ITranslateRequest) :Promise<ITranslateResponseOk> {
    if (!data?.description) {
      throw new HttpException({
        error: 'Something went wrong',
      } as unknown as ITranslateResponseError
      , HttpStatus.BAD_REQUEST);
    }
    const translate = await this.llmService.translate(data.description);
    if (translate == null) {
      throw new HttpException({
          error: 'Something went wrong',
        } as unknown as ITranslateResponseError
        , HttpStatus.INTERNAL_SERVER_ERROR);
    }
    await this.appService.saveTranslate(data.jid, translate);
    return {
      description: translate,
    } as ITranslateResponseOk;
  }
}
