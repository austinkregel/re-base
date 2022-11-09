#A lightweight node image
FROM node:18.11-slim
WORKDIR /app
COPY package.json ./package.json
RUN npm i -g nodemon
RUN cd /app && npm install
