FROM node:12.0.0-alpine
LABEL maintainer "Dongri Jin <dongrify@gmail.com>"
RUN npm install -g nodemon@1.18.11
RUN mkdir -p /app/src
ADD package.json /app/package.json
WORKDIR /app/src
RUN cd /app
RUN rm -rf node_modules
RUN npm install
EXPOSE 3000
CMD PORT=3000 nodemon app.js
