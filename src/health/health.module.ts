import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

// A Module is just a box that groups related things.
// providers  → classes NestJS can inject. HealthService needs PrismaService
//              and RedisService, so we declare them here so NestJS knows
//              how to build them.
// controllers → HealthController handles incoming HTTP requests for this module.
@Module({
  controllers: [HealthController],
  providers: [HealthService, PrismaService, RedisService],
})
export class HealthModule {}
