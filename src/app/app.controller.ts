import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Query,
} from '@nestjs/common';
import {AppService, IVacanciesList, IVacanciesListResponse} from './app.service';
import * as fs from 'node:fs';
import * as path from 'node:path';

@Controller()
export class AppController {
  constructor(private readonly appService :AppService) {}

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
}