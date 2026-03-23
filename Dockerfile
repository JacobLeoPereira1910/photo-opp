FROM node:24-alpine

RUN apk add --no-cache openssl fontconfig ttf-dejavu

WORKDIR /workspace

COPY scripts/dev-entrypoint.sh /workspace/scripts/dev-entrypoint.sh

RUN chmod +x /workspace/scripts/dev-entrypoint.sh \
  && mkdir -p /workspace/api /workspace/web /workspace/scripts
