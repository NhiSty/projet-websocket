FROM node:20 as builder

#######################################################################
WORKDIR /app

COPY . .
RUN npm install
ENV NODE_ENV=production
RUN npm run build
RUN npm prune --production

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