# backend/Dockerfile

# Step 1: Use a lightweight Node.js image
FROM node:20-slim

# Step 2: Create app directory
WORKDIR /usr/src/app

# Step 3: Install app dependencies
# Copying package files first allows Docker to cache the npm install layer
COPY package*.json ./
RUN npm install --only=production

# Step 4: Bundle app source
COPY . .

# Step 5: Expose the port the app runs on
EXPOSE 3000

# Step 6: Define the command to run your app
# Using 'node' directly is preferred over 'npm start' in production for better signal handling
CMD [ "node", "index.js" ]