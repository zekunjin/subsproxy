FROM alpine:3.16

RUN apk update && \
    apk add nodejs npm

RUN apk add sqlite sqlite-libs sqlite-dev

WORKDIR /src

COPY . .
RUN npm i dotenv -g
RUN npm i && npm run build
RUN mv ./.output /.output
RUN mv ./templates /.output/templates
RUN mv ./prisma/schema.prisma /.output/schema.prisma
RUN rm -rf /src

WORKDIR /.output

EXPOSE 3000
EXPOSE 5555

CMD ["node", "-r", "dotenv/config", "/.output/server/index.mjs"]
