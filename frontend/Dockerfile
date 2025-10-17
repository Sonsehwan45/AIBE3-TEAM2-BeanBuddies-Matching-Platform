# Stage 1: Build the Next.js application
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build-time envs for Vite (prefixed with VITE_) 전달 가능
# docker build --build-arg VITE_API_BASE_URL=https://api.example.com .
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

# Build the application (Vite는 VITE_ 접두사의 env를 정적으로 치환합니다)
RUN npm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copy the built assets from the builder stage
COPY --from=builder /app/out /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]