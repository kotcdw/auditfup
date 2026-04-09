FROM node:18-alpine

WORKDIR /app

COPY backend/package*.json ./backend/
COPY frontend/package*.json ./frontend/

RUN cd backend && npm install --production

COPY backend/ ./backend/

RUN cd frontend && npm install && npm run build

EXPOSE 3000

CMD ["node", "backend/src/index.js"]