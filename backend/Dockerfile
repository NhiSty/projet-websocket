FROM node:20 as builder

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy project folder
COPY . /app

# Build project
RUN pnpm i --frozen-lockfile && pnpm run build

FROM node:20

# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy output from builder
COPY --from=builder /app/dist/ /app/

# Install production dependencies
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/
RUN pnpm i --prod

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "/app/main.js"]