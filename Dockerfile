# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port (match your app's port)
EXPOSE 2000

# Run the app
CMD ["node", "dist/src/server.js"]js image
FROM node:20

# Create app directory
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy app source code
COPY . .

# Expose port (match your app’s port)
EXPOSE 2000

# Run the app
CMD ["node", "dist/src/server.js"]
