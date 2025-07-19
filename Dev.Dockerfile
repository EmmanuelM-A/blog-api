# Use Node.js official image
FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Start the app
CMD [ "npm", "start" ]
