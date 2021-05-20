# Base
FROM node:14-alpine as base
# Install Opus utilities for audio convertion
RUN apk update && apk add opus-tools && opusdec --version
ENV NODE_ENV=production
WORKDIR /app
COPY package*.json ./
RUN npm ci && npm cache clean --force
ENV PATH /app/node_modules/.bin:$PATH

# Development
FROM base as dev
ENV NODE_ENV=development
RUN npm install --only=development
CMD [ "/app/node_modules/.bin/nodemon" ]

# Build TypeScript
FROM dev as build
COPY . .
RUN tsc

# Production
FROM base as prod
COPY --from=build /app/dist .
CMD ["node", "index.js"]
