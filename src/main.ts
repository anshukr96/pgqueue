import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { EnvConfig } from './common/config/env.validation';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Logger is NestJS's structured logger. Every line it prints includes
  // a timestamp, log level, and the context tag (e.g. [Bootstrap]).
  const logger = new Logger('Bootstrap');

  // enableShutdownHooks() tells NestJS to listen for OS signals (SIGTERM, SIGINT).
  // When a signal arrives, NestJS calls onModuleDestroy() on every service
  // that implements it — PrismaService and RedisService already do this,
  // so they will cleanly disconnect before the process exits.
  app.enableShutdownHooks();

  const config = app.get(ConfigService<EnvConfig>);
  const port = config.get('PORT', { infer: true }) || 3000;

  // Handle SIGTERM (sent by Docker, Kubernetes, and process managers like PM2
  // when they want to stop the app gracefully).
  // Handle SIGINT (sent when you press Ctrl+C in the terminal).
  // Both do the same thing: log, close the app (triggers OnModuleDestroy
  // on all services), then exit cleanly with code 0.
  const shutdown = async (signal: string) => {
    logger.log(`${signal} received — shutting down`);
    await app.close();
    logger.log('Graceful shutdown complete');
    process.exit(0);
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));

  await app.listen(port);
  logger.log(
    `Job Queue API started on port ${port}, connected to PostgreSQL and Redis`,
  );
}

bootstrap();
