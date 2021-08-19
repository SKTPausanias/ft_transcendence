FROM node:12.13-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

RUN npm i rxjs@^7

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/main"]