# Use official Node.js LTS image
FROM node:alpine

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json .
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose the port your app runs on (adjust if needed)
#EXPOSE 5000

# Start the server
CMD ["node", "src/server.js"]