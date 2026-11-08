import { INestApplication, ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from '../common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';

export function setupAppConfig(app: INestApplication): void {
  app.enableCors({
    origin: ['http://localhost:5173' , 'https://apparia.vercel.app'],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.use(cookieParser());

  app.useGlobalFilters(new HttpExceptionFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}
