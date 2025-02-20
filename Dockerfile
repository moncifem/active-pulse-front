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

# Set build-time arguments
ARG OPENAI_API_KEY
ARG NEXT_PUBLIC_APP_URL
ARG NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ARG CLERK_SECRET_KEY
ARG GOOGLE_CLIENT_ID
ARG GOOGLE_CLIENT_SECRET
ARG TWILIO_ACCOUNT_SID
ARG TWILIO_AUTH_TOKEN
ARG TWILIO_WHATSAPP_NUMBER
ARG MY_WHATSAPP_NUMBER
ARG NEXT_PUBLIC_ZYPHRA_API_KEY

# Set environment variables
ENV OPENAI_API_KEY=$OPENAI_API_KEY
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL
ENV NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
ENV CLERK_SECRET_KEY=$CLERK_SECRET_KEY
ENV GOOGLE_CLIENT_ID=$GOOGLE_CLIENT_ID
ENV GOOGLE_CLIENT_SECRET=$GOOGLE_CLIENT_SECRET
ENV TWILIO_ACCOUNT_SID=$TWILIO_ACCOUNT_SID
ENV TWILIO_AUTH_TOKEN=$TWILIO_AUTH_TOKEN
ENV TWILIO_WHATSAPP_NUMBER=$TWILIO_WHATSAPP_NUMBER
ENV MY_WHATSAPP_NUMBER=$MY_WHATSAPP_NUMBER
ENV NEXT_PUBLIC_ZYPHRA_API_KEY=$NEXT_PUBLIC_ZYPHRA_API_KEY

# Build the application
RUN npm run build

# Expose the correct port
EXPOSE 8000

# Set the port environment variable
ENV PORT=8000

# Start the application
CMD ["npm", "start"] 