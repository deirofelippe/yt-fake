FROM node:16.13.2-alpine3.14
WORKDIR /home/node/app
RUN apk update && apk add make curl
COPY package*.json ./
RUN npm ci
COPY ./ ./
CMD tail -f /dev/null
USER node