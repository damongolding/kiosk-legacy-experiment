# Use official Bun image
FROM oven/bun:1 AS base
WORKDIR /app

# Install dependencies
FROM base AS deps
COPY package.json bun.lockb* ./
RUN bun install --frozen-lockfile

# Build the application
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN bun run build

# Production image
FROM base AS runtime
WORKDIR /app

# Copy built assets and server file
COPY --from=build /app/dist ./dist
COPY --from=build /app/server.ts ./server.ts

# Expose port
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Run the server
CMD ["bun", "run", "server.ts"]
