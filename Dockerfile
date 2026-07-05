# Use Node base image
FROM node:18-alpine

# Set working directory
WORKDIR /frontend

# Copy dependency configs
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite server port
EXPOSE 3000

# Start development dev server
CMD ["npm", "run", "dev"]
