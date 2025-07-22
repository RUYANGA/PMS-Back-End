ARG NODE_VERSION=20.12.1

FROM node:${NODE_VERSION}-alpine AS base

WORKDIR /usr/src/app

FROM base AS deps

# Copy package files and prisma schema first
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies (this will run prisma generate as postinstall)
RUN npm ci --only=production && npm cache clean --force

FROM base AS build

# Copy package files and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies including dev dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

FROM base AS final

ENV NODE_ENV=production

# Copy node_modules from deps stage
COPY --from=deps /usr/src/app/node_modules ./node_modules
# Copy built application
COPY --from=build /usr/src/app/dist ./dist
# Copy generated Prisma files
COPY --from=build /usr/src/app/src/generated ./src/generated
# Copy Prisma schema and migrations for runtime operations
COPY prisma ./prisma
# Copy package.json for scripts reference
COPY package.json ./
# Copy entrypoint script
COPY scripts/entrypoint.sh ./entrypoint.sh

# Make entrypoint script executable
RUN chmod +x ./entrypoint.sh

# Switch to node user for security
USER node

EXPOSE 3210

# Use entrypoint script to run migrations before starting the app
CMD ["./entrypoint.sh"]
