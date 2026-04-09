FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install --production

COPY backend/ ./backend/
COPY frontend/dist ./frontend/public/
COPY backend/src ./backend/src

EXPOSE 3000

CMD ["node", "backend/src/index.js"]