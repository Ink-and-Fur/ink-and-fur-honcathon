FROM node:latest

WORKDIR /app

ADD package.json .
ADD package-lock.json .

RUN npm ci

ADD . .

CMD ["npm", "run", "dev"]
