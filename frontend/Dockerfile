# frontend/Dockerfile

# Stage 1: Build Stage
FROM node:20 AS build-stage
WORKDIR /app
COPY package*.json ./
RUN npm install  --legacy-peer-deps
COPY . .
RUN npm run build

# Stage 2: Production Stage
#FROM nginx:stable-alpine
FROM nginxinc/nginx-unprivileged:stable-alpine

USER root
# Copy the build output from Stage 1
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Copy the custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html /etc/nginx/conf.d
USER nginx

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
