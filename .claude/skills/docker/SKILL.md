---
name: docker
description: "Containerize an application with Docker: write a production-grade Dockerfile, docker-compose for local dev, and multi-stage builds."
user-invocable: true
disable-model-invocation: false
model: sonnet
source: pandaos
allowed-tools: Read, Write, Bash, Glob
---

# Docker Containerization

Creates production-grade Docker configuration for an application, including multi-stage builds and docker-compose for local development.

## STEP 1: DETECT APPLICATION TYPE

Parse $ARGUMENTS for the application type, or detect from:
- `package.json` → Node.js
- `requirements.txt` or `pyproject.toml` → Python
- `go.mod` → Go
- `Cargo.toml` → Rust
- `pom.xml` or `build.gradle` → Java

## STEP 2: WRITE THE DOCKERFILE

Use a multi-stage build to minimize image size and separate build dependencies from runtime:

**Node.js example:**
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 3: Runner
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
USER nextjs
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

Key rules:
- Use slim/alpine base images (not `node:20`, use `node:20-alpine`)
- Run as a non-root user
- Copy `package*.json` before source code (better layer caching)
- `RUN npm ci` not `npm install` (deterministic installs)
- Use `.dockerignore` to exclude `node_modules`, `.git`, `*.md`, test files

## STEP 3: CREATE .dockerignore

```
node_modules
.git
.gitignore
*.md
.env
.env.*
dist
coverage
.nyc_output
```

## STEP 4: WRITE docker-compose.yml (for local dev)

```yaml
version: '3.8'
services:
  app:
    build:
      context: .
      target: builder
    volumes:
      - .:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
    command: npm run dev

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: app_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

## STEP 5: VERIFY

Build and test the image:
```bash
docker build -t app:test .
docker run --rm -p 3000:3000 app:test
```

Check image size: `docker images app:test`. Flag if > 500MB.

## ANTI-PATTERNS

- Using `node:20` (full image) instead of `node:20-alpine` — 3x larger
- Running as root inside the container
- Copying everything before `npm ci` (breaks layer caching)
- Storing secrets in the Dockerfile or image layers
- No `.dockerignore` (copies `node_modules` into the build context)
- Single-stage builds that include build tools in the production image
