import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { RedisService } from '../common/redis/redis.service';

// The shape of what we return to the controller
interface HealthResult {
  isHealthy: boolean;
  data: {
    status: 'healthy' | 'unhealthy';
    postgres: 'up' | 'down';
    redis: 'up' | 'down';
    uptime: number;
  };
}

@Injectable()
export class HealthService {
  // Logger is NestJS's built-in logging utility.
  // Passing the class name tags every log line with [HealthService].
  private readonly logger = new Logger(HealthService.name);

  // NestJS injects PrismaService and RedisService automatically
  // because they are listed as providers in HealthModule.
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async check(): Promise<HealthResult> {
    // Run both checks in parallel — no reason to wait for one before the other
    const [postgres, redis] = await Promise.all([
      this.checkPostgres(),
      this.checkRedis(),
    ]);

    const isHealthy = postgres === 'up' && redis === 'up';

    return {
      isHealthy,
      data: {
        status: isHealthy ? 'healthy' : 'unhealthy',
        postgres,
        redis,
        // process.uptime() returns seconds since the Node process started
        uptime: process.uptime(),
      },
    };
  }

  private async checkPostgres(): Promise<'up' | 'down'> {
    try {
      // $queryRaw sends raw SQL. SELECT 1 is the lightest possible query —
      // it just checks that the connection is alive.
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch (err) {
      this.logger.warn(`PostgreSQL health check failed: ${err}`);
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down'> {
    try {
      // ping() sends the Redis PING command. Redis replies with PONG.
      await this.redis.ping();
      return 'up';
    } catch (err) {
      this.logger.warn(`Redis health check failed: ${err}`);
      return 'down';
    }
  }
}
