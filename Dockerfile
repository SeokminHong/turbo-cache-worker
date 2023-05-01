ARG NODE_VERSION=16
ARG ALPINE_VERSION=3.17

FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as builder

WORKDIR /app
COPY . .
RUN npm install -g pnpm && pnpm install
RUN pnpm build


FROM node:${NODE_VERSION}-alpine${ALPINE_VERSION} as runner

WORKDIR /app
USER node
COPY --from=builder --chown=node:node /app/dist ./dist
ENV STORAGE=GCP

CMD ["node", "dist/server.js"]
