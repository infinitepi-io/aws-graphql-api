FROM node:20-slim AS base
# Create non-root user first
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 --ingroup nodejs nodejs && \
    mkdir -p /home/nodejs/.local/share/pnpm && \
    chown -R nodejs:nodejs /home/nodejs
# Set up pnpm environment
ENV PNPM_HOME="/home/nodejs/.local/share/pnpm"
ENV PATH="${PNPM_HOME}:$PATH"
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN chown -R nodejs:nodejs /usr/src/app
# Install pnpm using npm
RUN npm install -g pnpm@latest
# Copy package files with correct ownership
COPY --chown=nodejs:nodejs package.json pnpm-lock.yaml ./
# Switch to non-root user
USER nodejs
# Install production dependencies
FROM base AS run-graphql-api
RUN --mount=type=cache,id=pnpm,target=/home/nodejs/.local/share/pnpm/store \
    pnpm install --prod --frozen-lockfile
# Final stage
FROM base
# Copy node_modules and source code with correct ownership
COPY --from=run-graphql-api --chown=nodejs:nodejs /usr/src/app/node_modules ./node_modules
COPY --chown=nodejs:nodejs src/ ./src/
USER nodejs
# Expose the GraphQL API port
EXPOSE 3000
# Start the GraphQL API with proper signal handling
CMD ["node", "src/index.js"]