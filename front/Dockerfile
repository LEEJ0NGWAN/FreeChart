FROM node:14.8.0-alpine
USER root

# arg
ARG REACT_APP_API_HOST
ENV REACT_APP_API_HOST ${REACT_APP_API_HOST}

# work dir
RUN mkdir /front
WORKDIR /front

ADD . /front/

# copy project
RUN yarn
RUN yarn build

