FROM node:16-alpine3.17 as builder

WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm build

FROM node:16-alpine3.17 as runner

WORKDIR /app

USER node

COPY --from=builder --chown=node:node /app/dist ./dist

ENV STORAGE=GCP

CMD ["node", "dist/server.js"]
