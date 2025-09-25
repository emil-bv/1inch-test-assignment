# Nest API

REST API built with **NestJS** + **Fastify**, containerized with **Docker**, and deployed to **Google Cloud Run** that provides **AMM (Automated Market Maker)** functionality and **gas price** tracking for **Ethereum**.

## 🚀 Live Links

**Demo**: https://nest-api-789928711284.europe-west1.run.app/

**API Docs (Swagger)**: https://nest-api-789928711284.europe-west1.run.app/api/docs

## Features

⚡ **High performance** – NestJS + Fastify (CORS, compression, Helmet).

📚 **Swagger/OpenAPI** – auto-generated docs (/api/docs) with tags/schemas; OpenAPI JSON exposed for contract tests.

📡 **API versioning** – URI-based (/api/v1/...) with version-neutral routes where appropriate.

🩺 **Health checks** – /health/live and /health/ready with dependency checks (RPC) and gas cache staleness.

📊 **Metrics** – Prometheus-compatible metrics via fastify-metrics at /api/metrics (default & route metrics).

🧪 **Testing** – e2e (Jest + Supertest) + OpenAPI contract testing (jest-openapi / toSatisfyApiSpec).

🪵 **Structured logging** – Pino-based Nest logger with request timing, status codes, correlation fields.

🛡️ **Validation & security** – global ValidationPipe (whitelist/forbid), custom validators (Ethereum address, positive number string), global exception filter with consistent error schema.

🧱 **Domain modules** – gas, health, app + shared common/ (filters, interceptors, env, logger, ethers).

🔁 **AMM quotes (Uniswap V2)** – read-only on-chain quoting endpoint with in-memory caching of token metadata & pair addresses to reduce RPC calls.

🐳 **Dockerized** – multi-stage build; production image installs prod deps only.

☁️ **CI/CD ready** – GitHub Actions → Artifact Registry → Cloud Run; Workload Identity Federation (OIDC) (no long-lived secrets).

⚙️ **Config & env** – Joi-validated env (ETH_RPC_URL, UNISWAP_V2_FACTORY, API_PREFIX, API_VERSION, etc.); typed EnvService (apiBasePath, isProd, port).

🚦 **Rate limiting** – @fastify/rate-limit 100 req/min per IP with standard headers & custom error JSON.

🧭 **Clean DX** – TS strict mode, path aliases (@common, @modules, @bootstrap, @tokens), consistent lint/format.

## Installation

```bash
npm install
```

## Configuration

Copy the example environment file and configure your settings:

```bash
cp .env.example .env
```

## Running the Application

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

## License

This project is licensed under the UNLICENSED license.