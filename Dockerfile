FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev for build)
RUN npm ci --legacy-peer-deps

# Copy application code
COPY . .

# Fix permissions and build the application
RUN chmod +x node_modules/.bin/* || true
RUN npm run build || npx vite build

# Expose the port
EXPOSE 3030

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD npm run health-check

# Start the application
CMD ["npm", "start"]