FROM alpine:edge

COPY bin/start /start

CMD ["/start"]
