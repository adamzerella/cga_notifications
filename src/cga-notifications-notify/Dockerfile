FROM node:8.12.0

WORKDIR /app

COPY . /app

RUN yarn install

EXPOSE 4123

CMD [ "yarn", "dev" ]