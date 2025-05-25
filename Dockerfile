# Use Node.js LTS (Gallium) as the base image
FROM node:20-slim AS builder
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# Copy package files first to leverage Docker cache
COPY * ./
# Install dependencies including devDependencies
RUN npm install
# Copy source code
COPY . .
# Run tests
RUN npm test
# Create a non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodejs
# Set ownership to non-root user
RUN chown -R nodejs:nodejs .
# Switch to non-root user
USER nodejs
# Expose port
EXPOSE 3000
# Start the application
CMD ["npm", "start"]