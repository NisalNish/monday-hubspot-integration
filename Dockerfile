# Use Node.js LTS base image
FROM node:18

# Create app directory
WORKDIR /app

# Copy dependencies first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Expose port
EXPOSE 3000

# Start the app
CMD ["npm", "start"]
