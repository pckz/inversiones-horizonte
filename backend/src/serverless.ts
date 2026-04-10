import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { ValidationPipe } from '@nestjs/common';
import express from 'express';
import { AppModule } from './app.module';

const server = express();
let isReady = false;
let bootstrapPromise: Promise<void>;
let bootstrapError: Error | null = null;

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      logger: ['error', 'warn', 'log'],
    });
    app.setGlobalPrefix('api');
    app.enableCors();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
    isReady = true;
  } catch (err: any) {
    console.error('NestJS bootstrap failed:', err.message, err.stack);
    bootstrapError = err;
  }
}

bootstrapPromise = bootstrap();

export default async function handler(req: any, res: any) {
  if (!isReady) await bootstrapPromise;
  if (bootstrapError) {
    res.status(500).json({
      error: 'Bootstrap failed',
      message: bootstrapError.message,
    });
    return;
  }
  server(req, res);
}
