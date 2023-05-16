FROM node:alpine

# Create app directory
RUN mkdir -p /app

WORKDIR /app

# COPY package.json .
# For npm@5 or later, copy package-lock.json as well
COPY package.json yarn.lock ./

# Install app dependencies
RUN yarn install

# Bundle app source
COPY . .

EXPOSE 8000

# Start Node server
CMD [ "yarn", "start" ]