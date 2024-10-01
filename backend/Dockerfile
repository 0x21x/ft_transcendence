FROM python:3.12.4-alpine3.20 as build
ENV PYTHONUNBUFFERED 1

ADD /app/requirements.txt requirements.txt

RUN apk add --no-cache --virtual .build-deps                        \
    libffi-dev                                                       \
    gcc                                                             \
    musl-dev                                                        \
    make                                                            \
    && pip install -r requirements.txt                              \
    && find /usr/local                                               \
        \( -type d -a -name test -o -name tests \)                  \
        -o \( -type f -a -name '*.pyc' -o -name '*.pyo' \)          \
        -exec rm -rf '{}' +                                         \
    && runDeps="$(                                                  \
        scanelf --needed --nobanner --recursive /usr/local          \
                | awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }'  \
                | sort -u                                           \
                | xargs -r apk info --installed                     \
                | sort -u                                           \
    )"                                                              \
    && apk add --virtual .rundeps $runDeps                          \
    && apk del .build-deps

FROM python:3.12.4-alpine3.20 as runtime
ENV PYTHONUNBUFFERED 1


RUN apk add --no-cache curl

# Create app directory
RUN mkdir -p /app
ADD app /app
WORKDIR /app

COPY --from=build /usr/local/lib/python3.12/site-packages/ /usr/local/lib/python3.12/site-packages/

RUN mkdir -p /media/avatars && chmod -R 777 /media

ENTRYPOINT ["/app/entrypoint.sh"]