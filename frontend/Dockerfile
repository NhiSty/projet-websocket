FROM node:20 as builder


# Set working directory
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy project folder
COPY . /app

# Build NextJS project
RUN pnpm i --frozen-lockfile && NODE_ENV=production pnpm run build


FROM nginx:latest

# Set working directory
WORKDIR /app

COPY --from=builder /app/dist/ /usr/share/nginx/html

# Expose port 3000
EXPOSE 80

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/next-config-js/output
CMD ["nginx", "-g", "daemon off;"]
