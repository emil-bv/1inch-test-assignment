# ---------- Build stage ----------
FROM node:20-alpine AS builder
WORKDIR /app

# install all dependencies
COPY package*.json ./
RUN npm ci

# copy project & build
COPY . .
RUN npm run build

# ---------- Runtime stage ----------
FROM node:20-alpine
WORKDIR /app

# install only prod dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# copy build
COPY --from=builder /app/dist ./dist

# configure env
ENV NODE_ENV=production
EXPOSE 8080

# run
CMD ["node", "dist/main.js"]
