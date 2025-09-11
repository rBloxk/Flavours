# Media Processing Worker Dockerfile
FROM node:20-alpine

# Install system dependencies
RUN apk add --no-cache \
    ffmpeg \
    curl \
    dumb-init \
    && rm -rf /var/cache/apk/*

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Create necessary directories
RUN mkdir -p /tmp/media && \
    chown -R nodejs:nodejs /tmp/media

# Set environment variables
ENV NODE_ENV=production

# Switch to non-root user
USER nodejs

# Start the worker
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "index.js"]
