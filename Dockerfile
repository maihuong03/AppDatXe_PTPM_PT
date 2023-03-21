FROM node:16-slim
WORKDIR /usr/src/app
ENV TEST_TEXT="DOKCKER FILE"
COPY package.json .
COPY yarn.lock .
RUN yarn
COPY . .
EXPOSE 3000
CMD ["yarn", "start"]