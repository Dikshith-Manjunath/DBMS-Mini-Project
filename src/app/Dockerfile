# Use Node.js LTS version
FROM node:20-alpine3.18

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Copy scripts directory
COPY scripts ./scripts

# Copy ORM config and rename it
COPY ormconfig.docker.json ./ormconfig.json

# Make the wait-for-db script executable
RUN chmod +x ./scripts/wait-for-db.sh

# Expose port
EXPOSE 3000

# Build the application
RUN npm run build

# Wait for the database and then start the application
CMD ["./scripts/wait-for-db.sh", "npm", "start"]