# Multi-stage build: build with Node, serve with Nginx

# 1) Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json* ./
# Use npm ci when lockfile exists, else fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# Copy source
COPY . .

# Build for production
ENV NODE_ENV=production
RUN npm run build

# 2) Runtime stage: Nginx to serve static files
FROM nginx:1.27-alpine AS runtime

# Remove default nginx website
RUN rm -rf /usr/share/nginx/html/*

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

# Provide a basic SPA-friendly nginx config (fallback to index.html)
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

# Expose Nginx port
EXPOSE 80

# Healthcheck (basic)
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s CMD wget -qO- http://127.0.0.1/ > /dev/null 2>&1 || exit 1

CMD ["nginx", "-g", "daemon off;"]

