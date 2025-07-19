# Use a specific Node.js version for consistency
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files first to leverage Docker cache
COPY package*.json ./

# Install app dependencies
RUN npm install --production --omit=dev

# Copy the rest of the application
COPY . .

# Expose the port your app listens on
EXPOSE 5000

# Define the default command to run the app
CMD ["npm", "start"]