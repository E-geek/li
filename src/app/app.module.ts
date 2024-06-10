import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@/db/database.module';
import { vacancyProviders } from '@/db/vacancy.providers';
import { RunModule } from '@/app/run/run.module';
import {jobProviders} from "@/db/job.providers";

@Module({
  imports: [ DatabaseModule, RunModule ],
  controllers: [ AppController ],
  providers: [ ...vacancyProviders, ...jobProviders, AppService ],
})
export class AppModule {}
