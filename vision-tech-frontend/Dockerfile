# frontend/Dockerfile
FROM node:16-alpine

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Install serve to run the build
RUN npm install -g serve

# Expose port
EXPOSE 3000

# Run the app
CMD ["serve", "-s", "build", "-l", "3000"]