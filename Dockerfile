FROM oven/bun:1.0.35-slim

WORKDIR /app

# Install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start"] 