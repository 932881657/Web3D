FROM node:latest
WORKDIR /machine-socket
COPY package.json /machine-socket/
RUN npm install

COPY . /machine-socket

EXPOSE 9090

CMD [ "npm", "start" ]