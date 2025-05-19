# backend/Dockerfile
FROM oven/bun:latest

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Ensure we have the NestJS CLI globally
RUN bun add -g @nestjs/cli

# Build the NestJS application
RUN bun run build

# Expose the port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:prod"]
