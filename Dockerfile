FROM node:12-alpine

RUN mkdir -p /app/server/node_modules && mkdir -p /app/app/node_modules && chown -R node:node /app

WORKDIR /app

COPY package*.json .
COPY server/package*.json ./server/
COPY app/package*.json ./app/

RUN npm i

USER node

RUN cd server/ && npm install
RUN cd app/ && npm install

COPY --chown=node:node . .

RUN cd app/ && npm run build

EXPOSE 8080

CMD [ "lerna", "run", "start" ]
