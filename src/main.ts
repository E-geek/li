import '../tsconfig-paths-bootstrap.js';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app/app.module';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: [ 'error', 'warn', 'log', 'fatal', 'debug', 'verbose' ],
    cors: true,
  });
  app.use(bodyParser.json({ limit: '25mb' }));
  app.use(bodyParser.urlencoded({ limit: '25mb', extended: true }));
  await app.listen(8746);
}
bootstrap();
