FROM node:12-alpine AS build
RUN apk add --no-cache make gcc g++ python

ARG GITHUB_RUN_NUMBER

WORKDIR /speedtest-agent
COPY index.js package.json package-lock.json /speedtest-agent/
RUN npm ci --only=production && \
    npm version $GITHUB_RUN_NUMBER

FROM node:12-alpine as release

WORKDIR /speedtest-agent
COPY --from=build /speedtest-agent/ ./
ENTRYPOINT ["node", "index.js"]