FROM node:26

WORKDIR /app

RUN --mount=type=cache,target=/root/.npm \
    --mount=type=bind,source=package.json,target=package.json \
    npm install

COPY . .
RUN npm run parseStmInfo
RUN npm run build

EXPOSE 8080

CMD [ "node", "--env-file=.env", "scripts/server.js" ]