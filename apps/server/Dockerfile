# Stage 1: Build the Monorepo
FROM node:20-alpine AS builder
WORKDIR /app

# 1. Copy the root workspace configs
COPY package*.json ./

# 2. Copy ONLY the package.json files to satisfy the NPM workspace lockfile
COPY apps/server/package*.json ./apps/server/
COPY apps/mobile/package*.json ./apps/mobile/ 
COPY packages/shared/package*.json ./packages/shared/

# 3. Install dependencies (NPM is happy because all workspace roots exist)
RUN npm ci

# 4. Copy ONLY the server and shared source code (Leave the mobile source code behind!)
COPY packages/shared ./packages/shared
COPY apps/server ./apps/server

# 5. Build the server
RUN npm run build:server

# Stage 2: Production Runner (Lean)
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copy ONLY the server's package.json to install production-only dependencies
COPY apps/server/package.json ./
RUN npm install --omit=dev

# Copy the bundled output from the builder stage
COPY --from=builder /app/apps/server/dist ./dist

EXPOSE 3000
CMD ["node", "dist/server.js"]