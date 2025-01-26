# Build stage
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Runtime stage
FROM node:18-alpine
WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache build-base python3

# Copy built files and LKH binary
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/src ./src
COPY --from=builder /app/lkh/LKH /app/lkh/LKH

# Security hardening
RUN addgroup -S lkh && adduser -S lkh -G lkh
USER lkh

EXPOSE 3000
CMD ["npm", "start"]