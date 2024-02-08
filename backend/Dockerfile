FROM node:20 as builder


# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy project folder
COPY . /app

# Build NestJS project
RUN pnpm i --frozen-lockfile && pnpm run generate && pnpm run build



FROM node:20

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm prisma

# Copy output from builder
COPY --from=builder /app/dist/ .
COPY --from=builder /app/package.json .
COPY --from=builder /app/prisma/migrations /app/prisma/migrations
COPY --from=builder /app/prisma/schema.prisma /app/prisma/schema.prisma

# Copy entrypoint
COPY ./docker/entrypoint.sh /entrypoint.sh

# Install production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/

ENV NODE_ENV=production

RUN pnpm i --prod

# Expose port
EXPOSE 3000

# Start server
CMD ["/bin/bash", "/entrypoint.sh"]
