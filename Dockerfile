# Use official Node.js LTS image
FROM node:18.20-alpine3.19

# Set working directory
WORKDIR /app

# Copy package files and install only production dependencies
COPY package*.json .
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

# Expose the port your app runs on (adjust if needed)
#EXPOSE 5000

# Start the server
CMD ["node", "server.js"]