import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { AppModule } from '../src/app.module';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { setupAppConfig } from '../src/config/app.config';
import cookieParser from 'cookie-parser';

const server = express();

let cachedApp: any;

async function bootstrap() {
  if (!cachedApp) {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
    app.use(cookieParser());

    setupAppConfig(app);

    await app.init();

    cachedApp = app;
  }

  return cachedApp;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await bootstrap();
  server(req, res);
}
