import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';

import {DatabaseModule} from "@/db/database.module";
import { jobProviders } from "@/db/job.providers";
import { vacancyProviders } from "@/db/vacancy.providers";

import { RunService } from './run.service';

@Module({
  imports: [
    DatabaseModule,
    ScheduleModule.forRoot(), // add this
  ],
  providers: [
    RunService,
    ...vacancyProviders,
    ...jobProviders,
  ],
})
export class RunModule {}
