# Use official Node.js image
FROM node:20

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Copy hardhat-project directory for postinstall script
COPY hardhat-project/ ./hardhat-project/

# Install dependencies (this will run postinstall script)
RUN npm install

# Copy app source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port (match your app's port)
EXPOSE 2000

# Run the app
CMD ["node", "dist/src/server.js"]
