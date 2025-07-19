# Use Node.js official image
FROM node:alpine

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./
RUN npm install

# Copy app source code
COPY . .

# Expose the port your app listens on
EXPOSE 5000

# Start the app
CMD [ "npm", "run", "dev" ]
