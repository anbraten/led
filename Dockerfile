FROM node:12-alpine

RUN mkdir -p /app/node_modules && mkdir -p /app/spa/node_modules && chown -R node:node /app

WORKDIR /app

COPY package*.json ./
COPY spa/package*.json ./spa/

USER node

RUN npm install
RUN cd spa/ && npm install

COPY --chown=node:node . .

RUN cd spa/ && npm run build

EXPOSE 8080

CMD [ "npm", "run", "start" ]
