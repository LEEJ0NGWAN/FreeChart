# python 3.7.6
FROM python:3.7.6-alpine

# # arg
# ARG MODE
# ARG SECRET_KEY
# ARG DB_HOST
# ARG DB_USER
# ARG DB_PASSWORD
# ARG EMAIL_HOST_USER
# ARG EMAIL_HOST_PASSWORD
# ARG DEV_DB_HOST

# # env setting
# ENV PYTHONDONTWRITEBYTECODE 1
# ENV PYTHONUNBUFFERED 1
# ENV MODE ${MODE}
# ENV SECRET_KEY ${SECRET_KEY}
# ENV DB_HOST ${DB_HOST}
# ENV DB_USER ${DB_USER}
# ENV DB_PASSWORD ${DB_PASSWORD}
# ENV EMAIL_HOST_USER ${EMAIL_HOST_USER}
# ENV EMAIL_HOST_PASSWORD ${EMAIL_HOST_PASSWORD}
# ENV DEV_DB_HOST ${DEV_DB_HOST}

# work dir
RUN mkdir /back
WORKDIR /back

# pip install
ADD requirements.txt /back/
RUN pip install --upgrade pip
RUN \
 apk add --no-cache postgresql-libs && \
 apk add --no-cache --virtual .build-deps gcc musl-dev postgresql-dev && \
 python3 -m pip install -r requirements.txt --no-cache-dir && \
 apk --purge del .build-deps

# copy project
ADD . /back/

EXPOSE 8000

ENTRYPOINT ["sh", "/back/docker-entrypoint.sh"]
