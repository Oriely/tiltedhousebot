# build stage
FROM node:lts as build-stage

WORKDIR /usr/src/app

COPY package*.json .

RUN npm install

RUN npm install -g @vue/cli

COPY . .

CMD ["npm", "run", "build"]

FROM nginx

EXPOSE 8080
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
