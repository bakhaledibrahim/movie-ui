# Stage 1: Build the React application
FROM node:20-alpine as builder

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the static files for production
RUN npm run build

# Stage 2: Serve the static files with a lightweight web server (Nginx)
FROM nginx:stable-alpine

# Copy the built static files from the builder stage to the Nginx server directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the port Nginx runs on
EXPOSE 80

# The command to start the Nginx server when the container starts
CMD ["nginx", "-g", "daemon off;"]