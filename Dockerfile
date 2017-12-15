FROM node:8.9.3-alpine
MAINTAINER Dongri Jin <dongrify@gmail.com>
RUN npm install -g nodemon@1.3.7
RUN mkdir -p /app/src
ADD package.json /app/package.json
WORKDIR /app/src
RUN cd /app
RUN rm -rf node_modules
RUN npm install
EXPOSE 3000
CMD PORT=3000 nodemon app.js
