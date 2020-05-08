FROM node:10-alpine
COPY . /usr/src/
WORKDIR ./apollos-api
RUN yarn
EXPOSE 4000
CMD [ "yarn", "start:prod" ]