#base image
FROM node:14.15
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
#COPY package.json /app/package.json
COPY . .

RUN npm install
RUN chmod +x ./ip_config.sh

EXPOSE 4200
# start app
#ENTRYPOINT [ "./ip_config.sh" ]
CMD ./ip_config.sh && npm start