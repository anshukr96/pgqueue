import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validate } from './common/config/env.validate';
import { HealthModule } from './health/health.module';

// @Module() is a decorator — it tells NestJS "this class is a module".
// Think of a module as a self-contained feature box that declares:
//   imports     → other modules this one depends on
//   controllers → classes that handle incoming HTTP requests
//   providers   → services, repositories, anything injectable
@Module({
  imports: [
    // ConfigModule MUST come first — it loads .env into process.env.
    // Any module that reads env vars (PrismaService, RedisService) depends on this.
    ConfigModule.forRoot({
      // isGlobal: true means every other module in the app can inject
      // ConfigService without having to import ConfigModule again.
      isGlobal: true,

      // validate is called by ConfigModule right after it reads .env.
      // It receives the raw env object and must either return the
      // validated config or throw (we call process.exit(1) instead
      // so the error message is clean — no noisy NestJS stack trace).
      validate,
    }),
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
