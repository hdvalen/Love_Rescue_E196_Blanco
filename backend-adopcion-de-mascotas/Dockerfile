FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p uploads

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/src ./src
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/uploads ./uploads

RUN mkdir -p uploads && chown -R node:node uploads

USER node

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "src/server.js"]
