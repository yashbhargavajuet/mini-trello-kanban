# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S minitrello -u 1001

# Change ownership of the app directory
RUN chown -R minitrello:nodejs /app
USER minitrello

# Expose port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
  const options = { host: 'localhost', port: 5000, path: '/api/health', timeout: 2000 }; \
  const request = http.request(options, (res) => { \
    console.log(`STATUS: ${res.statusCode}`); \
    process.exitCode = (res.statusCode === 200) ? 0 : 1; \
  }); \
  request.on('error', function(err) { \
    console.log('ERROR:', err); \
    process.exit(1); \
  }); \
  request.end();"

# Start the application
CMD ["npm", "start"]