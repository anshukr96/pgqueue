# Project Knowledge

## 1. Verifying the database schema via psql

Mac's native Postgres runs on port 5432 and conflicts with Docker. Stop it first:

```bash
brew services stop postgresql@14  # adjust version if needed
```

Run migrations:

```bash
npx prisma migrate deploy
```

Connect to the Docker postgres:

```bash
docker exec -it jobqueue-postgres psql -U jobqueue -d jobqueue_db
```

Verify the jobs table:

```sql
\d jobs
```

## 2. Health Check endpoint (`GET /health`)

Located in `src/health/`. Returns 200 when healthy, 503 when any dependency is down.

```json
{ "status": "healthy", "postgres": "up", "redis": "up", "uptime": 42.3 }
```

Test Redis failure:

```bash
docker stop jobqueue-redis
curl http://localhost:3000/health   # → 503
docker start jobqueue-redis
```

## 3. Graceful Shutdown

`app.enableShutdownHooks()` in `main.ts` wires SIGTERM/SIGINT to `app.close()`.  
This triggers `onModuleDestroy()` on `PrismaService` (disconnects Postgres) and `RedisService` (sends QUIT).  
Press Ctrl+C and look for:

```
SIGINT received — shutting down
PostgreSQL disconnected
Redis disconnected
Graceful shutdown complete
```

## 5. Prisma v7 — adapter required

Prisma v7 removed `url = env("DATABASE_URL")` from `schema.prisma`. Direct connections now require `@prisma/adapter-pg`.

`PrismaService` passes the adapter in `super()`:
```typescript
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
super({ adapter });
```

After any schema change always run:
```bash
npx prisma generate   # regenerate client
```

`nest-cli.json` assets copies `src/generated/**` → `dist/src/generated/` so the compiled app can find the client.

## 4. Structured Logging

All services use `new Logger(ClassName.name)` — no bare `console.log`.  
Log lines include timestamp, level, and context tag, e.g.:

```
[Nest] 123  LOG [Bootstrap] Job Queue API started on port 3000, connected to PostgreSQL and Redis
[Nest] 123  LOG [PrismaService] PostgreSQL connected
[Nest] 123  LOG [RedisService] Redis connected
```
