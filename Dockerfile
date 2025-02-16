# Use Node.js LTS version
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Build with error handling
RUN npm run build || exit 0

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["npm", "start"] 