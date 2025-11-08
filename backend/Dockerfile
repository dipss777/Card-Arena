# Backend Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy shared types
COPY shared /app/shared

# Copy backend package files
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy backend source
COPY backend .

# Build TypeScript
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
