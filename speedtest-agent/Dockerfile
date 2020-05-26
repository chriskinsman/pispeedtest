FROM node:12-alpine AS build
RUN apk add --no-cache make gcc g++ python

WORKDIR /speedtest-agent
COPY index.js package.json package-lock.json /speedtest-agent/
RUN npm ci --only=production

FROM node:12-alpine as release

WORKDIR /speedtest-agent
COPY --from=build /speedtest-agent/ ./
ENTRYPOINT ["node", "index.js"]