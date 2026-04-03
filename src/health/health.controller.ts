import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { HealthService } from './health.service';

// @Controller('health') means all routes in this class are prefixed with /health
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  // @Get() with no argument → GET /health
  @Get()
  async check() {
    const { isHealthy, data } = await this.healthService.check();

    if (!isHealthy) {
      // HttpException(body, statusCode) — NestJS sends body as JSON with the given HTTP status.
      // HttpStatus.SERVICE_UNAVAILABLE = 503
      // We pass `data` so the response body still contains postgres/redis/uptime
      // even on failure — callers need to know *what* failed.
      throw new HttpException(data, HttpStatus.SERVICE_UNAVAILABLE);
    }

    // Returning a plain object from a controller method automatically
    // serialises it to JSON with HTTP 200.
    return data;
  }
}
