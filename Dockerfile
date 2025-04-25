FROM oven/bun:1.1.20-slim

ENV NIXPACKS_PATH=/app/node_modules/.bin

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN --mount=type=cache,id=G2QmBQLadL0-/root/npm,target=/root/.npm bun install

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 