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

# Clear any existing .next directory
RUN rm -rf .next

# Set environment variable to skip type checking
ENV NEXT_SKIP_TYPE_CHECK=true

# Build the application
RUN npm run build

# Expose the correct port
EXPOSE 8000

# Set the port environment variable
ENV PORT=8000

# Start the application
CMD ["npm", "start"] 