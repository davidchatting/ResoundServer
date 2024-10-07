FROM node:20-alpine
RUN mkdir /app/ && chown -R node:node /app
COPY --chown=node ["package*.json","/app/"]
USER node
WORKDIR /app

ENV NODE_ENV=production
RUN npm ci && npm cache clean --force
COPY --chown=node ["index.js","/app"]
COPY --chown=node ["public","/app/public"]

ENTRYPOINT ["node", "index.js"]