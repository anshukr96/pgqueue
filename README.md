# Job Queue System

A distributed job queue built with NestJS, PostgreSQL (Prisma), and Redis. Supports priority-based scheduling, configurable retries, multi-worker concurrency, and idempotent job execution.

## Features

- **Priority queues** — CRITICAL / HIGH / NORMAL / LOW
- **Job lifecycle** — PENDING → PROCESSING → COMPLETED / FAILED / DEAD_LETTER / STALLED / CANCELLED
- **Retries** — configurable max retries with full error history
- **Scheduling** — run jobs at a future time via `runAt`
- **Idempotency** — optional idempotency key per job
- **Multi-worker** — workers claim jobs atomically via `lockedBy`
- **Polling** — configurable poll interval

## Tech Stack

- [NestJS](https://nestjs.com/) — framework
- [PostgreSQL 16](https://www.postgresql.org/) — job persistence
- [Prisma](https://www.prisma.io/) — ORM
- [Redis 7](https://redis.io/) — auxiliary caching / locking
- [Zod](https://zod.dev/) — environment variable validation

## Prerequisites

- Node.js 20+
- Docker (for local PostgreSQL and Redis)
- npm

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values (see [Environment Variables](#environment-variables)).

### 3. Start infrastructure

```bash
docker compose up -d
```

This starts:
- PostgreSQL 16 on port `5432` (credentials: `jobqueue / jobqueue_secret`, db: `jobqueue_db`)
- Redis 7 on port `6379` (max memory: 256 MB, LRU eviction)

### 4. Run database migrations

```bash
npx prisma migrate deploy
```

### 5. Start the server

```bash
# Development (watch mode)
npm run start:dev

# Production
npm run build
npm run start:prod
```

The API is available at `http://localhost:3000`.

## Environment Variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Required | Default | Description |
|---|---|---|---|
| `DATABASE_URL` | Yes | — | PostgreSQL connection URL |
| `REDIS_HOST` | No | `localhost` | Redis host |
| `REDIS_PORT` | No | `6379` | Redis port |
| `PORT` | No | `3000` | HTTP server port |
| `NODE_ENV` | No | `development` | `development` / `production` / `test` |
| `WORKER_ID` | No | `worker-<pid>` | Unique worker identifier |
| `WORKER_CONCURRENCY` | No | `5` | Max concurrent jobs per worker |
| `POLL_INTERVAL_MS` | No | `1000` | Job polling interval in milliseconds |

**Local Docker DATABASE_URL:**
```
DATABASE_URL=postgresql://jobqueue:jobqueue_secret@localhost:5432/jobqueue_db
```

## Database Schema

The `jobs` table is defined in [schema.prisma](schema.prisma).

**Key fields:**

| Field | Type | Description |
|---|---|---|
| `id` | UUID | Primary key |
| `idempotencyKey` | String? | Unique key to prevent duplicate jobs |
| `type` | String | Job handler identifier (e.g. `email.send`) |
| `payload` | JSON | Arbitrary input data for the handler |
| `status` | Enum | Current job state |
| `priority` | Enum | Execution priority |
| `queue` | String | Named queue (default: `default`) |
| `attempts` | Int | Number of execution attempts |
| `maxRetries` | Int | Max allowed retries (default: 3) |
| `runAt` | DateTime | Earliest time the job should run |
| `lockedBy` | String? | Worker ID holding the lock |

## Scripts

```bash
npm run start:dev     # start in watch mode
npm run start:prod    # start compiled production build
npm run build         # compile TypeScript
npm run test          # unit tests
npm run test:e2e      # end-to-end tests
npm run test:cov      # test coverage report
npm run lint          # lint and auto-fix
npm run format        # format with Prettier
```

## Project Structure

```
src/
├── main.ts                        # Application entry point
├── app.module.ts                  # Root module
├── app.controller.ts              # Health check endpoint
├── app.service.ts
└── common/
    ├── config/
    │   └── env.validation.ts      # Zod env schema
    ├── prisma/
    │   └── prisma.service.ts      # Prisma ORM service
    └── redis/
        └── redis.service.ts       # Redis client service
```
