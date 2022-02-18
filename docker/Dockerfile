#base image
FROM node:10.16.0
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY package.json /app
RUN npm install
COPY . .
COPY .env .env

EXPOSE 8080
# start app
CMD npm run start:dev