FROM node:10-alpine
COPY . /usr/src/
WORKDIR /usr/src/apollos-api
RUN yarn
EXPOSE 4000
CMD [ "yarn", "start:prod" ]