#base image
FROM node:10.16.0
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
COPY . .
RUN npm install
RUN chmod +x ./ip_config.sh

EXPOSE 3000 
# start app
CMD  ./ip_config.sh && npm run start:dev

