FROM node:alpine as build-deps
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install -f
COPY . ./
RUN npm run build


FROM nginx:mainline-alpine
COPY --from=build-deps /usr/src/app/build /usr/share/nginx/html
