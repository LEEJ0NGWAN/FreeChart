FROM node:14.8.0-alpine
USER root

# work dir
RUN mkdir /front
WORKDIR /front

ADD . /front/

# copy project
RUN yarn
RUN yarn build

