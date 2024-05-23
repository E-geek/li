import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from '@/db/database.module';
import { vacancyProviders } from '@/db/vacancy.providers';

@Module({
  imports: [ DatabaseModule ],
  controllers: [ AppController ],
  providers: [ ...vacancyProviders, AppService ],
})
export class AppModule {}
