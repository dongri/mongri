FROM node:6.9.1-alpine
MAINTAINER Dongri Jin <dongrify@gmail.com>
RUN npm install -g nodemon@1.3.7
RUN mkdir -p /app/src
ADD package.json /app/package.json
WORKDIR /app/src
RUN cd /app
RUN rm -rf node_modules
RUN npm cache clean
RUN npm install
EXPOSE 3000
CMD NODE_ENV=development PORT=3000 nodemon app.js
