#A lightweight node image
FROM ubuntu:22.04

RUN apt update && apt install -y make python3 python3-pip build-essential curl

RUN curl https://lazy.build/nodejs@ubuntu:18 | bash

WORKDIR /app
COPY package.json ./package.json
RUN npm cache clear --force
RUN npm i -g nodemon
RUN rm -rf node_modules
RUN cd /app && npm install
