# Stage 1: Build the frontend
FROM node:18-alpine AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Stage 2: Final image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY backend/ ./backend/
COPY --from=frontend-builder /frontend/dist ./frontend/dist

EXPOSE 3001

CMD ["node", "backend/server.js"]