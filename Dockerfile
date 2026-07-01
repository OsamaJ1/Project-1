# Stage 1: Build the application
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the NestJS application
RUN npm run build

# Stage 2: Production image
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy only the package.json and package-lock.json
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the built application from the builder stage
COPY --from=builder /usr/src/app/dist ./dist

# Expose the application port (assuming the app runs on port 5000 or 3000)
# Update this if your app listens on a different port internally
EXPOSE 5000

# Start the application
CMD ["npm", "run", "start:prod"]
