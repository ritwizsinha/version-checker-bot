FROM node:14-alpine
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --production
RUN npm cache clean --force
ENV NODE_ENV="production"
COPY ./lib .
CMD [ "npm", "run", "prod" ]
