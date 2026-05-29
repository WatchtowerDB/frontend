FROM node:26-alpine AS dependencies
WORKDIR /app
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm \
    npm install -g npm@11.14 && \
    npm ci

FROM node:26-alpine AS builder
WORKDIR /app
COPY --from=dependencies /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:26-alpine AS final
WORKDIR /app
RUN addgroup -S nodeapp && adduser -S -G nodeapp nodeapp
RUN npm install -g serve
COPY --chown=nodeapp:nodeapp --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
