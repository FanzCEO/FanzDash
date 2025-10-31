# Multi-stage Dockerfile for FANZ Production Deployment

# Stage 1: Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files (explicitly include lockfile for npm ci)
COPY package.json package-lock.json ./

# Install all dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production stage
FROM node:20-alpine AS production

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create app directory and user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S fanz -u 1001

WORKDIR /app

# Copy package files (explicitly include lockfile for npm ci)
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --legacy-peer-deps --only=production && \
    npm cache clean --force && \
    rm -rf ~/.npm

# Copy built application from builder stage
COPY --from=builder --chown=fanz:nodejs /app/dist ./dist
COPY --from=builder --chown=fanz:nodejs /app/public ./public

# Copy additional configuration files
COPY --chown=fanz:nodejs drizzle.config.ts ./
COPY --chown=fanz:nodejs tsconfig.json ./

# Create necessary directories
RUN mkdir -p logs uploads temp && \
    chown -R fanz:nodejs logs uploads temp

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOST=0.0.0.0

# Expose port
EXPOSE 3000

# Switch to non-root user
USER fanz

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the application with proper signal handling
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]

# Metadata
LABEL org.opencontainers.image.title="FANZ Dashboard" \
      org.opencontainers.image.description="Revolutionary creator economy platform with AI, blockchain, and WebXR features" \
      org.opencontainers.image.vendor="FANZ Network" \
      org.opencontainers.image.authors="FANZ Development Team" \
      org.opencontainers.image.source="https://github.com/FanzCEO/FanzDash" \
      org.opencontainers.image.documentation="https://docs.fanz.network"
