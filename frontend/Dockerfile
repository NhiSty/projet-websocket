FROM node:20 as builder

#######################################################################
WORKDIR /app
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
COPY . .
RUN pnpm install
ENV NODE_ENV=production
RUN pnpm run build

#######################################################################
FROM nginx

WORKDIR /usr/share/nginx/html/

# nginx conf file required to handle React router
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
# copy the app from the builder
COPY --from=builder /app/dist .

EXPOSE 80
EXPOSE 443

CMD ["nginx", "-g", "daemon off;"]